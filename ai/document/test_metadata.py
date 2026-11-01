# ============================================================
# DEEPSHIELD-AI — DOCUMENT METADATA TEST
# ============================================================

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from services.document.utils.document_metadata import (
    analyze_document_metadata
)


# ============================================================
# CHECK ARGUMENT
# ============================================================

if len(sys.argv) < 2:

    print(
        'Usage: python ai\\document\\test_metadata.py "PATH_TO_DOCUMENT"'
    )

    sys.exit(1)


# ============================================================
# DOCUMENT PATH
# ============================================================

document_path = Path(
    sys.argv[1]
)


# ============================================================
# ANALYZE
# ============================================================

result = analyze_document_metadata(
    document_path
)


# ============================================================
# DISPLAY RESULT
# ============================================================

print("=" * 70)
print("DEEPSHIELD-AI — DOCUMENT METADATA RESULT")
print("=" * 70)

print("\nFILE")

for key, value in result["file"].items():

    print(
        f"{key:<25}: {value}"
    )


if "pdf" in result:

    pdf = result["pdf"]

    print("\nPDF")

    print(
        f"{'page_count':<25}: "
        f"{pdf['page_count']}"
    )

    print(
        f"{'image_count':<25}: "
        f"{pdf['image_count']}"
    )

    print(
        f"{'embedded_text_chars':<25}: "
        f"{pdf['embedded_text_characters']}"
    )

    print(
        f"{'document_type':<25}: "
        f"{pdf['document_type']}"
    )

    print("\nPDF METADATA")

    for key, value in pdf["metadata"].items():

        print(
            f"{key:<25}: {value}"
        )


print("=" * 70)