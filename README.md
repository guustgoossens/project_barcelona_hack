# BrainReach

**Simulate the brain before you hit send.**

BrainReach uses Meta's TRIBE v2 cortical activation model to score outreach
messages *before* they're sent. Write a message, generate variants with Claude,
and see which one lights up the brain — in 5 seconds, not 5 days.

Don't spray and pray. **Spray and Clay.**

> Built for the Clay hackathon track.

## How it works

1. **Pull leads from Clay** — enriched with OCEAN personality traits
2. **Write & branch message variants** — Claude Sonnet 4.6 suggests rewrites via a learning loop
3. **Score with TRIBE v2** — each variant is run through Meta's cortical model on an NVIDIA B200
4. **Visualize** — 3D brain mesh, score bars (attention, curiosity, trust, motivation, resistance), variant tree
5. **Send the winner** — best-scoring variant goes out via Clay outreach

## Quickstart

### Prerequisites

- [Bun](https://bun.sh) (frontend)
- A [Convex](https://convex.dev) account (free tier works)

### 1. Install & configure

```bash
cd frontend
bun install
bunx convex dev            # creates a deployment and writes .env.local
```

Set the Convex environment variables (the inference URL and token are only
needed if you're running your own GPU backend):

```bash
bunx convex env set PYTHON_INFERENCE_URL https://your-inference-url
bunx convex env set INFERENCE_TOKEN your-token
```

### 2. Run

```bash
# Terminal 1 — Convex backend
cd frontend && bunx convex dev

# Terminal 2 — Dev server
cd frontend && bun run dev
```

Open **http://localhost:3000** — launch a campaign, type a message, and hit
**Start session** to score it.

### 3. See the pitch

Navigate to **http://localhost:3000/pitch** for a fullscreen 3-slide deck
covering the problem, solution, and architecture. Keyboard-navigable with
arrow keys.

## Stack

| Layer | Tech |
|---|---|
| **Frontend** | TanStack Start, React Three Fiber, Tailwind CSS |
| **Realtime + DB** | Convex (mutations, queries, actions, file storage) |
| **AI agent** | Claude Sonnet 4.6 via `@convex-dev/agent` |
| **Brain inference** | Python FastAPI + Meta TRIBE v2 on CoreWeave B200 |

## GPU backend (optional)

The Python inference service requires an NVIDIA B200 with CUDA 13.0 support.
If you're running your own:

```bash
cd backend
uv sync                     # or: pip install -e .
export HF_TOKEN=hf_xxx      # Hugging Face token for gated models
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The brain mesh is pre-built. To regenerate:

```bash
python scripts/export_mesh.py
cp assets/fsaverage5.glb frontend/public/
```

## License

TRIBE v2 is **CC-BY-NC-4.0** — non-commercial only.
