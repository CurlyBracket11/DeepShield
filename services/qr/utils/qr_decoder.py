# ============================================================
# DEEPSHIELD-AI — QR DECODER
# ============================================================

from pathlib import Path

import cv2
from pyzbar.pyzbar import decode


# ============================================================
# SUPPORTED IMAGE FORMATS
# ============================================================

SUPPORTED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}


# ============================================================
# QR DECODER
# ============================================================

def decode_qr(image_path):
    """
    Detect and decode QR codes from an image.

    Returns a structured result containing all detected QR codes.
    """

    image_path = Path(image_path)

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    if not image_path.exists():
        raise FileNotFoundError(
            f"QR image not found: {image_path}"
        )

    if not image_path.is_file():
        raise ValueError(
            f"Path is not a file: {image_path}"
        )

    extension = image_path.suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported image format: {extension}"
        )

    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    image = cv2.imread(
        str(image_path)
    )

    if image is None:
        raise ValueError(
            "Unable to read QR image."
        )

    # --------------------------------------------------------
    # Decode QR / barcode objects
    # --------------------------------------------------------

    decoded_objects = decode(image)

    results = []

    for index, obj in enumerate(decoded_objects, start=1):

        try:
            payload = obj.data.decode(
                "utf-8",
                errors="replace"
            )
        except Exception:
            payload = str(obj.data)

        results.append({

            "index": index,

            "type": obj.type,

            "data": payload,

            "rect": {
                "x": obj.rect.left,
                "y": obj.rect.top,
                "width": obj.rect.width,
                "height": obj.rect.height,
            }

        })

    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    return {
        "detected": len(results) > 0,
        "count": len(results),
        "codes": results,
        "image": image_path.name,
    }


# ============================================================
# BASIC TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — QR DECODER")
    print("=" * 70)

    print()
    print("QR decoder loaded successfully.")

    print()
    print("Supported image formats:")

    for extension in sorted(
        SUPPORTED_EXTENSIONS
    ):
        print(f"  - {extension}")

    print("=" * 70)