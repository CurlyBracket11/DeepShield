# ============================================================
# DEEPSHIELD-AI — QR AI TEST
# ============================================================

import sys
from pathlib import Path

from qr_analyzer import QRAnalyzer


# ============================================================
# CHECK ARGUMENT
# ============================================================

if len(sys.argv) < 2:

    print(
        "Usage:"
    )

    print(
        'python ai\\qr\\test_qr.py "PATH_TO_QR_IMAGE"'
    )

    sys.exit(1)


# ============================================================
# IMAGE PATH
# ============================================================

image_path = Path(
    sys.argv[1]
)


# ============================================================
# INITIALIZE ANALYZER
# ============================================================

analyzer = QRAnalyzer()


# ============================================================
# ANALYZE
# ============================================================

result = analyzer.analyze(
    image_path
)


# ============================================================
# FINAL RESULT
# ============================================================

print()
print("=" * 70)
print("DEEPSHIELD-AI — FINAL QR RESULT")
print("=" * 70)

print(
    f"Detected     : {result['detected']}"
)

print(
    f"Prediction   : {result['prediction']}"
)

print(
    f"Risk Score   : {result['risk_score']}"
)

print(
    f"Risk Level   : {result['risk_level']}"
)

print(
    f"QR Count     : {len(result['codes'])}"
)

print()

if result["codes"]:

    print("Decoded QR Data:")

    for code in result["codes"]:

        print(
            f"  QR #{code['index']}"
        )

        print(
            f"    Type : {code['type']}"
        )

        print(
            f"    Data : {code['data']}"
        )

else:

    print(
        "Decoded QR Data: None"
    )

print("=" * 70)
