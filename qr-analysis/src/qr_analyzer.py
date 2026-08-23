import re
import math
import socket
import requests
from urllib.parse import urlparse

class QRAnalyzer:
    def __init__(self):
        try:
            import cv2
            self.detector = cv2.QRCodeDetector()
        except ImportError:
            self.detector = None

        self.suspicious_tlds = ['.zip', '.mov', '.top', '.xyz', '.work', '.click', '.gq', '.tk', '.fit']
        self.phishing_keywords = ['login', 'verify', 'account', 'secure', 'banking', 'update', 'claim', 'free', 'wallet', 'crypto', 'signin', 'auth']

    def decode_qr(self, image_path: str) -> str:
        """Extracts payload string from a QR image."""
        import cv2
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Unable to read image file.")
        
        payload, _, _ = self.detector.detectAndDecode(img)
        if not payload:
            raise ValueError("No valid QR code detected in the image.")
        return payload

    def _calculate_entropy(self, text: str) -> float:
        """Calculates Shannon entropy to detect randomized or obfuscated URLs."""
        if not text:
            return 0.0
        entropy = 0.0
        for char in set(text):
            p_x = float(text.count(char)) / len(text)
            entropy -= p_x * math.log2(p_x)
        return round(entropy, 2)

    def _unmask_redirects(self, url: str) -> tuple[str, list]:
        """Follows redirect chains to unmask short links (e.g. bit.ly, tinyurl)."""
        redirect_chain = []
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            response = requests.head(url, allow_redirects=True, timeout=3, headers=headers)
            final_url = response.url
            if response.history:
                redirect_chain = [r.url for r in response.history]
            return final_url, redirect_chain
        except Exception:
            return url, redirect_chain

    def _check_dns_resolution(self, hostname: str) -> bool:
        """Verifies if the domain actually resolves to an IP address."""
        try:
            socket.gethostbyname(hostname)
            return True
        except socket.error:
            return False

    def analyze_url_risk(self, payload: str) -> dict:
        findings = []
        risk_points = 0

        is_url = payload.startswith(("http://", "https://", "www."))
        if not is_url:
            return {
                "prediction": "TEXT_PAYLOAD",
                "confidence": 1.0,
                "risk_level": "LOW",
                "explanation": "Payload contains standard text, not a web link.",
                "important_findings": ["No remote link vector detected."],
                "payload": payload
            }

        initial_url = payload if payload.startswith("http") else "http://" + payload
        
        # Signal 1: Active Redirect Unmasking
        final_url, redirect_chain = self._unmask_redirects(initial_url)
        if redirect_chain:
            risk_points += 25
            findings.append(f"Shortened/redirected URL unmasked across {len(redirect_chain)} hops.")

        parsed = urlparse(final_url)
        hostname = parsed.hostname or ""

        # Signal 2: DNS Resolution Check
        if hostname and not self._check_dns_resolution(hostname):
            risk_points += 30
            findings.append("Domain failed DNS resolution (non-existent or offline domain).")

        # Signal 3: Raw IP Hostname
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
            risk_points += 40
            findings.append("Uses raw IP address instead of registered domain name.")

        # Signal 4: Suspicious TLD
        if any(hostname.endswith(tld) for tld in self.suspicious_tlds):
            risk_points += 30
            findings.append("Uses high-risk Top-Level Domain (TLD).")

        # Signal 5: Social Engineering / Phishing Keywords
        matched_keywords = [kw for kw in self.phishing_keywords if kw in final_url.lower()]
        if matched_keywords:
            risk_points += 20
            findings.append(f"Contains high-risk phishing keywords: {', '.join(matched_keywords)}.")

        # Signal 6: Shannon Entropy (Obfuscation Detection)
        entropy = self._calculate_entropy(final_url)
        if entropy > 4.5:
            risk_points += 20
            findings.append(f"High character entropy ({entropy}) indicating link obfuscation or token tracking.")

        # Signal 7: Unencrypted HTTP Protocol
        if parsed.scheme == "http":
            risk_points += 15
            findings.append("Unencrypted connection (HTTP instead of HTTPS).")

        fake_probability = min(risk_points / 100.0, 0.99)
        authentic_probability = round(1.0 - fake_probability, 2)

        if risk_points >= 50:
            risk_level, prediction = "CRITICAL", "MALICIOUS_QR"
        elif risk_points >= 25:
            risk_level, prediction = "HIGH", "SUSPICIOUS_QR"
        else:
            risk_level, prediction = "LOW", "AUTHENTIC_QR"
            findings.append("Standard URL structure and secure protocol verified.")

        return {
            "prediction": prediction,
            "confidence": round(max(fake_probability, authentic_probability), 2),
            "risk_level": risk_level,
            "explanation": f"Security engine identified {len(findings)} structural & active risk factors.",
            "important_findings": findings,
            "payload": final_url,
            "redirect_history": redirect_chain
        }

    def process(self, image_path: str) -> dict:
        payload = self.decode_qr(image_path)
        return self.analyze_url_risk(payload)