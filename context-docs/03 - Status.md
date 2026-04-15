# 03 — Status (as of 2026-04-15)

## Current state

Visualizer scaffold is in place. End-to-end **not yet verified** (needs GPU + HF token). UI builds and Convex deployment is provisioned (`abundant-buffalo-304`, eu-west-1).

## What exists

| Area | Path | State |
|---|---|---|
| Frontend | `frontend/` | TanStack Start + R3F. Routes `/`, `/session/$id`. Components: Brain, Timeline, ScoreBars, BranchTree. Libs: colormap, activations, convex client. |
| Convex | `frontend/convex/` | Schema (`sessions`, `variants` w/ parent-child), queries/mutations (`createRoot`, `createChild`, `archive`, `list`, `get`, `patchScoring`), action (`scoreVariant`) calling Python. |
| Python inference | `backend/` | FastAPI `/predict` (text) + `/predict/media` (audio/video). Lazy-loads `facebook/tribev2`. Returns base64 fp16 `(T, 20484)` + ROI scores (curiosity / social / threat) via Destrieux atlas. Dockerfile CUDA 12.1. |
| Brain mesh | `scripts/export_mesh.py` | fsaverage5 → single GLB, 20,484 verts, + `mesh_meta.json`. Not run yet. |
| Config | `.env.example`, `README.md` | ✅ |

## What's still open

- Run `scripts/export_mesh.py` once → copy `assets/fsaverage5.glb` to `frontend/public/`.
- Deploy `backend/` to **Northflank on CoreWeave B200** (image `northflank/public/jupyter-notebook:pytorch2.11.0-cuda12.9-cudnn9-devel` from Google Artifact Registry). Mount persistent volume at `/app/cache` so LLaMA/V-JEPA2/W2V-BERT/TRIBE weights survive restarts.
- Set Convex env:
  - `bunx convex env set PYTHON_INFERENCE_URL https://...`
  - `bunx convex env set INFERENCE_TOKEN <openssl rand -hex 32>`
- Set Northflank service env: `HF_TOKEN`, `INFERENCE_TOKEN` (same value).
- Accept LLaMA 3.2-3B license on HuggingFace.
- Validate TRIBE v2 text input API — `get_events_dataframe(text_path=...)` in `backend/app/model.py` is a best guess from the Colab; may need a small fix once run against real weights.

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
