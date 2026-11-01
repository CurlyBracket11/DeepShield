# ============================================================
# DEEPSHIELD-AI — DOCUMENT AI TEST
# ============================================================

import sys
from pathlib import Path

from document_analyzer import DocumentAnalyzer


# ============================================================
# CHECK ARGUMENT
# ============================================================

if len(sys.argv) < 2:

    print(
        "Usage:"
    )

    print(
        'python ai\\document\\test_document.py "PATH_TO_DOCUMENT"'
    )

    sys.exit(1)


# ============================================================
# DOCUMENT PATH
# ============================================================

document_path = Path(
    sys.argv[1]
)


# ============================================================
# INITIALIZE ANALYZER
# ============================================================

analyzer = DocumentAnalyzer()


# ============================================================
# ANALYZE DOCUMENT
# ============================================================

result = analyzer.analyze(
    document_path
)


# ============================================================
# FINAL RESULT
# ============================================================

print("\n")
print("=" * 70)
print("DEEPSHIELD-AI — FINAL DOCUMENT RESULT")
print("=" * 70)

print(
    f"Prediction       : {result['prediction']}"
)

print(
    f"Risk Score       : {result['risk_score']}"
)

print(
    f"Risk Level       : {result['risk_level']}"
)

print(
    f"File Type        : {result['file_type']}"
)

print(
    f"Words            : "
    f"{result['text_statistics']['words']}"
)

print(
    f"Characters       : "
    f"{result['text_statistics']['characters']}"
)

# ============================================================
# EXPLAINABILITY
# ============================================================

explanation = result.get(
    "explanation",
    {}
)

print("=" * 70)
print()
print("DEEPSHIELD-AI — DOCUMENT EXPLANATION")
print("=" * 70)

print(
    f"Prediction : "
    f"{explanation.get('prediction', 'N/A')}"
)

print(
    f"Risk Score : "
    f"{explanation.get('risk_score', 'N/A')}"
)

print(
    f"Risk Level : "
    f"{explanation.get('risk_level', 'N/A')}"
)

print()
print("Why:")

print(
    f"  {explanation.get('summary', 'No explanation available.')}"
)

evidence = explanation.get(
    "evidence",
    []
)

print()

if evidence:

    print("Evidence:")

    for item in evidence:

        print(
            f"  - [{item.get('severity', 'N/A')}] "
            f"{item.get('message', '')}"
        )

else:

    print("Evidence: None")

print("=" * 70)

print("=" * 70)