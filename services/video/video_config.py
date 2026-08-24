# ============================================================
# DEEPSHIELD-AI — VIDEO MODEL CONFIGURATION
# ============================================================

from pathlib import Path
import torch


# ------------------------------------------------------------
# PROJECT ROOT
# ------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]


# ------------------------------------------------------------
# MODEL SETTINGS
# ------------------------------------------------------------

NUM_FRAMES = 16

FRAME_SIZE = 224

NUM_CLASSES = 2


# ------------------------------------------------------------
# CLASS LABELS
# ------------------------------------------------------------

CLASS_NAMES = {
    0: "FAKE",
    1: "REAL"
}


# ------------------------------------------------------------
# MODEL CHECKPOINT
# ------------------------------------------------------------

MODEL_PATH = (
    PROJECT_ROOT
    / "services"
    / "video"
    / "models"
    / "video_resnet18_lstm_balanced_best.pth"
)


# ------------------------------------------------------------
# DEVICE
# ------------------------------------------------------------

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ------------------------------------------------------------
# VERIFICATION
# ------------------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Video model checkpoint not found: {MODEL_PATH}"
    )


print("=" * 70)
print("DEEPSHIELD-AI — VIDEO CONFIGURATION")
print("=" * 70)

print(f"Project Root : {PROJECT_ROOT}")
print(f"Model Path   : {MODEL_PATH}")
print(f"Model Exists : {MODEL_PATH.exists()}")
print(f"Frames       : {NUM_FRAMES}")
print(f"Frame Size   : {FRAME_SIZE}")
print(f"Classes      : {CLASS_NAMES}")
print(f"Device       : {DEVICE}")

print("=" * 70)