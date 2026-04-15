# NeuralReach — brain-scored outreach

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
3. **Python inference (local GPU or Northflank)**
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
