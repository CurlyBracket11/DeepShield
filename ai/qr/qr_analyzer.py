# ============================================================
# DEEPSHIELD-AI — QR ANALYZER
# ============================================================

import sys
from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(
    __file__
).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(
        0,
        str(PROJECT_ROOT)
    )


# ============================================================
# QR UTILITIES
# ============================================================

from services.qr.utils.qr_decoder import (
    decode_qr
)

from services.qr.utils.qr_security import (
    analyze_payload
)


# ============================================================
# RISK SCORE
# ============================================================

def calculate_risk_score(findings):

    score = 0

    weights = {
        "LOW": 10,
        "MEDIUM": 20,
        "HIGH": 30
    }

    for finding in findings:

        severity = finding.get(
            "severity",
            "LOW"
        )

        score += weights.get(
            severity,
            0
        )

    return float(
        min(score, 100)
    )


# ============================================================
# RISK LEVEL
# ============================================================

def get_risk_level(risk_score):

    # 0–20
    if risk_score <= 20:
        return "LOW RISK"

    # 21–49
    if risk_score < 50:
        return "MEDIUM RISK"

    # 50–74
    if risk_score < 75:
        return "HIGH RISK"

    # 75–100
    return "CRITICAL RISK"


# ============================================================
# PREDICTION
# ============================================================

def get_prediction(risk_score):

    # 0–20
    if risk_score <= 20:
        return "LIKELY SAFE"

    # 21–49
    if risk_score < 50:
        return "REVIEW REQUIRED"

    # 50–74
    if risk_score < 75:
        return "SUSPICIOUS"

    # 75–100
    return "HIGHLY SUSPICIOUS"


# ============================================================
# QR ANALYZER
# ============================================================

class QRAnalyzer:

    def __init__(self):

        print("=" * 70)
        print("DEEPSHIELD-AI — QR ANALYZER")
        print("=" * 70)

        print(
            "QR security analysis engine initialized."
        )

        print("=" * 70)

    # --------------------------------------------------------
    # Analyze QR
    # --------------------------------------------------------

    def analyze(self, image_path):

        image_path = Path(
            image_path
        )

        print("=" * 70)
        print("DEEPSHIELD-AI — QR ANALYSIS")
        print("=" * 70)

        print(
            f"Image : {image_path.name}"
        )

        # ----------------------------------------------------
        # Decode QR
        # ----------------------------------------------------

        decoded = decode_qr(
            image_path
        )

        # ----------------------------------------------------
        # No QR
        # ----------------------------------------------------

        if not decoded["detected"]:

            print(
                "QR Code : NOT DETECTED"
            )

            print("=" * 70)

            return {
                "modality": "qr",
                "filename": image_path.name,
                "detected": False,
                "prediction": "NO QR DETECTED",
                "risk_score": 0.0,
                "risk_level": "N/A",
                "codes": [],
                "security_findings": []
            }

        # ----------------------------------------------------
        # Analyze every QR code
        # ----------------------------------------------------

        all_findings = []

        analyzed_codes = []

        print(
            f"QR Codes : {decoded['count']}"
        )

        for code in decoded["codes"]:

            payload = code["data"]

            security = analyze_payload(
                payload
            )

            all_findings.extend(
                security["findings"]
            )

            analyzed_codes.append({

                **code,

                "payload_type":
                    security["payload_type"]

            })

            print()
            print(
                f"QR #{code['index']}"
            )

            print(
                f"Type    : {security['payload_type']}"
            )

            print(
                f"Data    : {payload}"
            )

        # ----------------------------------------------------
        # Risk
        # ----------------------------------------------------

        risk_score = calculate_risk_score(
            all_findings
        )

        risk_level = get_risk_level(
            risk_score
        )

        prediction = get_prediction(
            risk_score
        )

        # ----------------------------------------------------
        # Result
        # ----------------------------------------------------

        result = {

            "modality": "qr",

            "filename": image_path.name,

            "detected": True,

            "prediction": prediction,

            "risk_score": round(
                risk_score,
                2
            ),

            "risk_level": risk_level,

            "codes": analyzed_codes,

            "security_findings": all_findings

        }

        # ----------------------------------------------------
        # Console
        # ----------------------------------------------------

        print()
        print(
            f"Prediction : {prediction}"
        )

        print(
            f"Risk Score : {risk_score:.2f}"
        )

        print(
            f"Risk Level : {risk_level}"
        )

        print(
            f"Findings   : {len(all_findings)}"
        )

        if all_findings:

            print()
            print(
                "Security findings:"
            )

            for finding in all_findings:

                print(
                    f"  - [{finding['severity']}] "
                    f"{finding['message']}"
                )

        else:

            print()
            print(
                "Security findings: None"
            )

        print("=" * 70)

        return result


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — QR ANALYZER TEST")
    print("=" * 70)

    analyzer = QRAnalyzer()

    print()
    print(
        "QR analyzer initialized successfully."
    )