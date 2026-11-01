
from fastapi import FastAPI, UploadFile, File, HTTPException
from pathlib import Path
import tempfile

from ai.qr.qr_analyzer import QRAnalyzer
from ai.photo.inference import predict_photo

app = FastAPI(title="DeepShield API")

analyzer = QRAnalyzer()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "DeepShield API"
    }


@app.post("/analyze-qr")
async def analyze_qr(file: UploadFile = File(...)):
    allowed_extensions = {
        ".jpg", ".jpeg", ".png", ".bmp", ".webp"
    }

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format."
        )

    temp_path = None

    try:
        image_data = await file.read()

        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False
        ) as temp_file:
            temp_file.write(image_data)
            temp_path = temp_file.name

        return analyzer.analyze(temp_path)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)


@app.post("/analyze-photo")
async def analyze_photo(file: UploadFile = File(...)):
    allowed_extensions = {
        ".jpg", ".jpeg", ".png", ".bmp", ".webp"
    }

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format."
        )

    temp_path = None

    try:
        image_data = await file.read()

        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False
        ) as temp_file:
            temp_file.write(image_data)
            temp_path = temp_file.name

        result = predict_photo(temp_path)

        return {
            "modality": "photo",
            "filename": file.filename,
            **result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)


@app.post("/analyze-document")
async def analyze_document_endpoint(file: UploadFile = File(...)):
    allowed_extensions = {
        ".pdf", ".docx", ".doc", ".txt",
        ".jpg", ".jpeg", ".png"
    }

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported document format."
        )

    temp_path = None

    try:
        document_data = await file.read()

        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False
        ) as temp_file:
            temp_file.write(document_data)
            temp_path = temp_file.name

        from ai.document.document_service import analyze_document

        return analyze_document(temp_path)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)

