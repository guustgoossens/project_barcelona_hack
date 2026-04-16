# 05 — My Project

## Name

**NeuralReach**

## Track

**Clay — "Signal over Noise"**

## One-Liner

The first outreach system powered by Meta's brain encoding model (TRIBE v2). For each lead, we generate email variants, score each on 5 neural engagement signals, adjust scores per the lead's Big Five personality, and iterate in a visual tree — branching the winners, pruning the losers.

## The Concept: Spray & Clay

**Not spray and pray. Spray and Clay.**

Instead of sending one generic email and hoping, we:
1. Pull real leads from Clay with enriched profiles
2. Build a Big Five (OCEAN) personality profile per lead (done in Clay)
3. Generate multiple email variants
4. Score each variant through TRIBE v2 (Meta's brain encoding model) on a B200 GPU
5. Adjust scores per lead's personality using Big Five → brain score weighting
6. Visualize the evolution in a horizontal tree — branch the good, prune the bad
7. Each campaign accumulates lessons (patterns, anti-patterns) in a markdown file
8. Next campaign starts smarter

## Core UX: The Campaign Workspace

### Page 1: Campaign Hub (`/`)
- Grid of campaign cards (1 active for demo, 2 locked placeholders)
- Click active campaign → enter workspace

### Page 2: Campaign Workspace (`/campaign/$id`)

**The tree is the hero.** Full-screen React Flow graph showing email variant evolution:
- Nodes flow left → right (root → iterations)
- Each node shows: status pill, overall score, message preview
- Pan, zoom, drag built-in
- Click a node → floating window opens

**The floating window** (macOS-style, react-rnd):
- Draggable by title bar, resizable from edges
- macOS traffic light dots (red = close, yellow/green = decoration)
- **3 tabs:**
  - **Notes**: Campaign lessons rendered from markdown (patterns, anti-patterns, what works per persona type)
  - **Brain**: 3D brain activation heatmap + timeline + score bars (with persona deltas if lead selected)
  - **Leads**: Lead profiles with Big Five OCEAN bars, confidence scores, personality arguments. Click a lead → scores adjust on Brain tab.
- **Action bar**: Branch new variant / Optimize with AI / Prune

## What TRIBE v2 Does

TRIBE v2 is Meta's open-source brain encoding model. Text in → predicted fMRI activity across 20,484 cortical vertices. We extract 5 outreach-funnel scores via the Destrieux atlas:

| Score | Question | Brain regions |
|---|---|---|
| **Attention** | "Will they stop scrolling?" | Dorsal + ventral attention networks |
| **Curiosity** | "Will they read the whole thing?" | Anterior cingulate, info-gap regions |
| **Trust** | "Will they trust the sender?" | Theory of mind network (TPJ, dmPFC) |
| **Motivation** | "Will they want to reply?" | Cortical reward circuit (vmPFC) |
| **Resistance** | "Will their brain shut down?" | Aversion/conflict network (insula) |

**Overall** = attention + curiosity + trust + motivation − 2 × resistance

**Kahneman scoring**: 40% mean + 20% first impression + 20% worst moment + 20% last impression (primacy-peak-recency rule).

## Big Five Persona Scoring

TRIBE v2 predicts average human neural response. We personalize it per lead using Big Five (OCEAN) profiles from Clay:

| Trait | Brain Score | Max Weight |
|---|---|---|
| Openness (O) | Curiosity | ×2.0 |
| Conscientiousness (C) | Attention | ×1.5 |
| Extraversion (E) | Motivation | ×2.0 |
| Agreeableness (A) | Trust | ×1.5 |
| Neuroticism (N) | Resistance | ×3.0 (penalty) |

Smooth interpolation: trait < 0.3 → no effect, trait > 0.8 → max weight.

## Demo Campaign: "Creative Branding Designer — Barcelona"

**3 real leads from Clay CSV:**

| Lead | Role | Company | Key OCEAN | Demo purpose |
|---|---|---|---|---|
| Diego Troiano | Art Director & Motion Designer | Dtmg.tv Studio | O:0.91 E:0.72 N:0.22 | High openness = curiosity fires, low resistance |
| Lluis Gimeno | Exec Creative Director | El Kolador | C:0.85 N:0.62 | High neuroticism = resistance spikes on same email |
| Nilton Navarro | Brand Manager & Influencer | InfoJobs | E:0.95 A:0.88 N:0.15 | Extreme extraversion = motivation explodes |

**3 email variants:**
- v1 (archived): Generic template → bad scores
- v2: References Vimeo/Discovery work → better
- v2.1: References PromaxBDA Gold specifically → best scores

**Lessons learned:**
- Specificity beats flattery (trust +90%, resistance −107%)
- Referencing actual awards triggers curiosity peaks (anterior cingulate activates)
- Same email, different brain (Lluis 3× resistance vs. Diego on same text)
- High-E profiles respond to collaborative language ("what we're building" > "what I'm building")

## Self-Improving Loop (Vision)

Each campaign has a markdown lessons file. Both humans and AI agents update it based on:
- Brain scores from TRIBE v2
- Persona-adjusted patterns per Big Five type
- Campaign results (open rates, reply rates — future)

Next campaign reads these lessons → starts with better variants → accumulates more insights → compound improvement.

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | TanStack Start + React 19 |
| Tree viz | React Flow (`@xyflow/react`) |
| Window | react-rnd (draggable/resizable) |
| 3D brain | React Three Fiber + Three.js |
| Styling | Tailwind CSS 4 + Lucide icons |
| Backend/DB | Convex (realtime) |
| Brain model | TRIBE v2 on NVIDIA B200 (180GB VRAM) via Northflank |
| Persona | Big Five (OCEAN) from Clay → `persona.ts` weight function |
| GPU API | FastAPI at `https://app--jupyter-pytorch--zr8brwblqp2q.code.run/predict` |

## Pitch Line

> "We don't spray and pray. We spray and Clay."
> "We don't A/B test with click rates. We test with the human brain before we send."
