# ============================================================
# DEEPSHIELD-AI — VIDEO PREPROCESSOR
# ============================================================

# ============================================================
# IMPORT PATH
# ============================================================

import sys
from pathlib import Path

VIDEO_DIR = Path(__file__).resolve().parents[1]

if str(VIDEO_DIR) not in sys.path:
    sys.path.insert(0, str(VIDEO_DIR))


# ============================================================
# IMPORTS
# ============================================================

import cv2
import numpy as np
import torch

from PIL import Image
from torchvision import transforms

from video_config import (
    NUM_FRAMES,
    FRAME_SIZE
)


# ============================================================
# IMAGE TRANSFORMATION
# ============================================================

VIDEO_TRANSFORM = transforms.Compose([
    transforms.Resize(
        (FRAME_SIZE, FRAME_SIZE)
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    )
])


# ============================================================
# EXTRACT VIDEO FRAMES
# ============================================================

def extract_video_frames(video_path):

    cap = cv2.VideoCapture(
        str(video_path)
    )

    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open video: {video_path}"
        )

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    if total_frames <= 0:
        cap.release()

        raise RuntimeError(
            f"Invalid video: {video_path}"
        )

    frame_indices = np.linspace(
        0,
        total_frames - 1,
        NUM_FRAMES,
        dtype=int
    )

    frames = []

    for frame_index in frame_indices:

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            int(frame_index)
        )

        success, frame = cap.read()

        if not success:
            continue

        frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        image = Image.fromarray(
            frame
        )

        image = VIDEO_TRANSFORM(
            image
        )

        frames.append(
            image
        )

    cap.release()

    if len(frames) == 0:
        raise RuntimeError(
            f"No frames extracted from: {video_path}"
        )

    # --------------------------------------------------------
    # Pad missing frames
    # --------------------------------------------------------

    while len(frames) < NUM_FRAMES:

        frames.append(
            frames[-1].clone()
        )

    frames = frames[:NUM_FRAMES]

    # --------------------------------------------------------
    # Stack frames
    # --------------------------------------------------------

    video_tensor = torch.stack(
        frames
    )

    return video_tensor


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("DEEPSHIELD-AI — VIDEO PREPROCESSOR READY")
    print("=" * 70)

    print(
        f"Frames/video : {NUM_FRAMES}"
    )

    print(
        f"Frame size   : {FRAME_SIZE}x{FRAME_SIZE}"
    )

    print(
        "Output shape : "
        f"[{NUM_FRAMES}, 3, {FRAME_SIZE}, {FRAME_SIZE}]"
    )

    print("=" * 70)