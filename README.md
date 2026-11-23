# DeepShield-AI

**Explainable Multimodal Authenticity & Security Platform**

DeepShield is a multimodal security project designed to analyse digital content and provide risk assessments through AI-based and computer-vision techniques.

## Modules

- **Photo AI** – Image authenticity analysis.
- **Video AI** – Video authenticity analysis using CNN and LSTM-based features.
- **QR AI** – QR code decoding and security analysis.
- **Document AI** – Document text extraction and suspicious-content analysis.
- **AI Assistant** – Frontend assistant interface.

## Technology Stack

### Backend
- Python
- FastAPI
- PyTorch and TorchVision
- OpenCV
- PyMuPDF and PyPDF2
- Tesseract OCR

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Tools
- Git and GitHub
- npm
- pip
- Postman

## Prerequisites

- Python 3.14
- Node.js 24 or later
- npm
- Git
- Tesseract OCR

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/CurlyBracket11/DeepShield.git
cd DeepShield
```

### 2. Set up the Python environment

Run these commands from the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Set up the frontend

Open a terminal in the project root:

```powershell
cd frontend
npm ci
```

## Running the Application

Run the following services in separate terminals.

### 1. Main Backend

From the project root, with the Python environment activated:

```powershell
uvicorn backend.main:app --reload --port 8000
```

Main backend: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### 2. Video API

From the project root, with the Python environment activated:

```powershell
uvicorn services.video.video_api:app --reload --port 8001
```

Video API: `http://localhost:8001`

### 3. Frontend

From the frontend directory:

```powershell
npm run dev
```

Frontend: `http://localhost:3000`

## API Endpoints

### Main Backend — Port 8000

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend health check |
| POST | `/analyze-qr` | QR code analysis |
| POST | `/analyze-photo` | Photo analysis |
| POST | `/analyze-document` | Document analysis |

### Video API — Port 8001

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Video API health check |
| POST | `/analyze` | Video analysis |

## Supported Document Formats

The document frontend currently accepts:

- PDF (`.pdf`)
- Text (`.txt`)
- Word (`.docx`)
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)

Video API supported formats:

- MP4 (`.mp4`)
- AVI (`.avi`)
- MOV (`.mov`)
- MKV (`.mkv`)

## Important Notes & Limitations

- Tesseract OCR must be installed separately for OCR-based document processing.
- The current document analyzer uses a Windows-specific Tesseract executable path. Update its configuration if running on another operating system or using a different installation location.
- AI-generated authenticity and risk scores are model estimates, not definitive proof that content is genuine or manipulated.
- Model performance depends on the training data and input quality.
- The AI Assistant interface does not currently use a dedicated backend chat API.

## Project Status

DeepShield is an ongoing project. Features, models, frontend functionality and documentation are being improved and tested.

## License

No open-source license has been specified yet.
