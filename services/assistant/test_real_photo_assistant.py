# ============================================================
# DEEPSHIELD-AI — REAL PHOTO ASSISTANT TEST
# ============================================================

import sys
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.photo.inference import predict_photo
from services.assistant.assistant_service import analyze_with_assistant


# ============================================================
# PHOTO PATH
# ============================================================

PHOTO_PATH = Path(
    r"C:\Users\saksh\OneDrive\Desktop\test_photo.jpg"
)


# ============================================================
# CHECK FILE
# ============================================================

if not PHOTO_PATH.exists():

    print()
    print("ERROR: Photo not found.")
    print(f"Expected path: {PHOTO_PATH}")
    print()
    print("Put your test photo at that location and run again.")
    sys.exit(1)


# ============================================================
# PHOTO ANALYSIS
# ============================================================

print("=" * 70)
print("DEEPSHIELD-AI — REAL PHOTO → ASSISTANT TEST")
print("=" * 70)

print()
print(f"Photo: {PHOTO_PATH.name}")
print()

result = predict_photo(
    str(PHOTO_PATH)
)


# ============================================================
# NORMALIZE RESULT FOR ASSISTANT
# ============================================================

result["modality"] = "photo"
result["filename"] = PHOTO_PATH.name


# ============================================================
# ASSISTANT
# ============================================================

assistant_result = analyze_with_assistant(
    result
)


# ============================================================
# OUTPUT
# ============================================================

print()
print("=" * 70)
print("FINAL ASSISTANT RESULT")
print("=" * 70)

print(
    f"Modality   : {assistant_result['modality']}"
)

print(
    f"Prediction : {assistant_result['prediction']}"
)

print(
    f"Risk Score : {assistant_result['risk_score']}"
)

print(
    f"Risk Level : {assistant_result['risk_level']}"
)

print()
print("Assistant:")
print(
    assistant_result["summary"]
)

print()
print(
    f"Voice      : {assistant_result['voice_enabled']}"
)

print("=" * 70)
print("REAL PHOTO ASSISTANT TEST COMPLETED")
print("=" * 70)