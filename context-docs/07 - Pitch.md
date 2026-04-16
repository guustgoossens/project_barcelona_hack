# 07 — Pitch

## The 10-Second Hook

> "Every cold email you've ever sent was a guess. We use Meta's brain model to stop guessing."

## The 30-Second Story

> "Clay gives us the profiles. Claude writes 5 versions of the email. Then we do something nobody else does: we run each version through TRIBE v2 — Meta's open-source brain encoding model — and predict which one activates curiosity and openness in the recipient's neural pathways. We send that one. Not the best-written one. The one the brain responds to."

---

## Slides

### Slide 1 — PROBLEM: "Outreach is broken"

| 10x | 69% | 0 |
|-----|-----|---|
| more outreach in inboxes | judge on first impression | simulate before sending |
| *Instantly Benchmark 2026* | *Smartlead Cold Email Stats* | *Industry standard* |

Tools like Clay, Instantly, Apollo democratized outbound. Everyone sends personalized emails now. Top talent inboxes are 10x more crowded. 69% of recipients decide spam-or-read in seconds. And yet nobody simulates the brain response before hitting send. Every email is a live experiment on leads you can't afford to lose.

### Slide 2 — SOLUTION: "Simulate the brain before you hit send"

| 5s | x3 | ∞ |
|----|----|----|
| brain score per email | engagement rate | compound learning |
| *B200 GPU inference* | *Backlinko 12M emails* | *AI + human lessons* |

Don't spray and pray. **Spray and Clay.**

### Slide 3 — ARCHITECTURE: "How It Works"

```
Clay (Leads + OCEAN) → Claude 4.6 (Variants) → TRIBE v2 (Brain scoring) → BrainReach (Iterate)

Human teaches + AI learns = Compound loop
```

Tech: Meta TRIBE v2 · Anthropic Claude · NVIDIA B200 · Convex · Clay

---

## The 2-Minute Demo

### 1. Hook (10s)
"Outreach is broken." Show slide 1. Let the numbers land.

### 2. Solution (10s)
Show slide 2. "We simulate the brain before you hit send."

### 3. Architecture (5s)
Flash slide 3. "Clay leads, Claude variants, TRIBE v2 brain scoring, BrainReach to iterate."

### 4. Live demo (90s)

**Step 1 — Campaign Hub**
Open BrainReach. Show the campaign card with real stats: 8 leads, scored variants, best brain score. "Leads enriched via Clay with OCEAN personality profiles."

**Step 2 — The Tree**
Click into the campaign. Show the variant evolution tree. "Each node is an email version. They branch, they get scored, the best survive."

**Step 3 — THE BRAIN SCAN**
Click a node. The floating window opens — 3D brain lights up.
- v1: generic → resistance fires red → bad score
- v2.1: specific (references PromaxBDA Gold) → curiosity and trust fire → high score

**Step 4 — Personality Shift**
Select Diego (low neuroticism) → scores look good. Select Massimo (higher neuroticism) → same email, resistance spikes. "Same email, different brain."

**Step 5 — Human Edits**
Hover the email text → pencil appears → edit a sentence → "Test this edit" → new node appears, TRIBE scores it. "The human stays in control."

**Step 6 — AI Optimizes**
Select Nilton (extreme extraversion) → "Optimize for Nilton" → agent reads his OCEAN profile + campaign lessons → generates a personalized variant with full reasoning.

**Step 7 — Learning Loop**
Open the Lessons drawer. "4 lessons so far. The AI added a 5th after the last scoring. Watch — I'll teach it something." Type: "For architects, mention projects over awards." Click Add. "Next optimization reads this."

**Step 8 — Send**
Select best variant + lead → "Send to Diego via Clay" → toast: "Email sent via Clay — Delivered to Diego Troiano at Dtmg.tv Studio."

### 5. Technical reveal (15s)
"TRIBE v2 is Meta's open-source brain encoding model, trained on 500+ hours of fMRI recordings. It predicts neural activity across 20,000 cortical vertices. We run it on a CoreWeave B200. Inference in under 5 seconds."

### 6. Close (5s)
"We don't A/B test with click rates. We test with the human brain."

---

## Wow Moments

1. **The brain heatmap changing in real time** — one version lights up green (curiosity), one goes red (avoidance). Visual, visceral, unchallengeable.
2. **Same email, different brain.** Click Diego → green. Click Massimo → resistance spikes.
3. **Human edits instantly scored.** Edit one sentence → new node → brain scores.
4. **The learning loop visible.** Open lessons, see them grow, teach the AI, watch it apply your lesson.

---

## Q&A

| Q | A |
|---|---|
| "Is there proof brain activation correlates with reply rates?" | "TRIBE models emotion and social cognition regions — the same regions that drive the decision to respond. Our scoring applies Kahneman's peak-end rule — the most replicated finding in behavioral memory research." |
| "Couldn't you just prompt engineer better?" | "Yes — and we do. TRIBE is the scoring layer on top of good prompting. Two levels of optimization." |
| "What's the peak-end rule?" | "Kahneman 1993. People remember the peak, the beginning, and the end. We weight scores the same way: 40% mean, 20% first, 20% worst, 20% last." |
| "How fast is inference?" | "Under 5 seconds per email on B200." |
| "Why Clay specifically?" | "Clay gives us enriched OCEAN personality profiles. The richer the persona, the more targeted the brain scoring." |
| "Can the human override the AI?" | "Yes — at every step. Edit inline, test your version, teach it a lesson, prune bad branches." |

---

## Backup Plan

- Pre-scored variants with brain activations cached (no GPU dependency during demo)
- Screenshots of brain heatmaps if GPU is slow
- Video of the full pipeline running (90s, on phone)

---

## Clay Team Feedback

A Clay team member said **BrainReach could go beyond outreach** — into sales enablement, account management, any written communication where you need a "yes."

> "We built this for outreach, but the Clay team told us: every sales follow-up, every contract renewal, every investor update — they all need a 'yes.' TRIBE v2 scores all of them."
