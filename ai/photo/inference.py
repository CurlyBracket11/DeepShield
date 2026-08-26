import os

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


# ============================================================
# CONFIGURATION
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

# Project root:
# D:\DeepShield-AI
PROJECT_ROOT = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)

MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "models",
    "photo_resnet18_best.pth"
)

LABELS = ["FAKE", "REAL"]


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# CREATE MODEL
# ============================================================

def create_model():

    model = models.resnet18(weights=None)

    # CIFAKE has 2 classes:
    # 0 = FAKE
    # 1 = REAL

    model.fc = nn.Linear(
        model.fc.in_features,
        2
    )

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.to(DEVICE)

    model.eval()

    return model


# ============================================================
# LOAD MODEL
# ============================================================

model = create_model()


# ============================================================
# PHOTO PREDICTION
# ============================================================

def predict_photo(image_path):

    image = Image.open(image_path).convert("RGB")

    input_tensor = transform(image)

    input_tensor = input_tensor.unsqueeze(0)

    input_tensor = input_tensor.to(DEVICE)

    with torch.no_grad():

        output = model(input_tensor)

        probabilities = torch.softmax(
            output,
            dim=1
        )

        predicted_class = torch.argmax(
            probabilities,
            dim=1
        ).item()

        confidence = probabilities[
            0,
            predicted_class
        ].item()

    # ============================================================
    # CONVERT CLASS INDEX TO LABEL
    # ============================================================

    prediction = LABELS[predicted_class]

# Convert confidence into DeepShield risk score
    if prediction == "FAKE":
        risk_score = confidence * 100
    else:
        risk_score = (1.0 - confidence) * 100

# Determine confidence level
    confidence_percent = confidence * 100

    if confidence_percent >= 90:
        confidence_level = "VERY HIGH"
    elif confidence_percent >= 75:
        confidence_level = "HIGH"
    elif confidence_percent >= 60:
        confidence_level = "MODERATE"
    else:
        confidence_level = "LOW"

    return {
    "prediction": prediction,
    "confidence": round(confidence_percent, 2),
    "confidence_level": confidence_level,
    "risk_score": round(risk_score, 2),
    "device": str(DEVICE)

    }   

# ============================================================
# MODEL INFORMATION
# ============================================================

def get_model_info():

    return {
        "model": "ResNet18",
        "task": "Photo Authenticity Detection",
        "classes": LABELS,
        "device": str(DEVICE),
        "model_path": MODEL_PATH
    }


# ============================================================
# STARTUP CHECK
# ============================================================

if __name__ == "__main__":

    print("=" * 55)
    print("DEEPSHIELD-AI — PHOTO AI")
    print("=" * 55)

    print("Model       : ResNet18")
    print("Task        : Photo Authenticity Detection")
    print("Device      :", DEVICE)
    print("Model path  :", MODEL_PATH)
    print("Classes     :", LABELS)

    print("\nPhoto AI loaded successfully.")