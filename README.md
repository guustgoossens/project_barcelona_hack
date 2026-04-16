# BrainReach — brain-scored outreach

Visualizes Meta TRIBE v2 cortical activation per message variant. Built for Clay's
"Signal over Noise" track.

## Stack

- **Frontend** — TanStack Start + React Three Fiber (`frontend/`)
- **Realtime + DB** — Convex (`frontend/convex/`)
- **Inference** — Python FastAPI + TRIBE v2 on a B200 GPU (`backend/`)

## First-time setup

1. **Frontend deps**
   ```
   cd frontend && bun install
   ```
2. **Convex**
   ```
   cd frontend && bunx convex dev          # creates deployment, writes .env.local
   bunx convex env set PYTHON_INFERENCE_URL https://...
   bunx convex env set INFERENCE_TOKEN <token>
   ```
3. **Python inference (CoreWeave B200 via Northflank)**
   ```
   cd backend
   uv sync        # or: pip install -e .
   export HF_TOKEN=hf_xxx
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
4. **Brain mesh (one-time)**
   ```
   python scripts/export_mesh.py
   cp assets/fsaverage5.glb frontend/public/
   ```

## CoreWeave / Northflank status

TRIBE v2 text inference has been validated on the Northflank service backed by a
CoreWeave **NVIDIA B200**.

- Service: `jupyter-pytorch`
- Base image used: `northflank/public/jupyter-notebook:pytorch2.11.0-cuda12.9-cudnn9-devel`
- Working runtime after fixes: `torch 2.12.0.dev20260415+cu130`
- Verified CUDA arch list includes `sm_100`
- Verified device: `NVIDIA B200`
- Verified TRIBE prediction shape on text input: `(5, 20484)`

### Notes from the successful setup

- The stock torch install on the image did **not** support B200 (`sm_100` missing).
- Installing the official PyTorch nightly CUDA 13.0 build fixed GPU support.
- `tribev2` text preprocessing also required the spaCy English large model:
  `en_core_web_lg==3.8.0`.
- The first text run downloads additional text/audio model artifacts, including
  gated Hugging Face weights, so the first successful inference is materially
  slower than subsequent calls.

### Minimal setup sequence used on Northflank

```bash
apt-get update
apt-get install -y ffmpeg libsndfile1 git

cd /workspace/tribev2
pip install -e .
pip install -U "huggingface_hub[cli]"
huggingface-cli login

pip uninstall -y torch torchvision torchaudio
pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu130

python -m spacy download en_core_web_lg

python -c "import torch; print(torch.__version__); print(torch.cuda.is_available()); print(torch.cuda.get_arch_list()); print(torch.cuda.get_device_name(0))"
python -u -c 'from tribev2 import TribeModel; model = TribeModel.from_pretrained("facebook/tribev2", cache_folder="./cache", device="cuda"); events = model.get_events_dataframe(text_path="sample.txt"); preds, segments = model.predict(events); print(preds.shape); print(len(segments))'
```

Expected verification output:

- `torch.cuda.is_available() == True`
- `torch.cuda.get_arch_list()` contains `sm_100`
- `torch.cuda.get_device_name(0) == NVIDIA B200`
- TRIBE returns `(5, 20484)` on the smoke test text sample

## Run dev

```
# Terminal 1
cd frontend && bunx convex dev

# Terminal 2
cd frontend && bun run dev

# Terminal 3 (needs GPU)
cd backend && uvicorn app.main:app --reload
```

Open http://localhost:3000, type a message, hit **Start session**. The Convex action
calls the Python service; activations + scores stream back; brain renders at 1 fps.

## Roadmap

- Clay API integration: pull candidate profiles → Claude Sonnet 4.6 drafts variants →
  auto-populate the branch tree → winner sent via Clay native outreach.
- Response rate tracking back into Convex.

## License

TRIBE v2 is **CC-BY-NC-4.0** — non-commercial only.
