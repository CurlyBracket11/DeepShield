# ============================================================
# DEEPSHIELD-AI — REAL QR → ASSISTANT INTEGRATION TEST
# ============================================================

from pathlib import Path
import sys

# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# ============================================================
# IMPORTS
# ============================================================

from ai.qr.qr_service import analyze_qr
from services.assistant.assistant_service import AssistantService


# ============================================================
# QR IMAGE
# ============================================================

QR_IMAGE = r"C:\Users\saksh\OneDrive\Desktop\suspicious_qr.png"


# ============================================================
# TEST
# ============================================================

print("=" * 70)
print("DEEPSHIELD-AI — REAL QR ASSISTANT INTEGRATION")
print("=" * 70)

print()
print("Project root:", PROJECT_ROOT)

print()
print("Running real QR analyzer...")

qr_result = analyze_qr(QR_IMAGE)


# ============================================================
# NORMALIZE RESULT
# ============================================================

assistant_input = {
    "modality": "qr",

    "filename": Path(QR_IMAGE).name,

    "prediction": qr_result.get(
        "prediction",
        "UNKNOWN"
    ),

    "risk_score": qr_result.get(
        "risk_score",
        0.0
    ),

    "risk_level": qr_result.get(
        "risk_level",
        "N/A"
    ),

    "security_findings": qr_result.get(
        "findings",
        qr_result.get(
            "security_findings",
            []
        )
    )
}


# ============================================================
# ASSISTANT
# ============================================================

print()
print("Sending real QR result to Assistant...")

assistant = AssistantService(
    enable_voice=True
)

assistant_result = assistant.analyze(
    assistant_input
)


# ============================================================
# RESULT
# ============================================================

print()
print("=" * 70)
print("REAL QR → ASSISTANT RESULT")
print("=" * 70)

print(
    "Modality    :",
    assistant_result["modality"]
)

print(
    "Prediction  :",
    assistant_result["prediction"]
)

print(
    "Risk Score  :",
    assistant_result["risk_score"]
)

print(
    "Risk Level  :",
    assistant_result["risk_level"]
)

print(
    "Voice       :",
    assistant_result["voice_enabled"]
)

print()
print("Assistant Summary:")
print(
    assistant_result["summary"]
)

print("=" * 70)