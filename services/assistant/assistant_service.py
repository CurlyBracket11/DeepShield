# ============================================================
# DEEPSHIELD-AI — ASSISTANT SERVICE
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
# ASSISTANT IMPORT
# ============================================================

from ai.assistant.assistant_router import (
    AssistantRouter
)


# ============================================================
# SERVICE
# ============================================================

class AssistantService:

    def __init__(
        self,
        enable_voice=True
    ):

        self.router = AssistantRouter(
            enable_voice=enable_voice
        )

    # --------------------------------------------------------
    # Analyze any DeepShield result
    # --------------------------------------------------------

    def analyze(
        self,
        analysis_result
    ):

        if not isinstance(
            analysis_result,
            dict
        ):

            raise TypeError(
                "analysis_result must be a dictionary."
            )

        return self.router.process(
            analysis_result
        )

    # --------------------------------------------------------
    # Health check
    # --------------------------------------------------------

    def health_check(self):

        return {
            "service": "DeepShield Assistant",
            "status": "READY",
            "voice_enabled":
                self.router.voice is not None
        }

    # --------------------------------------------------------
    # Service information
    # --------------------------------------------------------

    def get_service_info(self):

        return {

            "service":
                "DeepShield Multimodal Security Assistant",

            "version":
                "1.0",

            "capabilities": [

                "Risk explanation",

                "Security finding explanation",

                "Prediction explanation",

                "Risk-level explanation",

                "Safety recommendation",

                "Voice output",

                "Multimodal result processing"

            ],

            "supported_modalities": [

                "image",

                "video",

                "document",

                "qr"

            ]

        }


# ============================================================
# GLOBAL SERVICE
# ============================================================

assistant_service = AssistantService(
    enable_voice=True
)


# ============================================================
# PUBLIC FUNCTION
# ============================================================

def analyze_with_assistant(
    analysis_result
):

    return assistant_service.analyze(
        analysis_result
    )


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — ASSISTANT SERVICE")
    print("=" * 70)

    service = AssistantService(
        enable_voice=True
    )

    print()
    print(
        "Service status:"
    )

    print(
        service.health_check()
    )

    print()
    print(
        "Service information:"
    )

    print(
        service.get_service_info()
    )

    print()
    print("=" * 70)
    print("ASSISTANT SERVICE READY")
    print("=" * 70)