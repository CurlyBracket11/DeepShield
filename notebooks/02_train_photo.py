import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import models, transforms
from datasets import load_dataset

# ============================================================
# CONFIG
# ============================================================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Device:", DEVICE)

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))


# ============================================================
# LOAD CIFAKE
# ============================================================

dataset = load_dataset("dragonintelligence/CIFAKE-image-dataset")

train_data = dataset["train"]

print("Dataset loaded")
print("Train images:", len(train_data))


# ============================================================
# TRANSFORM
# ============================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# DATASET WRAPPER
# ============================================================

class CIFAKEDataset(torch.utils.data.Dataset):

    def __init__(self, hf_dataset, transform=None):
        self.dataset = hf_dataset
        self.transform = transform

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):

        item = self.dataset[idx]

        image = item["image"]
        label = item["label"]

        if self.transform:
            image = self.transform(image)

        return image, label


# ============================================================
# SMALL TEST SUBSET
# ============================================================

# IMPORTANT:
# We first test the complete pipeline on 5,000 images.

train_subset = train_data.select(range(5000))

train_dataset = CIFAKEDataset(
    train_subset,
    transform=transform
)


# ============================================================
# DATALOADER
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=0,
    pin_memory=True
)

print("Training images:", len(train_dataset))
print("Batches:", len(train_loader))


# ============================================================
# MODEL
# ============================================================

model = models.resnet18(
    weights=models.ResNet18_Weights.DEFAULT
)

# Replace final layer
model.fc = nn.Linear(
    model.fc.in_features,
    2
)

model = model.to(DEVICE)


# ============================================================
# LOSS + OPTIMIZER
# ============================================================

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=1e-4,
    weight_decay=1e-4
)


# ============================================================
# TRAINING
# ============================================================

EPOCHS = 2

for epoch in range(EPOCHS):

    model.train()

    running_loss = 0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(
            DEVICE,
            non_blocking=True
        )

        labels = labels.to(
            DEVICE,
            non_blocking=True
        )

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(
            outputs,
            1
        )

        total += labels.size(0)

        correct += (
            predicted == labels
        ).sum().item()

    accuracy = 100 * correct / total

    print(
        f"Epoch [{epoch+1}/{EPOCHS}] "
        f"Loss: {running_loss / len(train_loader):.4f} "
        f"Accuracy: {accuracy:.2f}%"
    )


# ============================================================
# SAVE MODEL
# ============================================================

import os

os.makedirs("models", exist_ok=True)

torch.save(
    model.state_dict(),
    "models/photo_resnet18_test.pth"
)

print()
print("================================")
print("Photo AI test training complete")
print("Model saved:")
print("models/photo_resnet18_test.pth")
print("================================")