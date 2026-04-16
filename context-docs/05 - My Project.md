# 05 — My Project

## Name

**NeuralReach**

## Track

**Clay — "Signal over Noise"**

## One-Liner

The first outreach system powered by Meta's brain encoding model (TRIBE v2). For each lead, we generate email variants, score each on 5 neural engagement signals, adjust scores per the lead's Big Five personality, and iterate in a visual tree — branching the winners, pruning the losers. Human and AI lessons compound across every iteration.

## The Concept: Spray & Clay

**Not spray and pray. Spray and Clay.**

Instead of sending one generic email and hoping, we:
1. Pull real leads from Clay with enriched profiles
2. Build a Big Five (OCEAN) personality profile per lead (done in Clay)
3. Generate multiple email variants
4. Score each variant through TRIBE v2 (Meta's brain encoding model) on a B200 GPU
5. Adjust scores per lead's personality using Big Five → brain score weighting
6. Visualize the evolution in a horizontal tree — branch the good, prune the bad
7. Human edits emails inline and tests new versions with one click
8. AI + human lessons compound in a shared knowledge base
9. Send the winning variant via Clay
10. Next campaign starts smarter

## Core UX: The Campaign Workspace

### Page 1: Campaign Hub (`/`)
- Hero branding (NeuralReach logo, tagline, "Spray and Clay" slogan)
- Single campaign card with real-time stats (leads, variants, best score)
- Clay badge: "Leads enriched via Clay with OCEAN personality profiles"
- Seed Demo / Reset & Reseed buttons

### Page 2: Campaign Workspace (`/campaign/$id`)

**The tree is the hero.** Full-screen React Flow graph showing email variant evolution:
- Nodes flow left → right (root → iterations)
- Each node shows: score (animated pop-in), message preview, hypothesis badge, mini score bars
- Score-colored gradient edges connecting parent → child
- Pan, zoom built-in
- Click a node → floating window opens

**The floating window** (macOS-style, react-rnd, 3-column):
- Draggable by title bar, resizable from edges
- macOS traffic light dots (red = close)

**Left column: Email + Leads**
- Email text with inline editing (hover → pencil icon → edit → "Test this edit" creates a new node)
- Toggle Original / Personalized when a lead-specific variant exists
- AI Reasoning collapsible (markdown analysis of why changes were made)
- Lead selector with Clay badge, initials avatars
- OCEAN profile bars (labeled "Enriched via Clay")

**Center column: Brain Visualization**
- 3D brain mesh (fsaverage5, 20,484 vertices) with jet colormap activation heatmap
- Timeline scrubber synced to brain activation timesteps
- Word-by-word text highlight synced to timeline
- Loading state with pulsing brain silhouette

**Right column: Brain Scores**
- 5 score bars (attention, curiosity, trust, motivation, resistance) with animated fills
- Persona-adjusted scores when lead is selected (delta badges)
- Overall score (0–100) with pop-in animation

**Action bar:**
- **Edit & Test**: Enter inline edit mode on the email
- **Branch**: Open modal to write a new variant or test a hypothesis (A/B with control)
- **Optimize**: AI agent rewrites for selected lead's psychology
- **Send via Clay**: Send winning variant to selected lead (orange button, toast notification)
- **Prune**: Archive low-scoring branches

**Lessons drawer** (slide-out from right):
- Auto-updating AI lessons from TRIBE v2 scoring analysis
- Human "Teach the AI" input at the bottom
- Insight counter, "auto-updating" badge
- Markdown rendering

## What TRIBE v2 Does

TRIBE v2 is Meta's open-source brain encoding model. Text in → predicted fMRI activity across 20,484 cortical vertices. We extract 5 outreach-funnel scores via the Destrieux atlas:

| Score | Question | Brain regions |
|---|---|---|
| **Attention** | "Will they stop scrolling?" | Dorsal + ventral attention networks |
| **Curiosity** | "Will they read the whole thing?" | Anterior cingulate, info-gap regions |
| **Trust** | "Will they trust the sender?" | Theory of mind network (TPJ, dmPFC) |
| **Motivation** | "Will they want to reply?" | Cortical reward circuit (vmPFC) |
| **Resistance** | "Will their brain shut down?" | Aversion/conflict network (insula) |

**Overall** = attention + curiosity + trust + motivation − resistance, scaled to 0–100.

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

## Self-Improving Learning Loop

Every optimization round feeds into the next:

```
Agent reads lessons → generates variant → TRIBE v2 scores → 
Agent compares parent vs child → extracts insight → appends to lessons →
Human reviews/teaches → next optimize starts smarter
```

Both the AI agent and the human contribute to lessons:
- **AI lessons**: Auto-generated after each scoring. Format: what changed, score deltas, why it worked/failed, reusable rule.
- **Human lessons**: Written via "Teach the AI" input in the lessons drawer. Format: free-text observations.

The agent reads ALL lessons (AI + human) before every optimization via `getCampaignLessons`. Knowledge compounds.

## Human-in-the-Loop

The human can intervene at every step:

| Action | How | What happens |
|---|---|---|
| **Edit email** | Hover email → pencil → edit text | "Test this edit" creates a child node, auto-scored by TRIBE |
| **Branch** | Action bar → Branch button | Modal: write new variant from scratch, or test a hypothesis (A/B) |
| **Teach** | Lessons drawer → "Teach the AI" | Human insight appended to lessons, agent reads it next time |
| **Select lead** | Click lead in panel | Auto-shows personalized variant if one exists; scores adjust to OCEAN |
| **Prune** | Action bar → Prune | Archives bad branches and descendants |
| **Send** | Action bar → Send via Clay | Sends winning variant to lead (simulated for demo) |

## Demo Campaign: "Creative Branding Designer — Barcelona"

**8 real leads from Clay with OCEAN profiles:**

| Lead | Role | Company | Key OCEAN | Demo purpose |
|---|---|---|---|---|
| Guillaume Descordes | Sr Character Artist | Fortis Games | O:0.78 C:0.75 N:0.25 | Quiet, craft-focused creative |
| Diego Troiano | Art Director & Motion Designer | Dtmg.tv Studio | O:0.78 C:0.80 N:0.22 | High openness, low resistance |
| Lluis Gimeno | Exec Creative Director | El Kolador | O:0.82 N:0.28 | Anti-fluff communicator |
| Massimo Lo Bianco | Founder & Artist Manager | 22MGMT.co | C:0.82 E:0.78 N:0.45 | Higher neuroticism = resistance spikes |
| Michael Hoffman | Executive Coach & Author | ScaleYOU | O:0.82 C:0.78 | Analytical, learning-driven |
| Didac Esteve | Co-CEO & Art Director | Esteve Arquitectes | O:0.82 E:0.80 | Provocateur, community builder |
| Nilton Navarro Flores | Brand Manager | InfoJobs | E:0.92 A:0.82 N:0.15 | Extreme extraversion = motivation explodes |
| Kike Doatis | Independent Creative Director | Kike Doatis | O:0.88 A:0.78 | Poetic, LGBTQ+ champion |

**3 email variants:**
- v1 (archived): Generic template → bad scores
- v2: References Vimeo/Discovery work → better
- v2.1: References PromaxBDA Gold specifically → best scores

**Pre-seeded lessons:**
- Specificity beats flattery (trust +90%, resistance −107%)
- Referencing actual awards triggers curiosity peaks (anterior cingulate activates)
- Same email, different brain (Lluis 3× resistance vs. Diego on same text)
- High-E profiles respond to collaborative language ("what we're building" > "what I'm building")

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | TanStack Start + React 19 |
| Tree viz | React Flow (`@xyflow/react`) |
| Window | react-rnd (draggable/resizable) |
| 3D brain | React Three Fiber + Three.js |
| Styling | Tailwind CSS 4 + Lucide icons |
| Backend/DB | Convex (realtime) |
| AI Agent | Claude Sonnet 4.6 via @ai-sdk/anthropic + @convex-dev/agent |
| Brain model | TRIBE v2 on NVIDIA B200 (180GB VRAM) via Northflank |
| Persona | Big Five (OCEAN) from Clay → `persona.ts` weight function |
| GPU API | FastAPI at `https://app--jupyter-pytorch--zr8brwblqp2q.code.run/predict` |

## Pitch Line

> "We don't spray and pray. We spray and Clay."
> "We don't A/B test with click rates. We test with the human brain before we send."
