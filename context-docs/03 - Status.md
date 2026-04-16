# 03 — Status (as of 2026-04-16 ~09h)

## Current state

**Full campaign workspace built.** React Flow tree with pan/zoom, floating macOS-style window (react-rnd) with 3 tabs (Notes/Brain/Leads), Big Five persona-adjusted scoring, real Clay leads seeded. TRIBE v2 inference API live on B200 GPU. UI uses Clay-inspired light theme.

## What exists

| Area | Path | State |
|---|---|---|
| Frontend | `frontend/` | TanStack Start + React Flow + react-rnd. Routes `/` (campaign hub), `/campaign/$id` (workspace). |
| Campaign Hub | `frontend/src/routes/index.tsx` | Landing page with 3 campaign cards (1 active, 2 locked), Seed Demo button, Reset & Reseed button. |
| Campaign Workspace | `frontend/src/routes/campaign.$id.tsx` | Full-screen React Flow tree + floating window with 3 tabs. All scoring logic (Kahneman peak-end rule). |
| Horizontal Tree | `frontend/src/components/HorizontalTree.tsx` | React Flow (`@xyflow/react`) with custom VariantNode, horizontal layout, pan/zoom/drag. |
| Floating Window | Uses `react-rnd` | macOS-style title bar (traffic lights), draggable by title bar, resizable from edges. Tabs: Notes, Brain, Leads. |
| Brain Viz | `frontend/src/components/Brain.tsx` | React Three Fiber, fsaverage5 mesh (20,484 vertices), bloom post-processing. Unchanged from v1. |
| Score Bars | `frontend/src/components/ScoreBars.tsx` | 5 funnel scores with gradient bars, persona-adjusted overlay with delta badges. |
| Persona Scoring | `frontend/src/lib/persona.ts` | Big Five (OCEAN) → brain score weighting. Smooth interpolation: O→Curiosity×2, C→Attention×1.5, E→Motivation×2, A→Trust×1.5, N→Resistance×3. |
| Convex | `frontend/convex/` | Schema: sessions, variants, campaigns, leads. Queries/mutations for all. `seedDemo` + `resetDemo` mutations. |
| GPU inference (live) | `gpu/server.py` | FastAPI `/predict` on Northflank B200. Returns base64 fp16 `(T, 20484)` + 5 outreach-funnel scores. **Live at `https://app--jupyter-pytorch--zr8brwblqp2q.code.run`**. |
| Seed Data | `frontend/convex/campaigns.ts` | Campaign: "Creative Branding Designer — Barcelona". 3 real Clay leads (Diego Troiano, Lluis Gimeno, Nilton Navarro). 3 email variants (generic → specific → best). |
| Legacy components | `frontend/src/components/LeadCard.tsx`, `LeadList.tsx`, `LessonsPane.tsx`, `BranchTree.tsx` | Still exist but NOT used by campaign page. Campaign page has inline components (LeadsView, NotesView). |

## What's done

- [x] TRIBE v2 inference on B200 — verified `(T, 20484)` output
- [x] `gpu/server.py` deployed on Northflank, publicly accessible
- [x] 5 outreach-funnel brain scores (attention, curiosity, trust, motivation, resistance)
- [x] Kahneman peak-end scoring (40% mean + 20% first + 20% worst + 20% last)
- [x] Brain heatmap threshold — only top 20% activated vertices light up
- [x] Word-by-word segment mapping in API + WordStream component
- [x] Convex schema: sessions, variants, campaigns, leads (with Big Five OCEAN)
- [x] Campaign hub landing page (3 cards, 1 active, 2 locked)
- [x] React Flow horizontal tree (pan, zoom, custom nodes, smoothstep edges)
- [x] Floating macOS window via react-rnd (draggable, resizable)
- [x] 3 tabs in window: Notes (markdown), Brain (3D viz + timeline + scores), Leads (OCEAN profiles)
- [x] Big Five persona-adjusted scoring with smooth interpolation
- [x] Real Clay leads seeded (Diego Troiano, Lluis Gimeno, Nilton Navarro)
- [x] Reset & Reseed functionality
- [x] Clay-inspired light theme (white bg, gray borders, subtle shadows)

## What's still open / needs improvement

- [ ] **UI/UX polish** — the overall layout and visual quality need significant improvement. The tree nodes, the floating window, the tab content — all need to look more professional and polished. Clay's actual UI is much cleaner.
- [ ] **Tree visual quality** — nodes should be more visually appealing, connections smoother, maybe add animations on selection.
- [ ] **Window tabs content** — Brain tab needs better layout (brain viz + scores side by side). Leads tab needs a cleaner card design. Notes tab needs better typography.
- [ ] **Connect Convex → GPU API**: `bunx convex env set PYTHON_INFERENCE_URL https://app--jupyter-pytorch--zr8brwblqp2q.code.run`
- [ ] **Score variants before demo** — run `seedDemo`, wait for GPU scoring to complete on all 3 variants.
- [ ] **Pre-cache brain data** — ensure all variants are scored and activations stored in Convex BEFORE the demo (no GPU latency on stage).
- [ ] **🔴 CRITICAL: Email variant generation with Claude** — currently emails are hardcoded in seed. Must integrate Anthropic API (Claude Sonnet 4.6) to generate variants dynamically based on the lead's profile + campaign context + lessons learned. When user clicks "Optimize" or "Branch", Claude generates a new variant informed by the lead's Big Five profile, the campaign lessons markdown, and the previous variant's brain scores. This is a core differentiator for the demo — shows the AI iteration loop is real, not scripted.
- [ ] **🔴 CRITICAL: Actually send emails via Clay** — integrate Clay's outreach API to send the winning variant directly from the app. During the demo, after brain-scoring and selecting the best variant, click "Send via Clay" → email goes out to the real lead. If we can show "we sent this email during the demo and got a reply" → instant win. Even sending to a teammate pretending to be the lead counts. The judge signal is: this is a real product, not a prototype.
- [ ] **Response tracking** — track open/reply rates and feed back into lessons. Lower priority but would complete the self-improving loop.

## Architecture

```
Landing Page (/) → Campaign list → click active campaign
       ↓
Campaign Workspace (/campaign/$id)
  ├── React Flow tree (full screen, pan/zoom)
  │     └── Custom VariantNode components
  │           └── Click → opens floating window
  ├── Floating Window (react-rnd, draggable/resizable)
  │     ├── Tab: Notes → rendered markdown (campaign lessons)
  │     ├── Tab: Brain → 3D brain + timeline + score bars
  │     │     └── Persona-adjusted scores if lead selected
  │     └── Tab: Leads → lead profiles with OCEAN bars
  │           └── Click lead → adjusts Brain tab scores
  └── Action bar → Branch / Optimize / Prune
```

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend framework | TanStack Start + React 19 |
| Tree visualization | React Flow (`@xyflow/react`) |
| Floating window | react-rnd |
| 3D brain | React Three Fiber + Three.js |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Backend/DB | Convex |
| Brain model | TRIBE v2 (Meta) on B200 GPU via Northflank |
| Persona scoring | Big Five (OCEAN) → brain score weights |

## Demo flow (4 minutes)

1. **Landing page** (5s): "Here are our campaigns. We're targeting Creative Branding Designers in Barcelona."
2. **Click campaign** → full-screen tree appears
3. **Click v1** (15s): "Our first draft. Generic. Watch the brain — avoidance regions light up red. Score: -1.87."
4. **Click v2.1** (30s): "We iterated twice. The brain changes — curiosity and trust fire up. Score improved."
5. **Leads tab** → Click Diego (20s): "Diego is high Openness, creative risk-taker. Scores adapt to his personality."
6. **Click Lluis** (20s): "Lluis is high Neuroticism. Same email, resistance explodes. We wouldn't send this one to him."
7. **Click Nilton** (15s): "Nilton is extremely extraverted. Motivation spikes on collaborative language."
8. **Notes tab** (10s): "The system learns. Specificity beats flattery. Same email, different brain."
9. **Branch** (30s): New node → GPU scores → brain changes → scores improve.
10. **Close** (10s): "We don't spray and pray. We spray and Clay."

## Dev commands

```bash
# Terminal 1: Convex
cd frontend && bunx convex dev

# Terminal 2: Frontend
cd frontend && bun run dev

# Set GPU URL in Convex (run once)
cd frontend && bunx convex env set PYTHON_INFERENCE_URL https://app--jupyter-pytorch--zr8brwblqp2q.code.run
```

## Key files for next agent

| File | What it does | Lines |
|---|---|---|
| `frontend/src/routes/campaign.$id.tsx` | **Main campaign page** — all scoring logic, floating window, 3 tabs, inline sub-components | ~500 |
| `frontend/src/components/HorizontalTree.tsx` | React Flow tree with custom nodes | ~155 |
| `frontend/src/routes/index.tsx` | Landing page with campaign cards | ~115 |
| `frontend/convex/campaigns.ts` | Convex functions + seed data + reset | ~175 |
| `frontend/convex/schema.ts` | DB schema (sessions, variants, campaigns, leads) | ~70 |
| `frontend/src/lib/persona.ts` | Big Five → score weighting | ~50 |
| `frontend/src/components/ScoreBars.tsx` | Score bars with persona overlay | ~100 |
| `frontend/src/components/Brain.tsx` | 3D brain visualization (R3F) | ~125 |
