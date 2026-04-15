from __future__ import annotations

import base64
import os
import tempfile
from pathlib import Path
from typing import Literal

import numpy as np
from fastapi import Depends, FastAPI, HTTPException, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .model import run_inference
from .scoring import derive_scores

HEMODYNAMIC_OFFSET_S = 5
FPS = 1

app = FastAPI(title="NeuralReach inference", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _auth(authorization: str | None = Header(default=None)) -> None:
    expected = os.environ.get("INFERENCE_TOKEN")
    if not expected:
        return  # dev mode
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="bad token")


class PredictTextRequest(BaseModel):
    input_type: Literal["text"]
    text: str


@app.get("/health")
def health():
    return {"ok": True, "model_loaded": False}


@app.post("/predict")
def predict_text(req: PredictTextRequest, _: None = Depends(_auth)):
    if req.input_type != "text":
        raise HTTPException(400, "use /predict/media for audio or video")
    activations = run_inference("text", text=req.text)
    return _package(activations)


@app.post("/predict/media")
async def predict_media(
    file: UploadFile = File(...),
    input_type: Literal["audio", "video"] = Form(...),
    _: None = Depends(_auth),
):
    suffix = Path(file.filename or "").suffix or (
        ".mp4" if input_type == "video" else ".wav"
    )
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    activations = run_inference(input_type, media_path=tmp_path)
    return _package(activations)


def _package(activations: np.ndarray) -> dict:
    fp16 = activations.astype(np.float16)
    b64 = base64.b64encode(fp16.tobytes()).decode("ascii")
    scores = derive_scores(activations)
    return {
        "shape": list(activations.shape),
        "dtype": "float16",
        "activations_b64_fp16": b64,
        "fps": FPS,
        "hemodynamic_offset_s": HEMODYNAMIC_OFFSET_S,
        "scores": scores,
    }
