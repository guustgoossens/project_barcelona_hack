# 04 — Context

## The Hackathon

- **Name**: Project Barcelona
- **Date**: April 15-16, 2026
- **Location**: Itnig (Barcelona). Afterparty: Norrsken House (beach)
- **Format**: 24-hour build, teams of max 3, science fair–style judging
- **Organized by**: Project Europe, with Kibo, Acurio, Itnig
- **Sponsors**: CoreWeave, Anthropic, Lovable
- **Participants**: ~80 engineers, top European builders

## Prizes

- **Grand Jury Prize: €5,000** — best submission across ALL tracks. Primary target.
- Track prizes: mostly non-cash (credits, conference tickets, swag). Not worth optimizing for independently.

## The Tracks (real briefs)

1. **Biorce** — "The Library of Babel": intelligent document organisation and retrieval for clinical trials. Prize: €250 Amazon voucher + lunch. **Not our target.**
2. **Clay** — "Signal over Noise": find non-obvious candidates + generate ultra-personalized outreach. Prize: 12 months Clay + conference tickets. **OUR TRACK.**
3. **Cala** — "Wolf of Wall Street": AI agent that beats S&P 500 buy-and-hold. Prize: €10k Cala credits.
4. **Preply** — Language learning progress visualization. Prize: $2,000 cash.
5. **THEKER** — Robotic visual perception under noisy conditions. Prize: visit to Barcelona HQ.
6. **Vexor** — Predict whether a person will pay debt. Prize: F1 Grand Prix Barcelona tickets.

## Our Team

### Emile
- 4th-year EPITA, SCIA (AI & Data Science), graduating 2027
- Strengths: product vision, pitching, B2B GTM, voice AI, narrative
- Prior wins: Alan Health AI (solo), HrFlow.ai (1st), Mistral Worldwide (top 7), IONIS Goodwills (1st)
- Based in Paris

### Guust Goossens
- MSc X-HEC Data Science & AI for Business, École Polytechnique
- HackEurope 2026: triple track winner (1st DeepMind, 1st Lovable, 3rd Susquehanna) — €50K credits
- IC Hack Imperial: 2nd overall — ERLA recursive research agent, 95%+ groundedness
- Technical strengths: multi-agent systems, knowledge graphs, RAG, voice AI
- Quant finance background, Null Fellows cohort
- Based in Paris/Leuven

## Our Stack & Unfair Advantages

- **TRIBE v2** (Meta, open-source) — brain encoding model predicting neural responses to text. Deployed on B200 GPU via Northflank/CoreWeave.
- **Clay API** — profile database + enrichment
- **Claude Sonnet 4.6** — email generation, persona building, reasoning
- **Lovable** — vibe-coded frontend on top of Clay table
- **B200 GPU (180GB VRAM)** via Northflank — enough to run TRIBE v2 at full precision
- **Anthropic + CoreWeave credits** (sponsors)

## Our Project — NeuralReach

**Track**: Clay — "Signal over Noise"

**One-liner**: The first outreach system that uses Meta's brain encoding model to select the email variant most likely to trigger curiosity and openness in the recipient's neural pathways — personalized per candidate profile.

**Why it wins the Grand Jury**:
- Problem is universal (everyone has sent cold emails, everyone knows the pain)
- Demo is visceral: show brain activation maps changing as you optimize the email
- Technical depth visible in 30 seconds (TRIBE v2 on B200, real neuroscience)
- Narrative is unchallengeable: "We don't optimize for click proxies. We optimize for what happens in the brain."
- Nobody else at Project Barcelona is doing this.

## Key Insight: The Pivot History

1. Started with Biorce (patient recruitment voice AI) → **killed** when real brief dropped (document management, €250 prize)
2. Pivoted to Clay with TRIBE v2 brain encoding → **current direction**
3. The Clay judge (Yash, Head of GTME Ecosystem) explicitly said: "extreme creativity" is most important. TRIBE v2 is the extreme creativity play.

## Compute Setup

- Platform: Northflank
- GPU: 1x NVIDIA B200 (180GB VRAM)
- Image: `northflank/public/jupyter-notebook:pytorch2.11.0-cuda12.9-cudnn9-devel`
- Service URL: `app--jupyter-pytorch--zr8brwblqp2q.code.run`
- Model weights: downloading via `hf download facebook/tribev2`
