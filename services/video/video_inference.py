# ============================================================
# DEEPSHIELD-AI — VIDEO INFERENCE ENGINE
# ============================================================

import sys
from pathlib import Path

# ------------------------------------------------------------
# Make services/video importable
# ------------------------------------------------------------

VIDEO_DIR = Path(__file__).resolve().parent

if str(VIDEO_DIR) not in sys.path:
    sys.path.insert(0, str(VIDEO_DIR))


# ------------------------------------------------------------
# Imports
# ------------------------------------------------------------

import torch

from video_config import (
    DEVICE,
    CLASS_NAMES
)

from video_model import (
    load_video_model
)

from utils.video_preprocessor import (
    extract_video_frames
)


# ============================================================
# VIDEO INFERENCE CLASS
# ============================================================

class VideoInference:

    def __init__(self):

        print("=" * 70)
        print("DEEPSHIELD-AI — INITIALIZING VIDEO INFERENCE")
        print("=" * 70)

        self.device = DEVICE

        self.model = load_video_model()

        self.model.eval()

        print("Video model loaded successfully.")
        print(f"Device: {self.device}")

        print("=" * 70)

    # --------------------------------------------------------
    # Predict
    # --------------------------------------------------------

    def predict(self, video_path):

        video_path = Path(video_path)

        if not video_path.exists():

            raise FileNotFoundError(
                f"Video not found: {video_path}"
            )

        # ----------------------------------------------------
        # Extract frames
        # ----------------------------------------------------

        video_tensor = extract_video_frames(
            video_path
        )

        # ----------------------------------------------------
        # Add batch dimension
        # [16, 3, 224, 224]
        # →
        # [1, 16, 3, 224, 224]
        # ----------------------------------------------------

        video_tensor = video_tensor.unsqueeze(
            0
        )

        video_tensor = video_tensor.to(
            self.device
        )

        # ----------------------------------------------------
        # Model inference
        # ----------------------------------------------------

        with torch.no_grad():

            logits = self.model(
                video_tensor
            )

            probabilities = torch.softmax(
                logits,
                dim=1
            )

        # ----------------------------------------------------
        # Extract probabilities
        # ----------------------------------------------------

        fake_probability = float(
            probabilities[0][0].item()
        )

        real_probability = float(
            probabilities[0][1].item()
        )

        predicted_index = int(
            torch.argmax(
                probabilities,
                dim=1
            ).item()
        )

        predicted_label = CLASS_NAMES[
            predicted_index
        ]

        # ----------------------------------------------------
        # Risk score
        # ----------------------------------------------------

        risk_score = fake_probability * 100

        # ----------------------------------------------------
        # Risk level
        # ----------------------------------------------------

        if risk_score >= 70:

            risk_level = "HIGH RISK"

        elif risk_score >= 40:

            risk_level = "MEDIUM RISK"

        else:

            risk_level = "LOW RISK"

        # ----------------------------------------------------
        # Result
        # ----------------------------------------------------

        # ----------------------------------------------------
        # DeepShield structured result
        # ----------------------------------------------------

        result = {

            "modality": "video",

            "prediction": predicted_label,

            "fake_confidence": round(
                fake_probability,
                4
            ),

            "real_confidence": round(
                real_probability,
                4
            ),

            "risk_score": round(
                risk_score,
                2
            ),

            "risk_level": risk_level

        }

        return result


# ============================================================
# BASIC MODULE TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — VIDEO INFERENCE ENGINE")
    print("=" * 70)

    inference = VideoInference()

    print("\nInference engine initialized successfully.")

    print("=" * 70)