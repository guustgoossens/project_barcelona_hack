# 07 — Pitch

## The 10-Second Hook

> "Every cold email you've ever sent was a guess. We use Meta's brain model to stop guessing."

## The 30-Second Story

> "Clay gives us the profiles. Claude writes 5 versions of the email. Then we do something nobody else does: we run each version through TRIBE v2 — Meta's open-source brain encoding model — and predict which one activates curiosity and openness in the recipient's neural pathways. We send that one. Not the best-written one. The one the brain responds to."

## The 2-Minute Demo

### 1. Hook (10s)
The line. Let it land.

### 2. Problem (15s)
Cold outreach is broken. Everyone is sending AI-generated emails that feel AI-generated. Open rates are dying. The personalization is fake — it mentions someone's job title and calls it personal.

### 3. Live demo (90s)

**Step 1 — Profile**
Pull a real candidate from Clay database. Show their profile.

**Step 2 — 3 Variants**
Claude generates 3 emails. Different hooks, different tones. Show them side by side.

**Step 3 — THE BRAIN SCAN**
Run all 3 through TRIBE v2 on our B200 GPU. Show the brain activation heatmap for each.
- Variant A: lights up threat/avoidance regions → reject
- Variant B: flat → reject
- **Variant C: curiosity + social cognition regions fire → SEND THIS ONE**

**Step 4 — Send**
Variant C goes out via Clay. Dashboard updates.

### 4. Technical reveal (20s)
"TRIBE v2 is Meta's open-source brain encoding model, trained on 500+ hours of fMRI recordings. It predicts neural activity across 70,000 brain voxels in response to text. We run it on a CoreWeave B200 — 180GB VRAM. Inference in under 5 seconds per email. We map voxel activations to known emotion and curiosity regions from neuroscience literature."

### 5. Business (15s)
"Every GTM team is trying to personalize at scale. Nobody is personalizing for the brain. We're not optimizing for open rates — we're optimizing for neural engagement before the email is sent."

### 6. Close (5s)
"We don't A/B test with click rates. We test with the human brain."

---

## Wow Moment

**The brain heatmap changing in real time** as TRIBE evaluates each email variant. One version lights up green (curiosity). One version goes red (avoidance). Visual, visceral, unchallengeable.

---

## Q&A

| Q | A |
|---|---|
| "Is there proof brain activation correlates with reply rates?" | "TRIBE explicitly models emotion and social cognition regions — the same regions that drive human decision to respond. We're running it as a proxy for engagement likelihood. It's a bet on neuroscience, not a proven correlation yet — but it's a better bet than synonym-swapping an email template." |
| "Couldn't you just prompt engineer better?" | "Yes — and we do that too. TRIBE is the scoring layer on top of good prompting. Two levels of optimization." |
| "How fast is inference?" | "Under 5 seconds per email on B200." |
| "What does TRIBE actually output?" | "70,000 voxel activation predictions. We aggregate the voxels mapped to curiosity, emotion, and social cognition regions — documented in the TRIBE v2 paper." |
| "Why Clay specifically?" | "Clay's database + enrichment gives us the signal to build accurate personas. The richer the persona, the more targeted the email variants." |

---

## Backup

- Screenshots of brain heatmaps if GPU is slow during demo
- Pre-run 5 candidate comparisons with results saved
- Video of the full pipeline running (90s, on phone)

---

## Clay Team Feedback (collected at hackathon)

A Clay team member told us directly that **NeuralReach could go way beyond outreach** — into sales enablement, account management, and any written communication where you need to influence a decision.

Their exact framing: it's not just about cold emails. It's about **any moment where you need someone to say yes** — closing a deal, renewing a contract, getting buy-in from a stakeholder. Every GTM team writes hundreds of these messages a day and optimizes on gut feeling.

### Implications for the pitch

This validates the "platform, not a feature" angle. When pitching to the Grand Jury:

> "We built this for outreach, but the Clay team told us something we hadn't considered: every sales call follow-up, every contract renewal email, every investor update — they're all messages that need a 'yes.' TRIBE v2 scores all of them."

This is the "this could be a company Monday morning" signal that Project Europe judges reward.
