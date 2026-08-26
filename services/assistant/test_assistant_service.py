# ============================================================
# DEEPSHIELD-AI — ASSISTANT SERVICE INTEGRATION TEST
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
# ASSISTANT SERVICE
# ============================================================

from services.assistant.assistant_service import (
    AssistantService
)


# ============================================================
# TEST
# ============================================================

def test_modality(
    service,
    modality,
    result
):

    print()
    print("=" * 70)
    print(
        f"TESTING MODALITY : {modality.upper()}"
    )
    print("=" * 70)

    response = service.analyze(
        result
    )

    print()
    print("Assistant Result:")

    print(
        response
    )

    return response


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — MULTIMODAL ASSISTANT TEST")
    print("=" * 70)

    # --------------------------------------------------------
    # Initialize
    # --------------------------------------------------------

    service = AssistantService(
        enable_voice=False
    )

    # Voice is disabled here so we can test all four
    # modalities without four spoken responses.
    # Voice itself has already been tested separately.
    
    # --------------------------------------------------------
    # Health
    # --------------------------------------------------------

    print()
    print("SERVICE HEALTH:")
    print(
        service.health_check()
    )

    # --------------------------------------------------------
    # Information
    # --------------------------------------------------------

    print()
    print("SERVICE INFORMATION:")
    print(
        service.get_service_info()
    )

    # --------------------------------------------------------
    # IMAGE
    # --------------------------------------------------------

    image_result = {

        "modality": "image",

        "filename": "test_image.jpg",

        "prediction": "SUSPICIOUS",

        "risk_score": 75,

        "risk_level": "HIGH RISK",

        "security_findings": [

            {
                "severity": "HIGH",

                "message":
                    "Image contains indicators "
                    "of possible manipulation."
            }

        ]

    }

    test_modality(
        service,
        "image",
        image_result
    )

    # --------------------------------------------------------
    # VIDEO
    # --------------------------------------------------------

    video_result = {

        "modality": "video",

        "filename": "test_video.mp4",

        "prediction": "FAKE",

        "risk_score": 82,

        "risk_level": "HIGH RISK",

        "security_findings": [

            {
                "severity": "HIGH",

                "message":
                    "Temporal inconsistencies detected "
                    "in video frames."
            }

        ]

    }

    test_modality(
        service,
        "video",
        video_result
    )

    # --------------------------------------------------------
    # DOCUMENT
    # --------------------------------------------------------

    document_result = {

        "modality": "document",

        "filename": "test_document.pdf",

        "prediction": "SUSPICIOUS",

        "risk_score": 65,

        "risk_level": "MEDIUM RISK",

        "security_findings": [

            {
                "severity": "MEDIUM",

                "message":
                    "Document contains suspicious "
                    "metadata indicators."
            }

        ]

    }

    test_modality(
        service,
        "document",
        document_result
    )

    # --------------------------------------------------------
    # QR
    # --------------------------------------------------------

    qr_result = {

        "modality": "qr",

        "filename": "test_qr.png",

        "prediction": "SUSPICIOUS",

        "risk_score": 60,

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

    test_modality(
        service,
        "qr",
        qr_result
    )

    # --------------------------------------------------------
    # Complete
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("MULTIMODAL ASSISTANT TEST COMPLETED")
    print("=" * 70)