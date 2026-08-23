import qrcode
import json
from src.qr_analyzer import QRAnalyzer

def generate_sample_qr(text, filename):
    img = qrcode.make(text)
    img.save(filename)

if __name__ == "__main__":
    sample_file = "test_suspicious_qr.png"
    generate_sample_qr("http://192.168.1.50:8080/login.php?user=verify.top", sample_file)
    print(f"[+] Created sample QR code: {sample_file}")

    analyzer = QRAnalyzer()
    results = analyzer.process(sample_file)
    
    print("\n[+] QR ANALYSIS RESULT:")
    print(json.dumps(results, indent=4))