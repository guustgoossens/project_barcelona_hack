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

**Step 1 — Campaign Hub**
Open NeuralReach. Show the campaign card with real stats: 8 leads, scored variants, best brain score. "Leads enriched via Clay with OCEAN personality profiles."

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

### 4. Technical reveal (20s)
"TRIBE v2 is Meta's open-source brain encoding model, trained on 500+ hours of fMRI recordings. It predicts neural activity across 20,000 cortical vertices in response to text. We run it on a CoreWeave B200 — 180GB VRAM. Inference in under 5 seconds per email."

### 5. The scoring insight (15s)
"We don't just average the brain response. We apply Kahneman's **peak-end rule**: your brain disproportionately remembers three things — the first impression, the worst moment, and the last thing you read. Our scoring weights all three. One bad sentence at the end of a perfect email? The score crashes. Because that's what the brain does."

### 6. The learning loop (10s)
"Every variant teaches the system something. The AI extracts lessons after each scoring — what worked, what didn't, mapped to brain regions. The human can teach it too. Both sources compound. Campaign 2 starts where campaign 1 left off."

### 7. Business (10s)
"Every GTM team is trying to personalize at scale. Nobody is scoring for what the brain actually retains. We're not optimizing for open rates — we're optimizing for neural memory before the email is sent."

### 8. Close (5s)
"We don't A/B test with click rates. We test with the human brain."

---

## Wow Moments

1. **The brain heatmap changing in real time** as TRIBE evaluates each email variant. One version lights up green (curiosity). One version goes red (avoidance). Visual, visceral, unchallengeable.

2. **Same email, different brain.** Click Diego → green. Click Massimo → resistance spikes. The personality makes the difference.

3. **Human edits instantly scored.** Edit one sentence, click "Test this edit", new node appears with brain scores. Instant feedback loop.

4. **The learning loop visible.** Open lessons, see them grow after each scoring, teach the AI, see it apply your lesson next time.

---

## Q&A

| Q | A |
|---|---|
| "Is there proof brain activation correlates with reply rates?" | "TRIBE explicitly models emotion and social cognition regions — the same regions that drive human decision to respond. And our scoring applies Kahneman's peak-end rule — the most replicated finding in behavioral memory research. We're combining neuroscience with behavioral economics." |
| "Couldn't you just prompt engineer better?" | "Yes — and we do that too. TRIBE is the scoring layer on top of good prompting. Two levels of optimization." |
| "What's the peak-end rule?" | "Kahneman & Fredrickson, 1993. People don't judge experiences by the average — they remember the peak (best or worst moment), the beginning, and the end. We weight our brain scores the same way: 40% mean, 20% first impression, 20% worst moment, 20% last impression. One toxic sentence tanks the score — exactly like it tanks your reply rate." |
| "How fast is inference?" | "Under 5 seconds per email on B200." |
| "What does TRIBE actually output?" | "20,484 cortical vertex activation predictions per timestep. We aggregate the vertices mapped to curiosity, emotion, and social cognition regions via the Destrieux atlas." |
| "Why Clay specifically?" | "Clay's database + enrichment gives us the signal to build accurate OCEAN personality profiles. The richer the persona, the more targeted the email variants." |
| "How does the AI learn?" | "After each TRIBE scoring, the agent compares parent vs child scores. If there's a meaningful delta, it extracts a lesson — what changed, which scores moved, why. Humans can add their own observations too. Both sources are read before every optimization." |
| "Can the human override the AI?" | "Yes — at every step. Edit the email inline, test your version, teach it a lesson, prune bad branches. The AI is a copilot, not an autopilot." |

---

## Backup

- Screenshots of brain heatmaps if GPU is slow during demo
- Pre-run all variants with scores saved
- Video of the full pipeline running (90s, on phone)

---

## Clay Team Feedback (collected at hackathon)

A Clay team member told us directly that **NeuralReach could go way beyond outreach** — into sales enablement, account management, and any written communication where you need to influence a decision.

Their exact framing: it's not just about cold emails. It's about **any moment where you need someone to say yes** — closing a deal, renewing a contract, getting buy-in from a stakeholder. Every GTM team writes hundreds of these messages a day and optimizes on gut feeling.

### Implications for the pitch

This validates the "platform, not a feature" angle. When pitching to the Grand Jury:

> "We built this for outreach, but the Clay team told us something we hadn't considered: every sales call follow-up, every contract renewal email, every investor update — they're all messages that need a 'yes.' TRIBE v2 scores all of them."

This is the "this could be a company Monday morning" signal that Project Europe judges reward.
