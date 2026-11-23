from collections import defaultdict
from huggingface_hub import HfApi

api = HfApi()

files = api.list_repo_tree(
    repo_id="ComplexDataLab/OpenFake",
    repo_type="dataset",
    path_in_repo="core",
    recursive=True
)

stats = defaultdict(lambda: {"count": 0, "bytes": 0})

for file in files:
    if not file.path.endswith(".parquet"):
        continue

    split = file.path.split("/")[1].split("-")[0]

    stats[split]["count"] += 1
    stats[split]["bytes"] += file.size

print("\nCORE SPLIT BREAKDOWN\n")

for split, data in sorted(stats.items()):
    size_gb = data["bytes"] / (1024 ** 3)

    print(f"{split.upper()}")
    print("Shards:", data["count"])
    print("Size (GB):", round(size_gb, 2))
    print()

print("Inspection complete.")
