"""Minimal TRIBE v2 inference server — paste on Northflank Jupyter shell.

Usage:
    pip install fastapi uvicorn nilearn
    export INFERENCE_TOKEN="your-token"
    python server.py
"""

import base64
import os
import tempfile

import numpy as np
import uvicorn
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

TOKEN = os.environ.get("INFERENCE_TOKEN", "")

_model = None


def get_model():
    global _model
    if _model is None:
        from tribev2 import TribeModel

        _model = TribeModel.from_pretrained(
            "facebook/tribev2", cache_folder="/workspace/cache", device="cuda"
        )
    return _model


def auth(authorization: str | None = Header(None)):
    if not TOKEN:
        return  # no token set = open access (hackathon mode)
    if authorization != f"Bearer {TOKEN}":
        raise HTTPException(401)


app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


class Req(BaseModel):
    input_type: str = "text"
    text: str


@app.get("/health")
def health():
    return {"ok": True}


_atlas = None


def get_atlas():
    global _atlas
    if _atlas is None:
        from nilearn import datasets

        atlas = datasets.fetch_atlas_surf_destrieux()
        lh, rh = np.asarray(atlas["map_left"]), np.asarray(atlas["map_right"])
        labels = [l.decode() if isinstance(l, bytes) else l for l in atlas["labels"]]
        _atlas = (np.concatenate([lh, rh]), labels)
    return _atlas


@app.post("/predict")
def predict(req: Req, _=Depends(auth)):
    model = get_model()
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write(req.text)
        path = f.name
    df = model.get_events_dataframe(text_path=path)
    preds, segments = model.predict(events=df)
    arr = np.asarray(preds, dtype=np.float32)
    T = arr.shape[0]

    # Split input text into T chunks for word-by-word animation.
    # This is a display mapping, not a scientific alignment —
    # good enough for the demo, crash-proof regardless of TRIBE internals.
    text_words = req.text.split()
    words = []
    if T > 0 and len(text_words) > 0:
        chunk = max(1, len(text_words) // T)
        for i in range(T):
            start = i * chunk
            end = start + chunk if i < T - 1 else len(text_words)
            words.append({"index": i, "text": " ".join(text_words[start:end])})
    else:
        words = [{"index": 0, "text": req.text}]

    mean = arr.mean(axis=1, keepdims=True)
    std = arr.std(axis=1, keepdims=True) + 1e-6
    z = (arr - mean) / std

    combined, labels = get_atlas()

    def roi(parcels):
        masks = [combined == labels.index(p) for p in parcels if p in labels]
        if not masks:
            return np.zeros(arr.shape[0]).tolist()
        return z[:, np.logical_or.reduce(masks)].mean(axis=1).tolist()

    # --- Outreach funnel scores ---
    # Attention: "Will they stop scrolling?" → parietal superior + frontal eye fields
    attention = roi(
        [
            "G_pariet_inf-Supramar",
            "S_intrapariet_and_P_trans",
            "G_front_middle",
            "S_front_sup",
        ]
    )
    # Curiosity: "Will they read the whole thing?" → anterior cingulate (info-gap) + IFG (semantic salience)
    curiosity = roi(
        [
            "G_and_S_cingul-Ant",
            "G_front_inf-Triangul",
            "G_front_inf-Orbital",
            "S_front_middle",
        ]
    )
    # Trust: "Will they trust the sender?" → TPJ + angular + dmPFC + precuneus (theory of mind)
    trust = roi(
        ["G_temporal_middle", "G_pariet_inf-Angular", "G_front_sup", "G_precuneus"]
    )
    # Motivation: "Will they want to reply?" → vmPFC + medial OFC + subcallosal (reward circuit)
    motivation = roi(
        [
            "G_rectus",
            "S_suborbital",
            "G_subcallosal",
            "S_orbital_med-olfact",
            "G_and_S_cingul-Ant",
        ]
    )
    # Resistance: "Will their brain shut down?" → anterior insula + conflict regions
    resistance = roi(
        [
            "G_insular_short",
            "S_circular_insula_ant",
            "G_front_inf-Opercular",
            "G_and_S_cingul-Mid-Ant",
        ]
    )

    b64 = base64.b64encode(arr.astype(np.float16).tobytes()).decode()

    m = lambda xs: float(np.mean(xs))

    # Per-segment scores for word-by-word animation
    segment_scores = []
    for i in range(arr.shape[0]):
        segment_scores.append(
            {
                "attention": attention[i],
                "curiosity": curiosity[i],
                "trust": trust[i],
                "motivation": motivation[i],
                "resistance": resistance[i],
            }
        )

    return {
        "shape": list(arr.shape),
        "dtype": "float16",
        "activations_b64_fp16": b64,
        "fps": 1,
        "hemodynamic_offset_s": 5,
        "words": words,
        "segments": segment_scores,
        "scores": {
            "attention": attention,
            "curiosity": curiosity,
            "trust": trust,
            "motivation": motivation,
            "resistance": resistance,
            "overall": m(attention)
            + m(curiosity)
            + m(trust)
            + m(motivation)
            - 2 * m(resistance),
        },
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
