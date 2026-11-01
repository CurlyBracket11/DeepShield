# ============================================================
# DEEPSHIELD-AI — DOCUMENT SERVICE
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
# DOCUMENT ANALYZER
# ============================================================

from ai.document.document_analyzer import DocumentAnalyzer


# ============================================================
# ANALYZER INSTANCE
# ============================================================

_analyzer = DocumentAnalyzer()


# ============================================================
# DOCUMENT ANALYSIS SERVICE
# ============================================================

def analyze_document(document_path):
    """
    Analyze a document using the DeepShield-AI
    Document Analyzer.

    Parameters
    ----------
    document_path : str or Path
        Path to the document.

    Returns
    -------
    dict
        Complete DeepShield-AI document analysis result.
    """

    document_path = Path(document_path)

    result = _analyzer.analyze(
        document_path
    )

    return result


# ============================================================
# HEALTH CHECK
# ============================================================

def health_check():
    """
    Basic service health check.
    """

    return {
        "service": "document",
        "status": "ready",
        "supported_formats": [
            ".pdf",
            ".docx",
            ".doc",
            ".txt",
            ".jpg",
            ".jpeg",
            ".png"
        ]
    }


# ============================================================
# MODEL / SERVICE INFORMATION
# ============================================================

def get_service_info():

    return {
        "service": "DeepShield-AI Document Service",
        "version": "1.0",
        "task": "Document Authenticity and Security Analysis",
        "features": [
            "Text extraction",
            "OCR",
            "PDF analysis",
            "Document metadata analysis",
            "Suspicious language detection",
            "Security indicator detection",
            "Risk scoring",
            "Risk classification",
            "Explainability"
        ],
        "supported_formats": [
            ".pdf",
            ".docx",
            ".doc",
            ".txt",
            ".jpg",
            ".jpeg",
            ".png"
        ]
    }


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — DOCUMENT SERVICE")
    print("=" * 70)

    print()
    print("Service status : READY")
    print("Service        : Document AI")
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
    print("Document service loaded successfully.")
    print("=" * 70)