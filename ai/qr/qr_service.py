# ============================================================
# DEEPSHIELD-AI — QR SERVICE
# ============================================================

import sys
from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# QR ANALYZER
# ============================================================

from ai.qr.qr_analyzer import QRAnalyzer


# ============================================================
# ANALYZER INSTANCE
# ============================================================

_analyzer = QRAnalyzer()


# ============================================================
# QR ANALYSIS SERVICE
# ============================================================

def analyze_qr(image_path):
    """
    Analyze a QR-code image using DeepShield-AI QR Analyzer.

    Parameters
    ----------
    image_path : str or Path
        Path to QR image.

    Returns
    -------
    dict
        Complete QR analysis result.
    """

    image_path = Path(image_path)

    return _analyzer.analyze(
        image_path
    )


# ============================================================
# HEALTH CHECK
# ============================================================

def health_check():

    return {
        "service": "qr",
        "status": "ready",
        "supported_formats": [
            ".png",
            ".jpg",
            ".jpeg",
            ".bmp",
            ".webp"
        ]
    }


# ============================================================
# SERVICE INFORMATION
# ============================================================

def get_service_info():

    return {
        "service": "DeepShield-AI QR Service",
        "version": "1.0",
        "task": "QR Code Security and Risk Analysis",

        "features": [
            "QR code detection",
            "QR payload decoding",
            "URL analysis",
            "UPI payment analysis",
            "Email detection",
            "Phone detection",
            "Text payload analysis",
            "Suspicious keyword detection",
            "Credential request detection",
            "Payment request detection",
            "URL shortener detection",
            "IP address detection",
            "Risk scoring",
            "Risk classification",
            "Explainability"
        ],

        "supported_formats": [
            ".png",
            ".jpg",
            ".jpeg",
            ".bmp",
            ".webp"
        ]
    }


# ============================================================
# BASIC SERVICE TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — QR SERVICE")
    print("=" * 70)

    print()
    print("Service status : READY")
    print("Service        : QR AI")
    print("Version        : 1.0")

    print()
    print("Supported formats:")

    for extension in health_check()["supported_formats"]:
        print(f"  - {extension}")

    print()
    print("Features:")

    for feature in get_service_info()["features"]:
        print(f"  - {feature}")

    print()
    print("=" * 70)
    print("QR service loaded successfully.")
    print("=" * 70)