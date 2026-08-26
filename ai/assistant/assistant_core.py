# ============================================================
# DEEPSHIELD-AI — AI SECURITY ASSISTANT CORE
# ============================================================

from typing import Any, Dict, List, Optional


# ============================================================
# ASSISTANT CONFIGURATION
# ============================================================

ASSISTANT_NAME = "DeepShield Security Assistant"


# ============================================================
# RESPONSE BUILDER
# ============================================================

class DeepShieldAssistant:

    def __init__(self):

        self.name = ASSISTANT_NAME

        print("=" * 70)
        print("DEEPSHIELD-AI — SECURITY ASSISTANT")
        print("=" * 70)

        print(
            "Multimodal security assistant initialized."
        )

        print("=" * 70)

    # --------------------------------------------------------
    # Normalize analysis result
    # --------------------------------------------------------

    def normalize_result(
        self,
        result: Dict[str, Any]
    ) -> Dict[str, Any]:

        if not isinstance(result, dict):
            raise TypeError(
                "Analysis result must be a dictionary."
            )

        return {

            "modality":
                result.get(
                    "modality",
                    "unknown"
                ),

            "filename":
                result.get(
                    "filename",
                    "unknown file"
                ),

            "prediction":
                result.get(
                    "prediction",
                    "UNKNOWN"
                ),

            "risk_score":
                float(
                    result.get(
                        "risk_score",
                        0
                    )
                ),

            "risk_level":
                result.get(
                    "risk_level",
                    "UNKNOWN"
                ),

            "findings":
                result.get(
                    "security_findings",
                    result.get(
                        "findings",
                        []
                    )
                ),

            "explanation":
                result.get(
                    "explanation",
                    {}
                )

        }

    # --------------------------------------------------------
    # Determine overall security category
    # --------------------------------------------------------

    def classify_result(
        self,
        risk_score: float
    ) -> str:

        if risk_score >= 70:
            return "DANGEROUS"

        if risk_score >= 40:
            return "HIGH ATTENTION"

        if risk_score > 0:
            return "CAUTION"

        return "SAFE"

    # --------------------------------------------------------
    # Create security summary
    # --------------------------------------------------------

    def summarize(
        self,
        result: Dict[str, Any]
    ) -> Dict[str, Any]:

        data = self.normalize_result(
            result
        )

        risk_score = data["risk_score"]

        category = self.classify_result(
            risk_score
        )

        findings = data["findings"]

        modality = (
            data["modality"]
            .replace("_", " ")
            .title()
        )

        prediction = data["prediction"]

        # ----------------------------------------------------
        # Summary
        # ----------------------------------------------------

        if category == "DANGEROUS":

            summary = (
                f"I analyzed the {modality} and found "
                f"significant security concerns. "
                f"The current risk score is "
                f"{risk_score:.0f} out of 100."
            )

        elif category == "HIGH ATTENTION":

            summary = (
                f"The {modality} requires careful review. "
                f"I detected security indicators that "
                f"raise its risk score to "
                f"{risk_score:.0f} out of 100."
            )

        elif category == "CAUTION":

            summary = (
                f"The {modality} appears mostly safe, "
                f"but I detected some indicators that "
                f"deserve attention. "
                f"The risk score is "
                f"{risk_score:.0f} out of 100."
            )

        else:

            summary = (
                f"The {modality} appears safe based on "
                f"the available analysis. "
                f"The risk score is 0 out of 100."
            )

        # ----------------------------------------------------
        # Recommendation
        # ----------------------------------------------------

        if category == "DANGEROUS":

            recommendation = (
                "Do not trust or interact with the "
                "content until it has been independently verified."
            )

        elif category == "HIGH ATTENTION":

            recommendation = (
                "Review the detected indicators carefully "
                "before taking any action."
            )

        elif category == "CAUTION":

            recommendation = (
                "Proceed carefully and verify important "
                "information before interacting with it."
            )

        else:

            recommendation = (
                "No major security indicators were detected. "
                "Normal caution is still recommended."
            )

        # ----------------------------------------------------
        # Evidence
        # ----------------------------------------------------

        evidence = []

        for finding in findings:

            if isinstance(finding, dict):

                severity = finding.get(
                    "severity",
                    "UNKNOWN"
                )

                message = finding.get(
                    "message",
                    ""
                )

                if message:

                    evidence.append({
                        "severity": severity,
                        "message": message
                    })

            elif isinstance(finding, str):

                evidence.append({
                    "severity": "UNKNOWN",
                    "message": finding
                })

        return {

            "assistant": self.name,

            "modality":
                data["modality"],

            "filename":
                data["filename"],

            "prediction":
                prediction,

            "risk_score":
                round(
                    risk_score,
                    2
                ),

            "risk_level":
                data["risk_level"],

            "security_category":
                category,

            "summary":
                summary,

            "recommendation":
                recommendation,

            "evidence":
                evidence,

            "finding_count":
                len(evidence)

        }

    # --------------------------------------------------------
    # Generate human-readable response
    # --------------------------------------------------------

    def generate_response(
        self,
        result: Dict[str, Any]
    ) -> str:

        summary = self.summarize(
            result
        )

        response = []

        response.append(
            summary["summary"]
        )

        response.append(
            f"Verdict: {summary['prediction']}."
        )

        response.append(
            f"Risk level: {summary['risk_level']}."
        )

        if summary["evidence"]:

            response.append(
                f"I detected {summary['finding_count']} "
                f"security indicator(s)."
            )

            for index, item in enumerate(
                summary["evidence"],
                start=1
            ):

                response.append(
                    f"Finding {index}: "
                    f"{item['message']}"
                )

        response.append(
            f"Recommendation: "
            f"{summary['recommendation']}"
        )

        return " ".join(response)

    # --------------------------------------------------------
    # Answer user question
    # --------------------------------------------------------

    def answer_question(
        self,
        question: str,
        result: Dict[str, Any]
    ) -> str:

        question = (
            question
            .strip()
            .lower()
        )

        summary = self.summarize(
            result
        )

        # ----------------------------------------------------
        # Safety question
        # ----------------------------------------------------

        if any(
            phrase in question
            for phrase in [
                "is this safe",
                "safe",
                "can i trust",
                "should i trust"
            ]
        ):

            if summary["security_category"] == "SAFE":

                return (
                    "Based on the current analysis, "
                    "the content appears safe. "
                    "No major security indicators were detected."
                )

            return (
                f"I would not consider this fully safe. "
                f"The analysis produced a risk score of "
                f"{summary['risk_score']:.0f} out of 100 "
                f"with a {summary['risk_level']} classification. "
                f"I recommend verifying it before taking action."
            )

        # ----------------------------------------------------
        # Why question
        # ----------------------------------------------------

        if any(
            phrase in question
            for phrase in [
                "why",
                "reason",
                "how did you decide"
            ]
        ):

            if not summary["evidence"]:

                return (
                    "No major security indicators were detected, "
                    "so the current risk score remains low."
                )

            reasons = []

            for item in summary["evidence"]:

                reasons.append(
                    item["message"]
                )

            return (
                "The risk assessment is based on these "
                "detected indicators: "
                + " ".join(reasons)
            )

        # ----------------------------------------------------
        # Risk question
        # ----------------------------------------------------

        if any(
            phrase in question
            for phrase in [
                "risk",
                "score",
                "dangerous",
                "threat"
            ]
        ):

            return (
                f"The current risk score is "
                f"{summary['risk_score']:.0f} out of 100, "
                f"classified as {summary['risk_level']}."
            )

        # ----------------------------------------------------
        # Recommendation question
        # ----------------------------------------------------

        if any(
            phrase in question
            for phrase in [
                "what should i do",
                "what do i do",
                "next step",
                "recommend",
                "recommendation"
            ]
        ):

            return (
                summary["recommendation"]
            )

        # ----------------------------------------------------
        # Explain question
        # ----------------------------------------------------

        if any(
            phrase in question
            for phrase in [
                "explain",
                "tell me about",
                "what happened",
                "what did you find"
            ]
        ):

            return (
                self.generate_response(
                    result
                )
            )

        # ----------------------------------------------------
        # Default intelligent response
        # ----------------------------------------------------

        return (
            self.generate_response(
                result
            )
        )


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    assistant = DeepShieldAssistant()

    demo_result = {

        "modality": "qr",

        "filename": "suspicious_qr.png",

        "prediction": "SUSPICIOUS",

        "risk_score": 80,

        "risk_level": "HIGH RISK",

        "security_findings": [

            {
                "severity": "HIGH",
                "message":
                    "QR URL contains potentially "
                    "sensitive security keywords."
            },

            {
                "severity": "HIGH",
                "message":
                    "QR URL contains potentially "
                    "risky urgent-action language."
            }

        ]

    }

    print()
    print(
        assistant.generate_response(
            demo_result
        )
    )


    # ============================================================
    # PUBLIC ANALYSIS INTERFACE
    # ============================================================

# ============================================================
# PUBLIC ANALYSIS INTERFACE
# ============================================================

def analyze_result(result):
    """
    Public interface for sending any DeepShield-AI
    modality result to the security assistant.
    """

    assistant = DeepShieldAssistant()

    response = assistant.generate_response(result)

    return {
        "modality": result.get(
            "modality",
            "unknown"
        ),

        "filename": result.get(
            "filename",
            "unknown"
        ),

        "prediction": result.get(
            "prediction",
            "UNKNOWN"
        ),

        "risk_score": result.get(
            "risk_score",
            0.0
        ),

        "risk_level": result.get(
            "risk_level",
            "N/A"
        ),

        "summary": response
    }