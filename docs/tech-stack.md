# Tech Stack

A complete reference for every technology, library, and service used in BrainReach.

---

## Stack Summary

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | TanStack Start + React 19 | Full-stack framework, SSR, file-based routing |
| **3D Visualization** | React Three Fiber + Three.js | Interactive brain mesh with vertex-level heatmaps |
| **Graph UI** | XYFlow (React Flow) | Variant evolution tree with custom nodes and edges |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Backend & Database** | Convex | Real-time serverless backend, document DB, blob storage |
| **AI Agent** | Convex Agent + Claude Sonnet 4.6 | Multi-turn optimizer with tool use |
| **Brain Model** | Meta TRIBE v2 | fMRI prediction across 20,484 cortical vertices |
| **GPU Compute** | NVIDIA B200 via CoreWeave + Northflank | Inference server hosting |
| **Lead Enrichment** | Clay | OCEAN personality profiles for leads |

---

## Convex (Backend & Database)

Convex serves as the entire backend — database, serverless functions, real-time subscriptions, file storage, and task scheduling.

### Why Convex

- **Real-time by default** — frontend subscribes to queries via WebSocket; when a variant finishes scoring, the UI updates instantly without polling
- **Integrated scheduler** — `ctx.scheduler.runAfter()` chains async work (score a variant → learn from results) without external job queues
- **Blob storage** — `ctx.storage` stores fp16 activation matrices (20,484 vertices × T timesteps) alongside structured data
- **Agent component** — `@convex-dev/agent` provides persistent multi-turn threads, tool registration, and streaming out of the box
- **TypeScript end-to-end** — schema, functions, and queries are all TypeScript with full type inference to the frontend

### How It's Used

| Convex Feature | Usage |
|---------------|-------|
| **Document DB** | Sessions, variants, campaigns, leads — all with indexes |
| **Real-time queries** | `useQuery()` subscriptions for variant scores, campaign stats, agent messages |
| **Mutations** | Variant creation, lesson updates, demo seeding |
| **Actions** | HTTP calls to GPU server, Anthropic API calls via agent |
| **Scheduler** | `scoreVariant` → `learnFromScoring` async pipeline |
| **Storage** | fp16 brain activation blobs (via `ctx.storage.store()`) |
| **Agent component** | Persistent threads, tool-use orchestration, streaming responses |

### Key Files

- `frontend/convex/schema.ts` — data model (4 tables, indexes)
- `frontend/convex/actions.ts` — GPU scoring + learning loop actions
- `frontend/convex/agent.ts` — Claude agent definition + 5 tools
- `frontend/convex/campaigns.ts` — campaign queries/mutations + demo seed data
- `frontend/convex/variants.ts` — variant CRUD + tree operations
- `frontend/convex/chat.ts` — agent thread management + message streaming

### Deployment

- **Region:** EU West 1 (`abundant-buffalo-304.eu-west-1.convex.cloud`)
- **Config:** `frontend/convex/convex.config.ts`
- **Dev server:** `bunx convex dev`

---

## TRIBE v2 (Neural Brain Model)

[TRIBE v2](https://github.com/facebookresearch/tribev2) is Meta's brain-encoding model trained on 500+ hours of fMRI data. Given text (or audio/video), it predicts neural activation across the cortical surface.

### How It Works

1. **Input** — raw text is tokenized by spaCy (`en_core_web_lg`) into timestamped events
2. **Model** — a GPT-scale transformer predicts fMRI BOLD signal per vertex
3. **Output** — shape `(T, 20484)` where T = timesteps, 20484 = fsaverage5 cortical vertices

### Score Extraction (Destrieux Atlas)

The raw 20,484-vertex activations are mapped to 5 outreach-relevant scores using the Destrieux brain atlas:

| Score | Brain Regions (Destrieux Parcels) |
|-------|----------------------------------|
| **Curiosity** | Lateral PFC, IFG, intraparietal sulcus, anterior cingulate |
| **Trust (Social)** | TPJ, angular gyrus, dorsomedial PFC |
| **Resistance (Threat)** | Anterior insula, IFG opercular, mid-anterior cingulate |
| **Attention** | Derived from dorsal/ventral attention networks |
| **Motivation** | Derived from reward circuit (vmPFC) |

Scores are z-normalized per timestep, then aggregated using Kahneman's peak-end rule.

### Deployment

- **Platform:** CoreWeave (NVIDIA B200 GPU) via Northflank container orchestration
- **Runtime:** PyTorch nightly with CUDA 13.0 (`sm_100` arch support)
- **Server:** FastAPI + uvicorn on port 8000
- **Endpoints:** `/predict` (text inference), `/predict/media` (audio/video), `/health`
- **Cache:** ~5 GB persistent volume for model weights
- **License:** CC-BY-NC-4.0 (non-commercial)

---

## Frontend Libraries

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.0 | UI component framework |
| `react-dom` | ^19.2.0 | DOM renderer |
| `@tanstack/react-start` | latest | Full-stack framework (SSR + routing + data loading) |
| `@tanstack/react-router` | latest | File-based routing with type-safe params |

### 3D Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| `three` | ^0.183.2 | 3D graphics engine |
| `@react-three/fiber` | ^9.6.0 | React renderer for Three.js |
| `@react-three/drei` | ^10.7.7 | Helpers (orbit controls, loaders, etc.) |
| `@react-three/postprocessing` | ^3.0.4 | Post-processing effects |

The brain visualization loads an fsaverage5 mesh (`public/fsaverage5.glb`) with 20,484 vertices. Each vertex is colored using a jet colormap based on the activation value at the current timestep. Only the top 20% of activated vertices are rendered for visual clarity.

### Graph / Tree Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| `@xyflow/react` | ^12.10.2 | Variant evolution tree (horizontal layout, custom nodes, gradient edges) |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.1.18 | Utility-first CSS |
| `@tailwindcss/vite` | ^4.1.18 | Vite integration for Tailwind |
| `@tailwindcss/typography` | ^0.5.16 | Prose styling for markdown content |
| `lucide-react` | ^0.545.0 | Icon library |
| `react-rnd` | ^10.5.3 | Draggable/resizable floating window |

### State & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.12 | Lightweight global state management |
| `zod` | ^4.3.6 | Schema validation |

### Backend Client

| Package | Version | Purpose |
|---------|---------|---------|
| `convex` | ^1.35.1 | Convex client SDK (queries, mutations, actions) |

---

## AI / ML Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| `@ai-sdk/anthropic` | ^3.0.69 | Anthropic SDK for Claude API calls |
| `@convex-dev/agent` | ^0.6.1 | Agent framework (threads, tools, streaming) |

**Model used:** Claude Sonnet 4.6 — configured in `frontend/convex/agent.ts`.

---

## Python Backend Dependencies

Defined in `backend/pyproject.toml`. Requires Python >=3.10, <3.12.

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | >=0.115 | Web framework for inference API |
| `uvicorn[standard]` | >=0.32 | ASGI server |
| `numpy` | >=1.26 | Numerical computing |
| `nilearn` | >=0.10.4 | Neuroimaging (Destrieux atlas, ROI extraction) |
| `trimesh` | >=4.4 | 3D mesh processing |
| `pydantic` | >=2.8 | Data validation |
| `httpx` | >=0.27 | Async HTTP client |
| `spacy` | >=3.8 | NLP preprocessing (tokenization for TRIBE) |
| `python-multipart` | >=0.0.12 | Multipart form parsing |
| `tribev2` | git | Meta's brain activation model (installed from GitHub) |

**PyTorch:** Installed separately from nightly index (`cu130`) for NVIDIA B200 Blackwell architecture support.

---

## Build & Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| `vite` | ^8.0.0 | Build tool and dev server |
| `@vitejs/plugin-react` | ^6.0.1 | React Fast Refresh for Vite |
| `typescript` | ^5.7.2 | Type checking |
| `vitest` | ^3.0.5 | Unit testing framework |
| `jsdom` | ^28.1.0 | DOM environment for tests |
| `@tanstack/router-plugin` | ^1.132.0 | Auto-generates route types from file structure |
| `@tanstack/devtools-vite` | latest | DevTools integration |
| `bun` | (system) | Package manager and runtime |

### TypeScript Configuration

- **Target:** ES2022
- **Module resolution:** Bundler mode
- **Strict mode:** Enabled
- **Path aliases:** `#/*` and `@/*` → `./src/*`
- **JSX:** react-jsx

---

## External Services

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| **Clay** | Lead enrichment — OCEAN personality profiles, company data | Seeded in campaign data; send-via-Clay button in UI |
| **Anthropic** | Claude Sonnet 4.6 for variant optimization | `@ai-sdk/anthropic` SDK via Convex Agent |
| **Hugging Face** | Model weight hosting (TRIBE v2, LLaMA 3.2-3B, spaCy models) | `HF_TOKEN` auth for gated model downloads |
| **CoreWeave** | GPU cloud (NVIDIA B200 Blackwell) | Hosts the Python inference server |
| **Northflank** | Container orchestration for GPU workloads | Deploys and manages the inference Docker container |
| **Convex Cloud** | Serverless backend hosting | Real-time DB, functions, storage, agent runtime |
