# ============================================================
# DEEPSHIELD-AI — ASSISTANT ROUTER
# ============================================================

from pathlib import Path
import sys


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
# ASSISTANT IMPORTS
# ============================================================

from ai.assistant.assistant_core import (
    analyze_result
)

from ai.assistant.voice_engine import (
    VoiceEngine
)


# ============================================================
# ASSISTANT ROUTER
# ============================================================

class AssistantRouter:

    def __init__(
        self,
        enable_voice=True
    ):

        print("=" * 70)
        print("DEEPSHIELD-AI — ASSISTANT ROUTER")
        print("=" * 70)

        self.enable_voice = enable_voice

        self.voice = None

        if self.enable_voice:

            try:

                self.voice = VoiceEngine()

                print(
                    "Voice assistant : ENABLED"
                )

            except Exception as error:

                print(
                    "Voice assistant : UNAVAILABLE"
                )

                print(
                    f"Voice error : {error}"
                )

                self.voice = None

        print(
            "Multimodal assistant router initialized."
        )

        print("=" * 70)

    # ========================================================
    # PROCESS ANALYSIS RESULT
    # ========================================================

    def process(
        self,
        result
    ):

        if not isinstance(
            result,
            dict
        ):

            raise TypeError(
                "Assistant input must be a dictionary."
            )

        # ----------------------------------------------------
        # Determine modality
        # ----------------------------------------------------

        modality = str(
            result.get(
                "modality",
                "unknown"
            )
        ).lower()

        print()
        print(
            f"Assistant modality : {modality.upper()}"
        )

        # ----------------------------------------------------
        # Generate explanation
        # ----------------------------------------------------

        assistant_result = analyze_result(
            result
        )

        summary = assistant_result.get(
            "summary",
            ""
        )

        # ----------------------------------------------------
        # Voice
        # ----------------------------------------------------

        if (
            self.enable_voice
            and self.voice is not None
            and summary
        ):

            try:

                self.voice.speak(
                    summary
                )

            except Exception as error:

                print(
                    f"Voice output failed: {error}"
                )

        # ----------------------------------------------------
        # Final structured response
        # ----------------------------------------------------

        return {

            "modality":
                assistant_result.get(
                    "modality",
                    modality
                ),

            "filename":
                assistant_result.get(
                    "filename",
                    result.get(
                        "filename",
                        "unknown"
                    )
                ),

            "prediction":
                assistant_result.get(
                    "prediction",
                    result.get(
                        "prediction",
                        "UNKNOWN"
                    )
                ),

            "risk_score":
                assistant_result.get(
                    "risk_score",
                    result.get(
                        "risk_score",
                        0.0
                    )
                ),

            "risk_level":
                assistant_result.get(
                    "risk_level",
                    result.get(
                        "risk_level",
                        "N/A"
                    )
                ),

            "summary":
                summary,

            "voice_enabled":
                self.voice is not None

        }


# ============================================================
# CONVENIENCE FUNCTION
# ============================================================

def process_analysis(
    result,
    enable_voice=True
):

    router = AssistantRouter(
        enable_voice=enable_voice
    )

    return router.process(
        result
    )


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print()

    demo_result = {

        "modality": "qr",

        "filename": "demo_qr.png",

        "prediction": "SUSPICIOUS",

        "risk_score": 75.0,

        "risk_level": "HIGH RISK",

        "security_findings": [

            {
                "severity": "HIGH",

                "message":
                    "QR URL contains suspicious "
                    "security-related keywords."
            },

            {
                "severity": "HIGH",

                "message":
                    "QR payload contains urgent-action "
                    "language."
            }

        ]

    }

    result = process_analysis(
        demo_result,
        enable_voice=True
    )

    print()
    print("=" * 70)
    print("ASSISTANT ROUTER RESULT")
    print("=" * 70)

    print(
        f"Modality    : {result['modality']}"
    )

    print(
        f"Prediction  : {result['prediction']}"
    )

    print(
        f"Risk Score  : {result['risk_score']}"
    )

    print(
        f"Risk Level  : {result['risk_level']}"
    )

    print(
        f"Voice       : {result['voice_enabled']}"
    )

    print()
    print(
        "Assistant Summary:"
    )

    print(
        result["summary"]
    )

    print("=" * 70)