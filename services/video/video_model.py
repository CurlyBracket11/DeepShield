# ============================================================
# DEEPSHIELD-AI — VIDEO MODEL ARCHITECTURE
# ResNet18 + LSTM
# ============================================================

import torch
import torch.nn as nn
from torchvision import models

from video_config import (
    NUM_CLASSES,
    DEVICE
)


# ============================================================
# VIDEO RESNET18 + LSTM
# ============================================================

class VideoResNet18LSTM(nn.Module):

    def __init__(
        self,
        cnn_features=512,
        hidden_size=256,
        num_layers=1,
        num_classes=NUM_CLASSES,
        dropout=0.3
    ):
        super().__init__()

        # ----------------------------------------------------
        # ResNet18 backbone
        # ----------------------------------------------------

        self.cnn = models.resnet18(
            weights=None
        )

        # Remove original classification layer
        self.cnn.fc = nn.Identity()

        # ----------------------------------------------------
        # LSTM temporal model
        # ----------------------------------------------------

        self.lstm = nn.LSTM(
            input_size=cnn_features,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=(
                dropout
                if num_layers > 1
                else 0.0
            )
        )

        # ----------------------------------------------------
        # Classification head
        # ----------------------------------------------------

        self.dropout = nn.Dropout(dropout)

        self.classifier = nn.Linear(
            hidden_size,
            num_classes
        )

    def forward(self, x):

        # x:
        # [batch, frames, channels, height, width]

        batch_size, num_frames, channels, height, width = x.shape

        # ----------------------------------------------------
        # Process every frame through ResNet18
        # ----------------------------------------------------

        x = x.view(
            batch_size * num_frames,
            channels,
            height,
            width
        )

        features = self.cnn(x)

        # ----------------------------------------------------
        # Restore temporal dimension
        # ----------------------------------------------------

        features = features.view(
            batch_size,
            num_frames,
            -1
        )

        # ----------------------------------------------------
        # Temporal processing
        # ----------------------------------------------------

        lstm_output, _ = self.lstm(
            features
        )

        # Use final frame's temporal representation
        final_features = lstm_output[:, -1, :]

        # ----------------------------------------------------
        # Classification
        # ----------------------------------------------------

        final_features = self.dropout(
            final_features
        )

        logits = self.classifier(
            final_features
        )

        return logits


# ============================================================
# MODEL CREATION
# ============================================================

def create_video_model():

    model = VideoResNet18LSTM(
        cnn_features=512,
        hidden_size=256,
        num_layers=1,
        num_classes=NUM_CLASSES,
        dropout=0.3
    )

    model = model.to(DEVICE)

    return model


print("=" * 70)
print("DEEPSHIELD-AI — VIDEO MODEL ARCHITECTURE READY")
print("=" * 70)

print("Architecture : ResNet18 + LSTM")
print("CNN features : 512")
print("LSTM hidden  : 256")
print("Classes      : 2")
print(f"Device       : {DEVICE}")

print("=" * 70)


# ============================================================
# STEP 83 — LOAD TRAINED VIDEO CHECKPOINT
# ============================================================

from video_config import MODEL_PATH


def load_video_model():

    model = create_video_model()

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    # Handle both normal state_dict and checkpoint dictionaries
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(
        state_dict,
        strict=True
    )

    model.eval()

    return model


if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — LOADING TRAINED VIDEO MODEL")
    print("=" * 70)

    model = load_video_model()

    print("Checkpoint loaded successfully.")
    print("Model is ready for inference.")
    print(f"Device: {DEVICE}")

    print("=" * 70)