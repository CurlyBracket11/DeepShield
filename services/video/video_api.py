# ============================================================
# DEEPSHIELD-AI — VIDEO API
# ============================================================

import sys
from pathlib import Path

VIDEO_DIR = Path(__file__).resolve().parent

if str(VIDEO_DIR) not in sys.path:
    sys.path.insert(0, str(VIDEO_DIR))

from fastapi import FastAPI, UploadFile, File, HTTPException

from video_inference import VideoInference


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="DeepShield-AI Video Service",
    description="Video authenticity and deepfake risk analysis",
    version="1.0.0"
)


# ============================================================
# LOAD MODEL
# ============================================================

inference_engine = VideoInference()


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "service": "video",
        "status": "ready",
        "model": "ResNet18 + LSTM",
        "device": str(inference_engine.device)
    }


# ============================================================
# VIDEO ANALYSIS
# ============================================================

@app.post("/analyze")
async def analyze_video(
    file: UploadFile = File(...)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No video file provided."
        )

    allowed_extensions = {
        ".mp4",
        ".avi",
        ".mov",
        ".mkv"
    }

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported video format."
        )

    # --------------------------------------------------------
    # Temporary file
    # --------------------------------------------------------

    temp_dir = VIDEO_DIR / "temp"

    temp_dir.mkdir(
        exist_ok=True
    )

    temp_path = (
        temp_dir /
        file.filename
    )

    try:

        contents = await file.read()

        with open(
            temp_path,
            "wb"
        ) as f:

            f.write(contents)

        # ----------------------------------------------------
        # Run Video AI
        # ----------------------------------------------------

        result = inference_engine.predict(
            temp_path
        )

        result["filename"] = file.filename

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if temp_path.exists():
            temp_path.unlink()


# ============================================================
# DIRECT RUN
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001
    )