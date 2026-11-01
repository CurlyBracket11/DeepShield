# ============================================================
# DEEPSHIELD-AI — DOCUMENT METADATA ANALYZER
# ============================================================

from pathlib import Path


# ============================================================
# PDF METADATA
# ============================================================

def analyze_pdf_metadata(document_path):

    import pymupdf

    document_path = Path(document_path)

    pdf = pymupdf.open(
        document_path
    )

    metadata = pdf.metadata

    page_count = len(pdf)

    total_images = 0
    total_text_characters = 0

    for page in pdf:

        total_images += len(
            page.get_images(
                full=True
            )
        )

        page_text = page.get_text()

        total_text_characters += len(
            page_text.strip()
        )

    pdf.close()

    # --------------------------------------------------------
    # Determine document type
    # --------------------------------------------------------

    if total_text_characters > 0:

        document_type = "DIGITAL PDF"

    elif total_images > 0:

        document_type = "SCANNED / IMAGE PDF"

    else:

        document_type = "EMPTY / UNKNOWN PDF"

    # --------------------------------------------------------
    # Metadata
    # --------------------------------------------------------

    result = {

        "file_type": ".pdf",

        "page_count": page_count,

        "image_count": total_images,

        "embedded_text_characters":
            total_text_characters,

        "document_type":
            document_type,

        "metadata": {

            "title":
                metadata.get(
                    "title"
                ),

            "author":
                metadata.get(
                    "author"
                ),

            "subject":
                metadata.get(
                    "subject"
                ),

            "creator":
                metadata.get(
                    "creator"
                ),

            "producer":
                metadata.get(
                    "producer"
                ),

            "creation_date":
                metadata.get(
                    "creationDate"
                ),

            "modification_date":
                metadata.get(
                    "modDate"
                )

        }

    }

    return result


# ============================================================
# GENERAL FILE METADATA
# ============================================================

def analyze_file_metadata(document_path):

    document_path = Path(
        document_path
    )

    stat = document_path.stat()

    return {

        "filename":
            document_path.name,

        "extension":
            document_path.suffix.lower(),

        "file_size_bytes":
            stat.st_size,

        "file_size_kb":
            round(
                stat.st_size / 1024,
                2
            ),

    }


# ============================================================
# UNIVERSAL METADATA ANALYZER
# ============================================================

def analyze_document_metadata(
    document_path
):

    document_path = Path(
        document_path
    )

    file_metadata = analyze_file_metadata(
        document_path
    )

    result = {

        "file": file_metadata

    }

    if document_path.suffix.lower() == ".pdf":

        result["pdf"] = analyze_pdf_metadata(
            document_path
        )

    return result


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print(
        "DEEPSHIELD-AI — DOCUMENT METADATA ANALYZER"
    )
    print("=" * 70)

    print(
        "Metadata analyzer loaded successfully."
    )

    print("=" * 70)