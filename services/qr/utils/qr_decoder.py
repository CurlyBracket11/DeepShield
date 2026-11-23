from pathlib import Path
import cv2

SUPPORTED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}


def decode_qr(image_path):
    """
    Detect and decode QR codes using OpenCV.
    Returns a structured result containing detected QR codes.
    """

    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(f"QR image not found: {image_path}")

    if not image_path.is_file():
        raise ValueError(f"Path is not a file: {image_path}")

    extension = image_path.suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported image format: {extension}")

    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError("Unable to read QR image.")

    detector = cv2.QRCodeDetector()

    results = []

    # Try detecting multiple QR codes first.
    try:
        success, decoded_info, points, _ = detector.detectAndDecodeMulti(image)
    except (cv2.error, AttributeError):
        success, decoded_info, points = False, (), None

    if success and points is not None:
        for index, (payload, corners) in enumerate(
            zip(decoded_info, points), start=1
        ):
            if not payload:
                continue

            x, y, width, height = cv2.boundingRect(corners.astype("float32"))

            results.append({
                "index": index,
                "type": "QRCODE",
                "data": payload,
                "rect": {
                    "x": int(x),
                    "y": int(y),
                    "width": int(width),
                    "height": int(height),
                },
            })

    # Fallback for a single QR code.
    if not results:
        payload, points, _ = detector.detectAndDecode(image)

        if payload and points is not None:
            x, y, width, height = cv2.boundingRect(
                points.reshape(-1, 2).astype("float32")
            )

            results.append({
                "index": 1,
                "type": "QRCODE",
                "data": payload,
                "rect": {
                    "x": int(x),
                    "y": int(y),
                    "width": int(width),
                    "height": int(height),
                },
            })

    return {
        "detected": len(results) > 0,
        "count": len(results),
        "codes": results,
        "image": image_path.name,
    }


if __name__ == "__main__":
    print("=" * 70)
    print("DEEPSHIELD-AI - QR DECODER")
    print("=" * 70)
    print("\nQR decoder loaded successfully.")
    print("\nSupported image formats:")

    for extension in sorted(SUPPORTED_EXTENSIONS):
        print(f"  - {extension}")

    print("=" * 70)
