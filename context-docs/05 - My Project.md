# 05 — My Project

## Name

**NeuralReach** (working title)

## Track

**Clay — "Signal over Noise"**

## One-Liner

The first outreach system powered by Meta's brain encoding model (TRIBE v2). Generates multiple email variants per candidate, runs them through a neural simulation to predict brain activation in curiosity and openness regions, and sends the version most likely to get a response.

## The Core Insight

Every other team will:
1. Enrich profiles from Clay's database
2. Ask Claude to write a "personalized" email
3. Send it

We do:
1. Enrich profiles from Clay's database → Claude infers persona type
2. Ask Claude to write **3-5 variants** per candidate, targeted to persona
3. Run each variant through **TRIBE v2** on a B200 GPU
4. Extract 5 outreach-funnel brain scores (attention, curiosity, trust, motivation, resistance)
5. Apply persona-specific weights → pick the variant that scores best FOR THIS PERSON
6. Show the 3D brain activation heatmap changing between variants in the dashboard

## What TRIBE v2 Actually Does Here

TRIBE v2 is Meta's open-source brain encoding model. It takes text input and predicts fMRI brain activity across 20,484 cortical vertices (fsaverage5). We map these activations to the Destrieux atlas and extract 5 outreach-funnel scores:

| Score | Question it answers | Brain regions (Destrieux parcels) |
|---|---|---|
| **Attention** | "Will they stop scrolling?" | Supramarginal gyrus, intraparietal sulcus, middle frontal gyrus, superior frontal sulcus (dorsal + ventral attention networks) |
| **Curiosity** | "Will they read the whole thing?" | Anterior cingulate (info-gap), pars triangularis, orbital IFG, middle frontal sulcus |
| **Trust** | "Will they trust the sender?" | Middle temporal gyrus (TPJ), angular gyrus, superior frontal (dmPFC), precuneus (theory of mind network) |
| **Motivation** | "Will they want to reply?" | Gyrus rectus (vmPFC), suborbital sulcus, subcallosal gyrus, medial orbital sulcus, anterior cingulate (cortical reward circuit) |
| **Resistance** | "Will their brain shut down?" | Anterior insula, anterior circular sulcus, pars opercularis, mid-anterior cingulate (aversion/conflict network) |

**Overall** = attention + curiosity + trust + motivation - 2 × resistance

We optimize emails to maximize attention + curiosity + trust + motivation and minimize resistance.

### Persona-weighted scoring (next step)

TRIBE v2 predicts generic human neural responses — it can't simulate a specific person's brain. But we can weight the 5 scores differently per persona type inferred by Claude from the Clay profile:

| Persona | Weights emphasis |
|---|---|
| Technical IC | Curiosity x2 |
| CEO / Exec | Attention x2, Resistance x3 penalty |
| Researcher | Curiosity x2, Trust x1.5 |
| Sales / GTM | Trust x2, Motivation x2 |

The personalization happens at two levels: (1) Claude generates variants targeted to the persona, (2) TRIBE scoring is weighted to what matters most for that persona type.

## Full Pipeline

```
Clay profile database
        ↓
Persona builder (Claude) — infer persona type (exec, IC, researcher, sales...)
        ↓
Email variant generator (Claude) — 3-5 variants per candidate, different tones/hooks
        ↓
TRIBE v2 scoring (B200 GPU) — 5 brain scores per variant (attention, curiosity, trust, motivation, resistance)
        ↓
Persona-weighted ranking — apply persona-specific weights to select optimal variant
        ↓
Send via Clay outreach
        ↓
Dashboard — 3D brain heatmap + score bars + variant comparison
```

## The Demo Moment

Show the brain activation heatmap changing as TRIBE v2 evaluates each email variant. One variant lights up curiosity regions. Another triggers avoidance. We send the first one.

**The line judges will remember**: *"We don't A/B test with click rates. We test with the human brain before we send."*

## Use Case (deliberately broad per Clay judge's hint)

Not just recruiting. The brief is "find people who will change your life." We demo for:
1. **Hiring** — finding a non-obvious engineering candidate
2. **Co-founder matching** — finding someone whose neural profile matches your communication style
3. Potentially: **investor outreach**, **mentor finding**

This matches Clay judge Yash's explicit hint that the use case doesn't have to be recruiting.

## Tech Stack

| Layer | Tool |
|---|---|
| Profile data | Clay API |
| Persona + email generation | Claude Sonnet 4.6 (Anthropic credits) |
| Brain scoring | TRIBE v2 (facebook/tribev2) → 5 Destrieux ROI scores |
| GPU compute | B200 180GB via Northflank/CoreWeave |
| Inference server | `gpu/server.py` — minimal FastAPI, clone-and-run on Northflank |
| Frontend | TanStack Start + React Three Fiber |
| DB + realtime | Convex (`abundant-buffalo-304`, eu-west-1) |
| Outreach sending | Clay native |

## Scope — 24h constraint

### Must-have for demo
- [x] TRIBE v2 running on B200, returns 5 outreach-funnel brain scores for text input
- [x] Inference API live at `https://app--jupyter-pytorch--zr8brwblqp2q.code.run/predict`
- [ ] 3 email variants generated by Claude per candidate profile
- [ ] TRIBE scoring selects winner (persona-weighted)
- [ ] Brain activation visualization (3D heatmap)
- [ ] At least 5 real candidates from Clay database processed end-to-end
- [ ] One actually sent email with a real response (if possible)

### Nice-to-have
- [ ] Persona-weighted scoring (different weights per persona type)
- [ ] Dashboard with live brain map + variant comparison
- [ ] Response rate tracking

### Cut
- ❌ Voice call outreach (Clay track doesn't need it — save for another project)
- ❌ Multi-language (not relevant for Clay)
- ❌ Fine-tuning TRIBE (no time, not needed)

## Validated Results

Tested on the live API with two emails:

| Score | Generic cold email | Personalized email | Delta |
|---|---|---|---|
| Attention | 0.05 | -0.13 | - |
| Curiosity | -0.21 | -0.13 | +38% |
| Trust | -0.32 | -0.03 | **+90%** |
| Motivation | -0.31 | -0.25 | +19% |
| Resistance | 0.54 | -0.04 | **-107%** |
| **Overall** | **-1.87** | **-0.56** | **+1.3 pts** |

The model clearly differentiates between generic and personalized outreach. Trust rises, resistance drops. This is the demo.

## Confidence

- Clay track win: **55-65%** — TRIBE v2 live + validated differentiation + exact judge criteria match
- Grand Jury €5k: **25-35%** — brain heatmap is the clip nobody forgets
