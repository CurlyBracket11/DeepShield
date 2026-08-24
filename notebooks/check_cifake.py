from datasets import load_dataset
from collections import Counter

# Load dataset
dataset = load_dataset("dragonintelligence/CIFAKE-image-dataset")

train = dataset["train"]
test = dataset["test"]

label_names = train.features["label"].names

# Get labels
train_labels = train["label"]
test_labels = test["label"]

# Count classes
train_counts = Counter(train_labels)
test_counts = Counter(test_labels)

print("========== TRAIN DATA ==========")

for label_id, count in sorted(train_counts.items()):
    label_name = label_names[label_id]
    percentage = (count / len(train)) * 100

    print(
        f"{label_name}: {count:,} images "
        f"({percentage:.2f}%)"
    )

print("\n========== TEST DATA ==========")

for label_id, count in sorted(test_counts.items()):
    label_name = label_names[label_id]
    percentage = (count / len(test)) * 100

    print(
        f"{label_name}: {count:,} images "
        f"({percentage:.2f}%)"
    )

print("\n========== TOTAL ==========")

print("Train:", len(train))
print("Test :", len(test))
print("Total:", len(train) + len(test))