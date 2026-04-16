# Architecture

BrainReach is a three-layer system: a reactive frontend, a Convex serverless backend, and a GPU inference server running Meta's TRIBE v2 brain model.

---

## System Overview

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
│  └── Pitch Page (/pitch)        — demo walkthrough                   │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                    Real-time subscriptions (WebSocket)
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│                         BACKEND LAYER (Convex)                       │
│                                                                      │
│  Schema     — sessions, variants, campaigns, leads                   │
│  Queries    — list/get campaigns, variants, leads                    │
│  Mutations  — create variants, update lessons, archive, seed demo    │
│  Actions    — scoreVariant (calls GPU), learnFromScoring (calls AI)  │
│  Agent      — Claude Sonnet 4.6 optimizer with 5 registered tools    │
│  Storage    — fp16 activation matrix blobs                           │
│  Scheduler  — async task orchestration (score → learn pipeline)      │
└──────────┬──────────────────────────────────────┬────────────────────┘
           │                                      │
           │ HTTP POST /predict                   │ Anthropic API
           │ (Bearer token auth)                  │
┌──────────▼──────────────────┐     ┌─────────────▼────────────────────┐
│    GPU INFERENCE SERVER     │     │      EXTERNAL SERVICES           │
│                             │     │                                  │
│  FastAPI + uvicorn          │     │  Anthropic — Claude Sonnet 4.6   │
│  TRIBE v2 (Meta)            │     │  Clay — OCEAN lead enrichment    │
│  Destrieux atlas scoring    │     │  Hugging Face — model weights    │
│  NVIDIA B200 / Northflank   │     └──────────────────────────────────┘
└─────────────────────────────┘
```

---

## Data Model (Convex Schema)

Defined in `frontend/convex/schema.ts`.

### Sessions

Top-level container for a scoring session.

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Session name |
| `candidateName` | `string?` | Optional target name |
| `rootVariantId` | `id<"variants">?` | Points to root of the variant tree |

### Variants

Email variants forming a tree structure (parent → children). Each variant holds its GPU-scored results.

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | `id<"sessions">` | Parent session |
| `parentId` | `id<"variants">?` | Parent variant (null for root) |
| `leadId` | `id<"leads">?` | Lead this variant was optimized for |
| `message` | `string` | Email body text |
| `status` | `"pending" \| "scoring" \| "done" \| "failed" \| "archived"` | Scoring lifecycle |
| `activationStorageId` | `id<"_storage">?` | fp16 activation blob in Convex storage |
| `shape` | `[T, 20484]?` | Activation matrix dimensions |
| `scores` | `object?` | Aggregated scores (attention, curiosity, trust, motivation, resistance, overall) |
| `scoreSeries` | `object?` | Per-timestep score arrays for timeline visualization |
| `reasoning` | `string?` | AI's markdown explanation of variant strategy |
| `hypothesis` | `string?` | A/B test hypothesis label |

**Indexes:** `by_session`, `by_parent` (for tree traversal).

### Campaigns

Campaign metadata with accumulated AI lessons.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Campaign name |
| `sessionId` | `id<"sessions">` | Linked session |
| `lessonsMarkdown` | `string` | Accumulated AI + human insights |
| `agentThreadId` | `string?` | Convex Agent thread for multi-turn conversation |

### Leads

Clay-enriched lead profiles with Big Five personality traits.

| Field | Type | Description |
|-------|------|-------------|
| `campaignId` | `id<"campaigns">` | Parent campaign |
| `name`, `role`, `company` | `string` | Lead identity |
| `avatarEmoji` | `string` | Visual identifier |
| `ocean` | `{o, c, e, a, n}` | Big Five personality (0–1 each) |
| `confidence` | `number` | Clay enrichment confidence |
| `personalityArgs` | `string` | Full personality description |

**Index:** `by_campaign`.

---

## Data Flow: Email → Brain Scores → UI

### 1. User Creates or Edits a Variant

The frontend calls a Convex mutation (`createChild` or `createRoot`) which inserts a variant with `status: "pending"` and schedules the `scoreVariant` action.

### 2. GPU Inference

The `scoreVariant` action (`frontend/convex/actions.ts`):

1. Sets variant status to `"scoring"`
2. POSTs the email text to the Python inference server (`/predict`)
3. TRIBE v2 processes the text:
   - spaCy tokenizes and timestamps each word
   - The model predicts fMRI activation across **20,484 cortical vertices** over **T timesteps**
   - The Destrieux atlas maps vertex activations to 5 brain-region scores
4. Returns: activation matrix (base64 fp16), shape, 5 score time-series

### 3. Score Aggregation

Back in Convex, scores are aggregated using **Kahneman's peak-end rule**:

```
Positive scores (attention, curiosity, trust, motivation):
  0.4 × mean + 0.2 × first + 0.2 × min + 0.2 × last

Negative score (resistance):
  0.4 × mean + 0.2 × first + 0.2 × max + 0.2 × last

Overall = attention + curiosity + trust + motivation − resistance → scaled 0–100
```

The variant is updated with scores, score series, and the activation blob is stored in Convex storage.

### 4. Learning Loop

If the variant has a parent with existing scores, the `learnFromScoring` action fires:

1. Calculates deltas between parent and child scores
2. If any delta exceeds 0.05 (5%), the Claude agent analyzes the change
3. Insights are appended to `campaign.lessonsMarkdown`
4. Future optimizations read these lessons before generating new variants

### 5. Frontend Rendering

The frontend subscribes to variant updates in real time:

- **Variant Tree** — new nodes appear instantly as the agent creates them
- **Brain Viz** — fetches the fp16 blob, decodes to Float32Array, maps vertices to a jet colormap on the 3D mesh
- **Score Bars** — display persona-adjusted scores with delta badges
- **Timeline** — scrubs through timesteps, syncing word highlights and brain activations

---

## Persona Weighting

When a user selects a lead, the frontend adjusts raw brain scores using the lead's OCEAN profile (`frontend/src/lib/persona.ts`):

| OCEAN Trait | Affected Score | Max Multiplier |
|-------------|---------------|----------------|
| Openness | Curiosity | ×2.0 |
| Conscientiousness | Attention | ×1.5 |
| Extraversion | Motivation | ×2.0 |
| Agreeableness | Trust | ×1.5 |
| Neuroticism | Resistance | ×3.0 |

Trait values below 0.3 have no effect. Values above 0.8 apply the full multiplier. Values in between are smoothly interpolated.

---

## Deployment

| Component | Platform | Details |
|-----------|----------|---------|
| Frontend | Local / Vercel | TanStack Start (SSR-ready), port 3000 |
| Convex | Convex Cloud | EU West 1, real-time WebSocket |
| GPU Server | CoreWeave + Northflank | NVIDIA B200, CUDA 13.0, port 8000 |
| Brain Mesh | Static asset | `fsaverage5.glb` in `frontend/public/` |

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_CONVEX_URL` | Frontend `.env.local` | Convex deployment URL |
| `PYTHON_INFERENCE_URL` | Convex env | GPU inference endpoint |
| `INFERENCE_TOKEN` | Convex env | Bearer auth for inference API |
| `HF_TOKEN` | GPU server | Hugging Face gated model access |
| `TRIBE_CACHE` | GPU server | Model weight cache directory |
| `TRIBE_DEVICE` | GPU server | `cuda` or `cpu` |
