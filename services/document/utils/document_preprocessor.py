# ============================================================
# DEEPSHIELD-AI — DOCUMENT PREPROCESSOR
# ============================================================

from pathlib import Path

import pytesseract
import pymupdf
from PIL import Image


# ============================================================
# PDF
# ============================================================

def extract_pdf_text(document_path):

    try:
        import PyPDF2
    except ImportError:
        raise ImportError(
            "PyPDF2 is not installed. Run: pip install PyPDF2"
        )

    # --------------------------------------------------------
    # First attempt: extract embedded PDF text
    # --------------------------------------------------------

    text = []

    with open(document_path, "rb") as file:

        reader = PyPDF2.PdfReader(file)

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text.append(page_text)

    extracted_text = "\n".join(text).strip()

    # --------------------------------------------------------
    # If text exists, return it
    # --------------------------------------------------------

    if extracted_text:

        return extracted_text

    # --------------------------------------------------------
    # No embedded text
    # PDF is probably scanned/image-based
    # Use OCR
    # --------------------------------------------------------

    print(
        "No embedded PDF text found."
    )

    print(
        "Starting OCR for scanned PDF..."
    )

    ocr_text = []

    pdf = pymupdf.open(
        document_path
    )

    for page_number, page in enumerate(pdf):

        print(
            f"OCR processing page "
            f"{page_number + 1}/{len(pdf)}..."
        )

        # Render PDF page at high resolution
        pix = page.get_pixmap(
            matrix=pymupdf.Matrix(
                2,
                2
            )
        )

        # Convert rendered page to PIL image
        image = Image.frombytes(
            "RGB",
            [
                pix.width,
                pix.height
            ],
            pix.samples
        )

        # OCR
        page_text = pytesseract.image_to_string(
            image
        )

        if page_text.strip():

            ocr_text.append(
                page_text
            )

    pdf.close()

    final_text = "\n".join(
        ocr_text
    ).strip()

    return final_text


# ============================================================
# DOCX
# ============================================================

def extract_docx_text(document_path):

    try:
        from docx import Document
    except ImportError:
        raise ImportError(
            "python-docx is not installed. "
            "Run: pip install python-docx"
        )

    document = Document(document_path)

    paragraphs = []

    for paragraph in document.paragraphs:

        if paragraph.text.strip():

            paragraphs.append(
                paragraph.text.strip()
            )

    return "\n".join(paragraphs)


# ============================================================
# TXT
# ============================================================

def extract_txt_text(document_path):

    document_path = Path(document_path)

    return document_path.read_text(
        encoding="utf-8",
        errors="ignore"
    )


# ============================================================
# IMAGE OCR
# ============================================================

def extract_image_text(document_path):

    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise ImportError(
            "OCR dependencies missing. "
            "Run: pip install pytesseract pillow"
        )

    image = Image.open(document_path)

    text = pytesseract.image_to_string(
        image
    )

    return text


# ============================================================
# UNIVERSAL TEXT EXTRACTION
# ============================================================

def extract_document_text(document_path):

    document_path = Path(document_path)

    if not document_path.exists():

        raise FileNotFoundError(
            f"Document not found: {document_path}"
        )

    extension = document_path.suffix.lower()

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if extension == ".pdf":

        return extract_pdf_text(
            document_path
        )

    # --------------------------------------------------------
    # DOCX
    # --------------------------------------------------------

    elif extension == ".docx":

        return extract_docx_text(
            document_path
        )

    # --------------------------------------------------------
    # TXT
    # --------------------------------------------------------

    elif extension == ".txt":

        return extract_txt_text(
            document_path
        )

    # --------------------------------------------------------
    # Images
    # --------------------------------------------------------

    elif extension in [".jpg", ".jpeg", ".png"]:

        return extract_image_text(
            document_path
        )

    # --------------------------------------------------------
    # Unsupported
    # --------------------------------------------------------

    else:

        raise ValueError(
            f"Unsupported document format: {extension}"
        )


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_extracted_text(text):

    if not text:

        return ""

    # Normalize line endings
    text = text.replace(
        "\r\n",
        "\n"
    )

    text = text.replace(
        "\r",
        "\n"
    )

    # Remove excessive spaces
    lines = []

    for line in text.split("\n"):

        line = " ".join(
            line.split()
        )

        if line:

            lines.append(line)

    return "\n".join(lines)


# ============================================================
# COMPLETE PREPROCESSING PIPELINE
# ============================================================

def preprocess_document(document_path):

    raw_text = extract_document_text(
        document_path
    )

    cleaned_text = clean_extracted_text(
        raw_text
    )

    result = {

        "text": cleaned_text,

        "character_count": len(
            cleaned_text
        ),

        "word_count": len(
            cleaned_text.split()
        ),

        "line_count": len(
            cleaned_text.splitlines()
        )

    }

    return result


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — DOCUMENT PREPROCESSOR")
    print("=" * 70)

    print("Preprocessor loaded successfully.")

    print("=" * 70)