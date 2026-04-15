"""Minimal TRIBE v2 inference server — paste on Northflank Jupyter shell.

Usage:
    pip install fastapi uvicorn nilearn
    export INFERENCE_TOKEN="your-token"
    python server.py
"""
import base64, os, tempfile
import numpy as np
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

TOKEN = os.environ.get("INFERENCE_TOKEN", "changeme")

_model = None
def get_model():
    global _model
    if _model is None:
        from tribev2 import TribeModel
        _model = TribeModel.from_pretrained("facebook/tribev2", cache_folder="/workspace/cache", device="cuda")
    return _model

def auth(authorization: str | None = Header(None)):
    if authorization != f"Bearer {TOKEN}":
        raise HTTPException(401)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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
    preds, _ = model.predict(events=df)
    arr = np.asarray(preds, dtype=np.float32)

    mean = arr.mean(axis=1, keepdims=True)
    std = arr.std(axis=1, keepdims=True) + 1e-6
    z = (arr - mean) / std

    combined, labels = get_atlas()

    def roi(parcels):
        masks = [combined == labels.index(p) for p in parcels if p in labels]
        if not masks: return np.zeros(arr.shape[0]).tolist()
        return z[:, np.logical_or.reduce(masks)].mean(axis=1).tolist()

    curiosity = roi(["G_front_middle","G_front_inf-Triangul","S_intrapariet_and_P_trans","G_and_S_cingul-Ant"])
    social = roi(["G_temporal_middle","G_pariet_inf-Angular","G_front_sup","S_temporal_sup"])
    threat = roi(["G_insular_short","S_circular_insula_ant","G_front_inf-Opercular","G_and_S_cingul-Mid-Ant"])

    b64 = base64.b64encode(arr.astype(np.float16).tobytes()).decode()
    return {
        "shape": list(arr.shape), "dtype": "float16",
        "activations_b64_fp16": b64, "fps": 1, "hemodynamic_offset_s": 5,
        "scores": {
            "curiosity": curiosity, "social": social, "threat": threat,
            "valence": float(np.mean(curiosity) - np.mean(threat)),
            "aggregate": float(np.mean(curiosity) + np.mean(social) - np.mean(threat)),
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
