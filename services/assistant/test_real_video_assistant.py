# ============================================================
# DEEPSHIELD-AI — REAL VIDEO + ASSISTANT TEST
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

from services.video.video_inference import VideoInference
from services.assistant.assistant_service import AssistantService


# ============================================================
# VIDEO PATH
# ============================================================

VIDEO_PATH = Path(
    r"C:\Users\saksh\OneDrive\Desktop\test_video.mp4"
)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — REAL VIDEO ASSISTANT TEST")
    print("=" * 70)

    print()
    print(f"Video : {VIDEO_PATH}")

    # --------------------------------------------------------
    # Step 1 — Real Video AI
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("STEP 1 — VIDEO AI ANALYSIS")
    print("=" * 70)

    inference = VideoInference()

    result = inference.predict(
        str(VIDEO_PATH)
    )

    print()
    print("VIDEO RESULT:")
    print(result)

    # --------------------------------------------------------
    # Ensure modality exists
    # --------------------------------------------------------

    if "modality" not in result:
        result["modality"] = "video"

    if "filename" not in result:
        result["filename"] = VIDEO_PATH.name

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
    print("REAL VIDEO ASSISTANT TEST COMPLETED")
    print("=" * 70)