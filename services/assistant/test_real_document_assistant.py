# ============================================================
# DEEPSHIELD-AI — REAL DOCUMENT + ASSISTANT TEST
# ============================================================

import sys
from pathlib import Path


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# IMPORTS
# ============================================================

from ai.document.document_service import analyze_document
from services.assistant.assistant_service import AssistantService


# ============================================================
# DOCUMENT PATH
# ============================================================

DOCUMENT_PATH = Path(
    r"C:\Users\saksh\OneDrive\Desktop\normal_document.png"
)


# ============================================================
# MAIN TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — REAL DOCUMENT ASSISTANT TEST")
    print("=" * 70)

    print()
    print(f"Document : {DOCUMENT_PATH}")
    print()

    # --------------------------------------------------------
    # Step 1 — Real Document AI
    # --------------------------------------------------------

    print("=" * 70)
    print("STEP 1 — DOCUMENT AI ANALYSIS")
    print("=" * 70)

    result = analyze_document(
        DOCUMENT_PATH
    )

    print()
    print("Document analysis completed.")

    print()
    print("Prediction :", result.get("prediction"))
    print("Risk Score :", result.get("risk_score"))
    print("Risk Level :", result.get("risk_level"))

    # --------------------------------------------------------
    # Step 2 — Assistant
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("STEP 2 — SECURITY ASSISTANT")
    print("=" * 70)

    assistant = AssistantService(
        enable_voice=True
    )

    assistant_result = assistant.analyze(
        result
    )

    print()
    print("ASSISTANT RESULT:")
    print(assistant_result)

    print()
    print("=" * 70)
    print("REAL DOCUMENT ASSISTANT TEST COMPLETED")
    print("=" * 70)