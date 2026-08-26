from inference import predict_photo
from datasets import load_dataset
import tempfile
import os

# ============================================================
# LOAD CIFAKE TEST DATASET FROM HUGGING FACE
# ============================================================

print("Loading CIFAKE test dataset...")

test_dataset = load_dataset(
    "dragonintelligence/CIFAKE-image-dataset",
    split="test"
)

print("Test dataset loaded.")
print("Total test images:", len(test_dataset))


# ============================================================
# TAKE ONE IMAGE
# ============================================================

sample = test_dataset[0]

image = sample["image"]
true_label = sample["label"]

print("True label:", test_dataset.features["label"].names[true_label])


# ============================================================
# SAVE TEMPORARY IMAGE
# ============================================================

temp_path = os.path.join(
    tempfile.gettempdir(),
    "deepshield_test_image.png"
)

image.convert("RGB").save(temp_path)

print("Temporary image:", temp_path)


# ============================================================
# RUN DEEPSHIELD PHOTO AI
# ============================================================

result = predict_photo(temp_path)

print("\n========================================")
print("DEEPSHIELD-AI PHOTO INFERENCE")
print("========================================")

print("Dataset label :", test_dataset.features["label"].names[true_label])


print("Prediction       :", result["prediction"])
print("Confidence       :", f'{result["confidence"]:.2f}%')
print("Confidence Level :", result["confidence_level"])
print("Risk Score       :", f'{result["risk_score"]:.2f}/100')
print("Device           :", result["device"])