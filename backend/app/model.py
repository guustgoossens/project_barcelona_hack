from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import Literal

import numpy as np

_model = None


def _get_model():
    global _model
    if _model is None:
        from tribev2 import TribeModel  # type: ignore

        cache = os.environ.get("TRIBE_CACHE", "./cache")
        device = os.environ.get("TRIBE_DEVICE", "cuda")
        _model = TribeModel.from_pretrained(
            "facebook/tribev2", cache_folder=cache, device=device
        )
    return _model


def run_inference(
    input_type: Literal["text", "audio", "video"],
    *,
    text: str | None = None,
    media_path: str | Path | None = None,
) -> np.ndarray:
    """Returns activation matrix of shape (T, 20484)."""
    model = _get_model()

    if input_type == "text":
        assert text is not None, "text required"
        # TRIBE v2 exposes get_events_dataframe for text via a transcript file.
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
            f.write(text)
            path = f.name
        df = model.get_events_dataframe(text_path=path)
    elif input_type == "audio":
        assert media_path is not None
        df = model.get_events_dataframe(audio_path=str(media_path))
    elif input_type == "video":
        assert media_path is not None
        df = model.get_events_dataframe(video_path=str(media_path))
    else:
        raise ValueError(f"unknown input_type {input_type}")

    preds, _segments = model.predict(events=df)
    arr = np.asarray(preds, dtype=np.float32)
    if arr.ndim != 2 or arr.shape[1] != 20484:
        raise ValueError(f"unexpected prediction shape {arr.shape}")
    return arr
