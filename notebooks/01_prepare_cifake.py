from datasets import load_dataset

# -----------------------------------
# Load CIFAKE
# -----------------------------------

dataset = load_dataset(
    "dragonintelligence/CIFAKE-image-dataset"
)

train_dataset = dataset["train"]
test_dataset = dataset["test"]

print("Original datasets:")
print("Train:", len(train_dataset))
print("Test :", len(test_dataset))


# -----------------------------------
# Create validation split
# -----------------------------------

split = train_dataset.train_test_split(
    test_size=0.10,
    seed=42,
    stratify_by_column="label"
)

train_dataset = split["train"]
val_dataset = split["test"]


# -----------------------------------
# Results
# -----------------------------------

print("\nAfter splitting:")

print("Training   :", len(train_dataset))
print("Validation :", len(val_dataset))
print("Test       :", len(test_dataset))


# -----------------------------------
# Check class distribution
# -----------------------------------

label_names = dataset["train"].features["label"].names

print("\nTraining distribution:")

for label_id, label_name in enumerate(label_names):
    count = sum(
        1 for x in train_dataset["label"]
        if x == label_id
    )
    print(label_name, ":", count)


print("\nValidation distribution:")

for label_id, label_name in enumerate(label_names):
    count = sum(
        1 for x in val_dataset["label"]
        if x == label_id
    )
    print(label_name, ":", count)