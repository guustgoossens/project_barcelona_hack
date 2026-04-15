# 03 — Status (as of 2026-04-15 ~21h)

## Current state

**TRIBE v2 inference API is live and publicly accessible.** Scores verified end-to-end from local machine → Northflank B200 → 5 brain scores returned. UI scaffold and Convex deployment provisioned (`abundant-buffalo-304`, eu-west-1).

## What exists

| Area | Path | State |
|---|---|---|
| Frontend | `frontend/` | TanStack Start + R3F. Routes `/`, `/session/$id`. Components: Brain, Timeline, ScoreBars, BranchTree. Libs: colormap, activations, convex client. |
| Convex | `frontend/convex/` | Schema (`sessions`, `variants` w/ parent-child), queries/mutations (`createRoot`, `createChild`, `archive`, `list`, `get`, `patchScoring`), action (`scoreVariant`) calling Python. |
| GPU inference (live) | `gpu/server.py` | Minimal FastAPI `/predict` on Northflank B200. Returns base64 fp16 `(T, 20484)` + 5 outreach-funnel scores (attention, curiosity, trust, motivation, resistance) via Destrieux atlas. **Live at `https://app--jupyter-pytorch--zr8brwblqp2q.code.run`**. |
| Python inference (full) | `backend/` | FastAPI `/predict` (text) + `/predict/media` (audio/video). Not deployed yet — `gpu/server.py` is the running version. |
| Brain mesh | `scripts/export_mesh.py` | fsaverage5 → single GLB, 20,484 verts, + `mesh_meta.json`. Not run yet. |
| Config | `.env.example`, `README.md` | ✅ |

## What was validated today on CoreWeave

- Northflank service `jupyter-pytorch` can run `tribev2` inference on **NVIDIA B200**.
- The stock torch build on the notebook image was not Blackwell-compatible.
- Switching to the official PyTorch nightly CUDA 13.0 wheel exposed `sm_100` and made CUDA available.
- `tribev2` text preprocessing also needed `en_core_web_lg` installed via spaCy.
- Successful smoke test:
  - load `TribeModel.from_pretrained("facebook/tribev2", device="cuda")`
  - build text events with `get_events_dataframe(text_path=...)`
  - run `predict(events)`
  - observed output shape `(5, 20484)` and `5` kept segments

## What's done

- [x] TRIBE v2 inference on B200 — verified `(T, 20484)` output
- [x] `gpu/server.py` deployed on Northflank, publicly accessible
- [x] 5 outreach-funnel brain scores (attention, curiosity, trust, motivation, resistance)
- [x] Destrieux atlas parcels verified against neuroscience literature
- [x] Model differentiates generic vs personalized emails (overall: -1.87 vs -0.56)
- [x] HuggingFace auth + LLaMA 3.2-3B gated access

## What's still open

- [ ] Connect Convex → GPU API: `bunx convex env set PYTHON_INFERENCE_URL https://app--jupyter-pytorch--zr8brwblqp2q.code.run`
- [ ] Run `scripts/export_mesh.py` → copy `assets/fsaverage5.glb` to `frontend/public/`
- [ ] Clay API integration — pull profiles, generate variants, score, send
- [ ] Persona-weighted scoring — pass persona type in request, adjust score weights
- [ ] 3D brain heatmap visualization in frontend
- [ ] Update Convex action to handle 5 scores (currently expects curiosity/social/threat)

## Northflank setup notes

Recommended sequence on the current notebook image:

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
```

## Dev commands

```
# Terminal 1
cd frontend && bunx convex dev

# Terminal 2
cd frontend && bun run dev

# Terminal 3 (needs GPU)
cd backend && uvicorn app.main:app --reload
```

## Known gotchas hit already

- Convex `_creationTime` can't be in an explicit index — removed from `sessions`.
- Stale `.js` files next to `.ts` files in `convex/` broke esbuild with "two output files share the same path". Don't commit compiled JS into `convex/`.
- `convex/_generated/` only appears after `bunx convex dev`; frontend TS won't compile without it.

## Demo flow (target)

1. Home page: paste a cold email → **Start session**.
2. Session page: 3-pane — branch tree (left), 3D brain + timeline (center), message + score bars (right).
3. Prune weak variants, duplicate-and-mutate strong ones, watch scores improve across generations.
4. Pitch line: "We don't A/B test with click rates. We test with the human brain before we send."

## Post-hackathon

Clay API → Claude Sonnet 4.6 drafts variants → auto-populates branch tree → winner sent via Clay native outreach. Response rates flow back into Convex.
