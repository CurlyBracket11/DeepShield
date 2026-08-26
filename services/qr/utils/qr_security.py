# ============================================================
# DEEPSHIELD-AI — QR SECURITY ANALYZER
# ============================================================

import re
from urllib.parse import urlparse


# ============================================================
# PAYLOAD CLASSIFICATION
# ============================================================

def classify_payload(data):

    data = data.strip()

    # --------------------------------------------------------
    # URL
    # --------------------------------------------------------

    if re.match(
        r"^https?://",
        data,
        re.IGNORECASE
    ):
        return "URL"

    # --------------------------------------------------------
    # UPI
    # --------------------------------------------------------

    if data.lower().startswith("upi://"):
        return "UPI PAYMENT"

    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    if re.match(
        r"^mailto:",
        data,
        re.IGNORECASE
    ):
        return "EMAIL"

    if re.match(
        r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        data
    ):
        return "EMAIL"

    # --------------------------------------------------------
    # PHONE
    # --------------------------------------------------------

    if re.match(
        r"^(tel:|\+?[0-9][0-9\s\-]{7,})$",
        data,
        re.IGNORECASE
    ):
        return "PHONE"

    # --------------------------------------------------------
    # TEXT
    # --------------------------------------------------------

    return "TEXT"


# ============================================================
# URL SECURITY ANALYSIS
# ============================================================

def analyze_url(url):

    findings = []

    try:

        parsed = urlparse(url)

        hostname = (
            parsed.hostname or ""
        ).lower()

        path = (
            parsed.path or ""
        ).lower()

        query = (
            parsed.query or ""
        ).lower()

        url_lower = url.lower()

        # ----------------------------------------------------
        # Invalid / missing hostname
        # ----------------------------------------------------

        if not hostname:

            findings.append({
                "severity": "MEDIUM",
                "message": "QR URL does not contain a valid destination hostname."
            })

            return findings

        # ----------------------------------------------------
        # HTTP instead of HTTPS
        # ----------------------------------------------------

        if parsed.scheme.lower() == "http":

            findings.append({
                "severity": "MEDIUM",
                "message": "QR code redirects to a non-encrypted HTTP URL."
            })

        # ----------------------------------------------------
        # IP address instead of domain
        # ----------------------------------------------------

        if re.match(
            r"^\d{1,3}(\.\d{1,3}){3}$",
            hostname
        ):

            findings.append({
                "severity": "HIGH",
                "message": "QR URL uses a raw IP address instead of a normal domain."
            })

        # ----------------------------------------------------
        # URL shorteners
        # ----------------------------------------------------

        shorteners = {
            "bit.ly",
            "tinyurl.com",
            "t.co",
            "goo.gl",
            "is.gd",
            "ow.ly",
            "buff.ly",
            "cutt.ly",
            "rb.gy",
            "shorturl.at",
            "rebrand.ly"
        }

        if hostname in shorteners:

            findings.append({
                "severity": "MEDIUM",
                "message": "QR URL uses a URL-shortening service."
            })

        # ----------------------------------------------------
        # Suspicious URL words
        # ----------------------------------------------------

        suspicious_words = [
            "verify",
            "verification",
            "login",
            "signin",
            "sign-in",
            "secure",
            "account",
            "password",
            "credential",
            "credentials",
            "payment",
            "pay",
            "confirm",
            "update",
            "unlock",
            "suspend",
            "suspended",
            "otp",
            "bank",
            "wallet",
            "billing"
        ]

        found_words = []

        for word in suspicious_words:

            if word in url_lower:

                found_words.append(
                    word
                )

        if found_words:

            findings.append({
                "severity": "HIGH",
                "message": (
                    "QR URL contains potentially sensitive "
                    "security or payment-related keywords."
                )
            })

        # ----------------------------------------------------
        # Urgent action keywords in URL
        # ----------------------------------------------------

        urgent_words = [
            "urgent",
            "immediately",
            "act-now",
            "actnow",
            "expires",
            "deadline"
        ]

        if any(
            word in url_lower
            for word in urgent_words
        ):

            findings.append({
                "severity": "HIGH",
                "message": (
                    "QR URL contains potentially risky "
                    "urgent-action language."
                )
            })

        # ----------------------------------------------------
        # Credential-related URL parameters
        # ----------------------------------------------------

        credential_parameters = [
            "password",
            "passwd",
            "pwd",
            "username",
            "user",
            "login",
            "credential",
            "token",
            "otp",
            "pin"
        ]

        if any(
            parameter in query
            for parameter in credential_parameters
        ):

            findings.append({
                "severity": "HIGH",
                "message": (
                    "QR URL contains parameters associated "
                    "with credential or authentication data."
                )
            })

        # ----------------------------------------------------
        # Payment-related URL parameters
        # ----------------------------------------------------

        payment_parameters = [
            "amount",
            "payment",
            "pay",
            "upi",
            "bank",
            "account"
        ]

        if any(
            parameter in query
            for parameter in payment_parameters
        ):

            findings.append({
                "severity": "MEDIUM",
                "message": (
                    "QR URL contains payment or financial "
                    "transaction-related parameters."
                )
            })

        # ----------------------------------------------------
        # Suspicious hostname patterns
        # ----------------------------------------------------

        if hostname.count(".") >= 3:

            findings.append({
                "severity": "MEDIUM",
                "message": (
                    "QR URL contains an unusually deep "
                    "subdomain structure."
                )
            })

        # ----------------------------------------------------
        # Suspicious hyphen-heavy hostname
        # ----------------------------------------------------

        if hostname.count("-") >= 3:

            findings.append({
                "severity": "MEDIUM",
                "message": (
                    "QR URL hostname contains an unusually "
                    "high number of hyphens."
                )
            })

        # ----------------------------------------------------
        # @ symbol / userinfo
        # ----------------------------------------------------

        if "@" in url:

            findings.append({
                "severity": "HIGH",
                "message": (
                    "QR URL contains an @ symbol that may "
                    "obscure the actual destination."
                )
            })

        # ----------------------------------------------------
        # Explicit username/password in URL
        # ----------------------------------------------------

        if parsed.username or parsed.password:

            findings.append({
                "severity": "HIGH",
                "message": (
                    "QR URL contains embedded user credentials "
                    "before the destination hostname."
                )
            })

        # ----------------------------------------------------
        # Suspicious executable/script-like URL
        # ----------------------------------------------------

        suspicious_extensions = [
            ".exe",
            ".scr",
            ".bat",
            ".cmd",
            ".ps1",
            ".apk",
            ".msi"
        ]

        if any(
            path.endswith(extension)
            for extension in suspicious_extensions
        ):

            findings.append({
                "severity": "HIGH",
                "message": (
                    "QR URL points to a potentially executable "
                    "or installable file."
                )
            })

    except Exception:

        findings.append({
            "severity": "MEDIUM",
            "message": "QR URL could not be fully parsed."
        })

    return findings


# ============================================================
# TEXT SECURITY ANALYSIS
# ============================================================

def analyze_text_payload(data):

    findings = []

    text = data.lower()

    # --------------------------------------------------------
    # Urgency
    # --------------------------------------------------------

    urgency_patterns = [
        "urgent",
        "immediately",
        "act now",
        "act-now",
        "expires",
        "within 24 hours",
        "last warning",
        "final warning",
        "do not delay"
    ]

    if any(
        pattern in text
        for pattern in urgency_patterns
    ):

        findings.append({
            "severity": "HIGH",
            "message": (
                "QR payload contains potentially risky "
                "urgent-action language."
            )
        })

    # --------------------------------------------------------
    # Account threats
    # --------------------------------------------------------

    account_patterns = [
        "account will be closed",
        "account suspended",
        "account blocked",
        "account will be suspended",
        "verify your account",
        "confirm your account",
        "account termination",
        "account disabled"
    ]

    if any(
        pattern in text
        for pattern in account_patterns
    ):

        findings.append({
            "severity": "HIGH",
            "message": (
                "QR payload contains potentially risky "
                "account-threat language."
            )
        })

    # --------------------------------------------------------
    # Credential requests
    # --------------------------------------------------------

    credential_patterns = [
        "enter your password",
        "enter password",
        "username and password",
        "verify your password",
        "enter otp",
        "enter your otp",
        "enter pin",
        "enter your pin",
        "credit card number",
        "card number",
        "cvv",
        "credential",
        "credentials"
    ]

    if any(
        pattern in text
        for pattern in credential_patterns
    ):

        findings.append({
            "severity": "HIGH",
            "message": (
                "QR payload appears to request "
                "sensitive credentials."
            )
        })

    # --------------------------------------------------------
    # Payment requests
    # --------------------------------------------------------

    payment_patterns = [
        "payment required",
        "make payment",
        "pay now",
        "send money",
        "transfer money",
        "bank transfer",
        "pay immediately",
        "payment due",
        "upi payment"
    ]

    if any(
        pattern in text
        for pattern in payment_patterns
    ):

        findings.append({
            "severity": "HIGH",
            "message": (
                "QR payload contains potentially risky "
                "payment instructions."
            )
        })

    # --------------------------------------------------------
    # Suspicious instruction language
    # --------------------------------------------------------

    instruction_patterns = [
        "click here",
        "scan now",
        "verify now",
        "login now",
        "download now",
        "install now",
        "open this link"
    ]

    if any(
        pattern in text
        for pattern in instruction_patterns
    ):

        findings.append({
            "severity": "MEDIUM",
            "message": (
                "QR payload contains potentially suspicious "
                "instruction language."
            )
        })

    return findings


# ============================================================
# UPI SECURITY ANALYSIS
# ============================================================

def analyze_upi_payload(data):

    findings = []

    findings.append({
        "severity": "MEDIUM",
        "message": "QR code contains a UPI payment payload."
    })

    data_lower = data.lower()

    # --------------------------------------------------------
    # Amount detection
    # --------------------------------------------------------

    amount_match = re.search(
        r"(?:[?&](?:am|amount)=)([0-9]+(?:\.[0-9]+)?)",
        data_lower
    )

    if amount_match:

        amount = float(
            amount_match.group(1)
        )

        if amount >= 10000:

            findings.append({
                "severity": "HIGH",
                "message": (
                    f"QR payment payload requests a "
                    f"transaction amount of {amount:.2f}."
                )
            })

    # --------------------------------------------------------
    # Payment parameters
    # --------------------------------------------------------

    if "pa=" in data_lower:

        findings.append({
            "severity": "LOW",
            "message": (
                "QR payment payload contains a payment "
                "address."
            )
        })

    return findings


# ============================================================
# GENERAL PAYLOAD SECURITY ANALYSIS
# ============================================================

def analyze_payload(data):

    payload_type = classify_payload(
        data
    )

    findings = []

    # --------------------------------------------------------
    # URL
    # --------------------------------------------------------

    if payload_type == "URL":

        findings.extend(
            analyze_url(data)
        )

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    elif payload_type == "TEXT":

        findings.extend(
            analyze_text_payload(data)
        )

    # --------------------------------------------------------
    # UPI
    # --------------------------------------------------------

    elif payload_type == "UPI PAYMENT":

        findings.extend(
            analyze_upi_payload(data)
        )

        findings.extend(
            analyze_text_payload(data)
        )

    # --------------------------------------------------------
    # Email
    # --------------------------------------------------------

    elif payload_type == "EMAIL":

        findings.append({
            "severity": "LOW",
            "message": (
                "QR code contains an email destination."
            )
        })

    # --------------------------------------------------------
    # Phone
    # --------------------------------------------------------

    elif payload_type == "PHONE":

        findings.append({
            "severity": "LOW",
            "message": (
                "QR code contains a phone destination."
            )
        })

    return {
        "payload_type": payload_type,
        "findings": findings
    }