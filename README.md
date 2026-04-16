# BrainReach

**Simulate the brain before you hit send.**

BrainReach uses Meta's TRIBE v2 cortical activation model to score outreach messages *before* they're sent. Write a message, generate variants with Claude, and see which one lights up the brain — in 5 seconds, not 5 days.

Don't spray and pray. **Spray and Clay.**

> Built for the Clay hackathon track.

## How it works

1. **Pull leads from Clay** — enriched with OCEAN personality traits
2. **Write & branch message variants** — Claude Sonnet 4.6 suggests rewrites via a learning loop
3. **Score with TRIBE v2** — each variant is run through Meta's cortical model on an NVIDIA B200
4. **Visualize** — 3D brain mesh, score bars (attention, curiosity, trust, motivation, resistance), variant tree
5. **Send the winner** — best-scoring variant goes out via Clay outreach

---

## Architecture

BrainReach is a three-layer system: a reactive frontend, a Convex serverless backend, and a GPU inference server running TRIBE v2 on a CoreWeave B200.

```
┌──────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                            │
│                                                                      │
│  TanStack Start + React 19                                           │
│  ├── Campaign Hub (/)           — campaign cards, stats, seed/reset  │
│  ├── Campaign Workspace (/campaign/$id)                              │
│  │     ├── Variant Tree         — React Flow (XYFlow), pan/zoom      │
│  │     ├── 3D Brain Viz         — React Three Fiber, jet heatmap     │
│  │     ├── Email Editor         — inline edit, "Test this edit"      │
│  │     ├── Score Bars           — 5 neural scores + persona delta    │
│  │     ├── Lead Selector        — OCEAN bars, personality profile    │
│  │     └── Lessons Drawer       — AI + human lessons, teach input    │
│  └── Pitch Page (/pitch)        — animated pitch walkthrough         │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
            Real-time subscriptions (WebSocket)
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│                         BACKEND LAYER (Convex)                       │
│                                                                      │
│  Schema     — sessions, variants, campaigns, leads                   │
│  Queries    — list/get campaigns, variants, leads                    │
│  Mutations  — create variants, update lessons, archive, seed demo    │
│  Actions    — scoreVariant (calls GPU), learnFromScoring (calls AI)  │
│  Agent      — Claude Sonnet 4.6 optimizer with 5 registered tools    │
│  Storage    — fp16 activation matrix blobs                           │
│  Scheduler  — async task orchestration (score → learn pipeline)      │
└───────────┬──────────────────────────────────────┬───────────────────┘
            │                                      │
            │ HTTP POST /predict                   │ Anthropic API
            │ (Bearer token auth)                  │
┌───────────▼─────────────────┐     ┌──────────────▼───────────────────┐
│    GPU INFERENCE SERVER      │     │      EXTERNAL SERVICES           │
│                              │     │                                  │
│  FastAPI + uvicorn           │     │  Anthropic — Claude Sonnet 4.6   │
│  TRIBE v2 (Meta)             │     │  Clay — OCEAN lead enrichment    │
│  Destrieux atlas scoring     │     │  Hugging Face — model weights    │
│  NVIDIA B200 / CoreWeave     │     └──────────────────────────────────┘
└──────────────────────────────┘
```

### Data flow: email → brain scores → UI

1. **User creates a variant** — Convex mutation inserts it with `status: pending` and schedules `scoreVariant`
2. **GPU inference** — TRIBE v2 tokenizes the text (spaCy), predicts fMRI BOLD signal across **20,484 cortical vertices × T timesteps**, and maps activations to 5 scores via the Destrieux atlas
3. **Score aggregation** — Convex applies Kahneman's peak-end rule:
   ```
   Positive signals  →  0.4 × mean + 0.2 × first + 0.2 × min  + 0.2 × last
   Resistance        →  0.4 × mean + 0.2 × first + 0.2 × max  + 0.2 × last
   Overall           →  attention + curiosity + trust + motivation − resistance  →  0–100
   ```
4. **Learning loop** — if a child variant shifts any score by >5% vs. its parent, Claude analyzes the delta and appends an insight to `campaign.lessonsMarkdown`. Future variants read these lessons before being generated.
5. **Frontend renders** — real-time subscriptions update the variant tree, 3D brain heatmap, score bars, and word-highlight timeline simultaneously, without polling.

### Brain scoring (Destrieux atlas)

| Signal | Brain Regions | Question answered |
|---|---|---|
| **Curiosity** | Lateral PFC, IFG, intraparietal sulcus, anterior cingulate | Will they read to the end? |
| **Trust** | TPJ, angular gyrus, dorsomedial PFC (theory of mind) | Will they trust the sender? |
| **Resistance** | Anterior insula, IFG opercular, mid-cingulate | Will their brain shut it down? |
| **Attention** | Dorsal + ventral attention networks | Will they stop scrolling? |
| **Motivation** | Ventromedial PFC (reward circuit) | Will they want to reply? |

### Persona weighting (Big Five OCEAN)

When a lead is selected, raw brain scores are adjusted per their Clay OCEAN profile:

| Trait | Affected signal | Max multiplier |
|---|---|---|
| Openness | Curiosity | ×2.0 |
| Conscientiousness | Attention | ×1.5 |
| Extraversion | Motivation | ×2.0 |
| Agreeableness | Trust | ×1.5 |
| Neuroticism | Resistance (penalty) | ×3.0 |

Trait values below 0.3 have no effect; above 0.8 the full multiplier applies, with smooth interpolation between.

---

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

Open **http://localhost:3000** — launch a campaign, pick a lead, edit a variant, and hit **Test this edit** to score it.

### 3. See the pitch

Navigate to **http://localhost:3000/pitch** for a fullscreen 3-slide deck covering the problem, solution, and architecture. Keyboard-navigable with arrow keys.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | TanStack Start + React 19 (SSR-ready, file-based routing) |
| 3D brain viz | React Three Fiber + Three.js (20,484-vertex jet heatmap) |
| Variant tree | XYFlow / React Flow (horizontal layout, gradient edges) |
| Styling | Tailwind CSS 4 |
| Backend & DB | Convex (real-time subscriptions, scheduler, blob storage) |
| AI agent | `@convex-dev/agent` + Claude Sonnet 4.6 (5 tools, multi-turn) |
| Brain model | Meta TRIBE v2 (CC-BY-NC-4.0) |
| GPU compute | NVIDIA B200 via CoreWeave + Northflank |
| Lead enrichment | Clay (OCEAN personality profiles) |

---

## GPU Infrastructure: CoreWeave B200

TRIBE v2 inference runs on a **CoreWeave NVIDIA B200 (Blackwell)** GPU, orchestrated via Northflank. The B200 is required — the model's memory footprint and throughput demand it, and the Blackwell `sm_100` architecture is only supported by PyTorch nightly CUDA 13.0 builds.

### Validated setup

| Property | Value |
|---|---|
| Service | Northflank (`jupyter-pytorch`) |
| Base image | `northflank/public/jupyter-notebook:pytorch2.11.0-cuda12.9-cudnn9-devel` |
| PyTorch runtime | `torch 2.12.0.dev20260415+cu130` (nightly) |
| CUDA arch | `sm_100` confirmed in `torch.cuda.get_arch_list()` |
| Device | `NVIDIA B200` confirmed via `torch.cuda.get_device_name(0)` |
| TRIBE output | `(5, 20484)` — shape verified on smoke-test text input |
| Inference latency | <5 s per variant (subsequent calls; first call downloads weights) |
| Model weight cache | ~5 GB persistent volume (Hugging Face gated — requires `HF_TOKEN`) |

### Why this matters

The stock PyTorch on the Northflank base image **does not support B200** (`sm_100` is missing). Installing the PyTorch nightly CUDA 13.0 build is mandatory. The TRIBE text pipeline also requires the spaCy English large model (`en_core_web_lg==3.8.0`), and the first inference downloads additional gated weights from Hugging Face — budget an extra minute for cold start.

### Setup sequence used on Northflank

```bash
apt-get update && apt-get install -y ffmpeg libsndfile1 git

cd /workspace/tribev2
pip install -e .
pip install -U "huggingface_hub[cli]"
huggingface-cli login

# Replace stock torch with B200-compatible nightly
pip uninstall -y torch torchvision torchaudio
pip install --pre torch torchvision torchaudio \
  --index-url https://download.pytorch.org/whl/nightly/cu130

python -m spacy download en_core_web_lg
```

Verification:

```bash
python -c "
import torch
print(torch.__version__)
print(torch.cuda.is_available())
print(torch.cuda.get_arch_list())
print(torch.cuda.get_device_name(0))
"

python -u -c "
from tribev2 import TribeModel
model = TribeModel.from_pretrained(
    'facebook/tribev2', cache_folder='./cache', device='cuda'
)
events = model.get_events_dataframe(text_path='sample.txt')
preds, segments = model.predict(events)
print(preds.shape)  # → (5, 20484)
"
```

### Inference API (FastAPI)

Deployed at the Northflank service URL. Auth via Bearer token (`INFERENCE_TOKEN`).

| Endpoint | Input | Output |
|---|---|---|
| `POST /predict` | `{ "text": "..." }` | `{ scores, scoreSeries, activationBlob (fp16 base64), shape }` |
| `POST /predict/media` | audio or video file | same structure |
| `GET /health` | — | `{ status: "ok" }` |

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_CONVEX_URL` | Frontend `.env.local` | Convex deployment URL |
| `PYTHON_INFERENCE_URL` | Convex env | GPU inference endpoint |
| `INFERENCE_TOKEN` | Convex env | Bearer auth for inference API |
| `HF_TOKEN` | GPU server | Hugging Face gated model access |
| `TRIBE_CACHE` | GPU server | Model weight cache directory |
| `TRIBE_DEVICE` | GPU server | `cuda` or `cpu` |

The brain mesh is pre-built. To regenerate:

```bash
python scripts/export_mesh.py
cp assets/fsaverage5.glb frontend/public/
```

---

## License

TRIBE v2 is **CC-BY-NC-4.0** — non-commercial only.
