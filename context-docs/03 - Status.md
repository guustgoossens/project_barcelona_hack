# 03 — Status (as of 2026-04-16 ~14h)

## Current state

**Full campaign workspace built with human-in-the-loop AI optimization.** React Flow tree with pan/zoom, floating macOS-style 3-column inspector (react-rnd), Big Five persona-adjusted scoring, real Clay leads seeded. TRIBE v2 inference API live on B200 GPU. Self-improving learning loop: AI + human lessons compound across iterations. Clay integration visible throughout UI.

## What exists

| Area | Path | State |
|---|---|---|
| Frontend | `frontend/` | TanStack Start + React Flow + react-rnd. Routes `/` (campaign hub), `/campaign/$id` (workspace). |
| Campaign Hub | `frontend/src/routes/index.tsx` | Hero branding, real stats (leads/variants/best score), Clay badge, single active campaign card. |
| Campaign Workspace | `frontend/src/routes/campaign.$id.tsx` | Full-screen React Flow tree + floating 3-column window. Human-in-the-loop: inline edit, teach mode, auto-show personalized variants. |
| Horizontal Tree | `frontend/src/components/HorizontalTree.tsx` | React Flow with custom VariantNode, score-pop animations, gradient edges, hypothesis badges. |
| Floating Window | Uses `react-rnd` | macOS-style 3-column layout: Left (email + leads), Center (brain viz + timeline), Right (scores). |
| Brain Viz | `frontend/src/components/Brain.tsx` | React Three Fiber, fsaverage5 mesh (20,484 vertices), jet colormap, auto-rotate. |
| Score Bars | `frontend/src/components/ScoreBars.tsx` | 5 funnel scores with animated gradient bars, persona-adjusted overlay with delta badges. |
| Persona Scoring | `frontend/src/lib/persona.ts` | Big Five (OCEAN) → brain score weighting. Smooth interpolation. |
| Convex Backend | `frontend/convex/` | Schema: sessions, variants, campaigns, leads. Agent with 5 tools (including updateLessons). Learning loop via `learnFromScoring`. |
| AI Agent | `frontend/convex/agent.ts` | Claude Sonnet 4.6 optimizer with 5 tools: getVariantScores, getLeadProfile, getCampaignLessons, createVariant, updateLessons. |
| Learning Loop | `frontend/convex/actions.ts` | Auto-triggered after scoring: agent compares parent→child deltas, extracts reusable lessons, appends to campaign lessons. |
| GPU inference | `gpu/server.py` | FastAPI `/predict` on Northflank B200. Returns base64 fp16 `(T, 20484)` + 5 outreach-funnel scores. |
| Seed Data | `frontend/convex/campaigns.ts` | Campaign: "Creative Branding Designer — Barcelona". 8 real Clay leads with OCEAN profiles. 3 email variants. |

## What's done

- [x] TRIBE v2 inference on B200 — verified `(T, 20484)` output
- [x] `gpu/server.py` deployed on Northflank, publicly accessible
- [x] 5 outreach-funnel brain scores (attention, curiosity, trust, motivation, resistance)
- [x] Kahneman peak-end scoring (40% mean + 20% first + 20% worst + 20% last)
- [x] Brain heatmap threshold — only top 20% activated vertices light up
- [x] Word-by-word segment mapping in API + WordStream component
- [x] Convex schema: sessions, variants, campaigns, leads (with Big Five OCEAN)
- [x] Campaign hub with hero branding, real stats, Clay badge
- [x] React Flow horizontal tree (pan, zoom, custom nodes, gradient edges, score animations)
- [x] Floating macOS window via react-rnd (3-column: email+leads / brain+timeline / scores)
- [x] Big Five persona-adjusted scoring with smooth interpolation
- [x] 8 real Clay leads seeded with OCEAN profiles and personality descriptions
- [x] Reset & Reseed functionality
- [x] Clay branding visible throughout: header ("Powered by Clay"), leads panel badge, OCEAN "Enriched via Clay", home page badge
- [x] "Send via Clay" button on best variant with toast notification (simulated)
- [x] Claude Sonnet 4.6 agent with 5 tools (optimize, score lookup, lead profile, lessons, create variant)
- [x] A/B hypothesis testing (control + hypothesis variants via agent)
- [x] Self-improving learning loop: auto-lessons after each TRIBE v2 scoring
- [x] Human-in-the-loop: inline Edit & Test (hover email → edit → "Test this edit" → new node)
- [x] Human-in-the-loop: Teach mode in lessons drawer (human writes observations, agent reads them)
- [x] Human-in-the-loop: auto-show personalized variant when selecting a lead
- [x] Lessons drawer with counter, auto-updating badge, markdown rendering
- [x] Score-pop animations on tree nodes and score bars
- [x] Dead code cleanup (10 unused components removed)
- [x] Score animations: bar-fill, score-pop, node-glow, toast transitions

## What's still open

- [ ] **Connect Convex → GPU API**: `bunx convex env set PYTHON_INFERENCE_URL https://app--jupyter-pytorch--zr8brwblqp2q.code.run`
- [ ] **Pre-score variants before demo** — run `seedDemo`, wait for GPU scoring to complete
- [ ] **Pre-cache brain data** — ensure all variants are scored and activations stored BEFORE demo
- [ ] **Have backup screenshots** if GPU is slow during live demo

## Architecture

```
Landing Page (/) → Campaign card → click to enter workspace
       ↓
Campaign Workspace (/campaign/$id)
  ├── React Flow tree (full screen, pan/zoom)
  │     └── Custom VariantNode (score animations, hypothesis badges)
  │           └── Click → opens floating window
  ├── Floating Window (react-rnd, 3-column)
  │     ├── Left: Email (inline editable) + Lead selector (Clay badge, OCEAN bars)
  │     ├── Center: 3D brain viz + timeline scrubber
  │     └── Right: Brain scores (persona-adjusted if lead selected)
  ├── Action bar: Edit & Test / Branch / Optimize / Send via Clay / Prune
  ├── Lessons drawer: auto-updating AI lessons + human "Teach" input
  └── Learning loop: score → agent analyzes delta → updates lessons → next optimize reads them
```

## Human-in-the-loop flow

```
Human edits email ──→ "Test this edit" ──→ new node ──→ TRIBE scores
Human teaches lesson ──→ appended to lessons ──→ agent reads on next optimize
Human selects lead ──→ auto-shows personalized variant if exists
Agent optimizes ──→ TRIBE scores ──→ agent extracts lesson ──→ lessons grow
                                                                    ↓
                                                         Next optimize starts smarter
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
| Backend/DB | Convex (realtime) |
| AI Agent | Claude Sonnet 4.6 via @ai-sdk/anthropic + @convex-dev/agent |
| Brain model | TRIBE v2 (Meta) on B200 GPU via Northflank |
| Persona scoring | Big Five (OCEAN) → brain score weights |

## Demo flow (4 minutes)

1. **Landing page** (5s): Hero branding, real stats, Clay badge. Click campaign.
2. **Tree appears** → click v1 (15s): "Generic draft. Watch the brain — avoidance fires. Bad score."
3. **Click v2.1** (20s): "We iterated. Curiosity and trust fire up. Score improved."
4. **Select Diego** (15s): "Diego is high Openness. Auto-shows his personalized version."
5. **Select Lluis** (15s): "Lluis is high Neuroticism. Same email, resistance explodes."
6. **Edit & Test** (20s): Hover email → edit a sentence → "Test this edit" → new node, TRIBE scores.
7. **Optimize** (20s): Click "Optimize for Nilton" → agent reads lessons + OCEAN → new variant.
8. **Open Lessons** (15s): "4 lessons. The AI added a 5th after scoring. Watch."
9. **Teach** (15s): Write "For architects, mention projects over awards" → Add. Agent reads this next time.
10. **Send via Clay** (10s): Select best + lead → "Send to Diego via Clay" → toast.
11. **Close** (5s): "We don't spray and pray. We spray and Clay."

## Dev commands

```bash
# Terminal 1: Convex
cd frontend && bunx convex dev

# Terminal 2: Frontend
cd frontend && bun run dev

# Set GPU URL in Convex (run once)
cd frontend && bunx convex env set PYTHON_INFERENCE_URL https://app--jupyter-pytorch--zr8brwblqp2q.code.run
```

## Key files

| File | What it does | Lines |
|---|---|---|
| `frontend/src/routes/campaign.$id.tsx` | Main workspace — 3-column window, inline edit, lessons drawer, all scoring logic | ~900 |
| `frontend/src/components/HorizontalTree.tsx` | React Flow tree with animated score nodes | ~310 |
| `frontend/src/routes/index.tsx` | Landing page with hero, real stats, Clay badge | ~140 |
| `frontend/convex/agent.ts` | Claude Sonnet 4.6 agent with 5 tools | ~170 |
| `frontend/convex/actions.ts` | GPU scoring + learning loop (learnFromScoring) | ~200 |
| `frontend/convex/campaigns.ts` | Convex functions + 8 leads seed data | ~240 |
| `frontend/convex/schema.ts` | DB schema (sessions, variants, campaigns, leads) | ~75 |
| `frontend/src/lib/persona.ts` | Big Five → score weighting | ~50 |
| `frontend/src/components/ScoreBars.tsx` | Animated score bars with persona overlay | ~120 |
| `frontend/src/components/Brain.tsx` | 3D brain visualization (R3F) | ~115 |
