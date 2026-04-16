# Agent Infrastructure

BrainReach's AI layer is built on the [Convex Agent](https://github.com/get-convex/convex-helpers) framework, running Claude Sonnet 4.6 as a multi-turn optimizer that reads neuroscience scores, understands personality psychology, and improves through a self-reinforcing learning loop.

---

## Agent Overview

**Name:** BrainReach Optimizer
**Model:** Claude Sonnet 4.6 (via `@ai-sdk/anthropic`)
**Runtime:** Convex serverless action (Node.js)
**Step limit:** 8 tool calls per generation
**Thread model:** One persistent thread per campaign (multi-turn memory)

The agent is defined in `frontend/convex/agent.ts` and registered as a Convex Agent component in `frontend/convex/convex.config.ts`.

---

## System Instructions

The agent is prompted as a neuroscience-aware copywriting expert. Its core directives:

- **Maximize:** attention, curiosity, trust, motivation
- **Minimize:** resistance
- **Personality mapping:**
  - High Openness → novelty, creative framing
  - High Conscientiousness → structure, safety signals
  - High Extraversion → "we" language, collaboration
  - High Agreeableness → empathy, social proof
  - High Neuroticism → process clarity, reassurance
- Always read campaign lessons before generating a variant
- Always explain changes in the `reasoning` field (markdown)

---

## Agent Tools

The agent has access to 5 registered tools, each backed by a Convex query or mutation:

### 1. `getVariantScores(variantId)`

Fetches a variant's neural scores: attention, curiosity, trust, motivation, resistance. The agent uses this to understand the current state of a variant before optimizing.

### 2. `getLeadProfile(leadId)`

Returns the lead's name, role, company, OCEAN personality traits (0–1), and full personality description. The agent uses this to tailor language to the recipient's psychology.

### 3. `getCampaignLessons(campaignId)`

Retrieves the accumulated markdown lessons from previous A/B tests and human teachings. This is the agent's "memory" — insights that compound across every optimization cycle.

### 4. `createVariant(parentId, message, leadId?, reasoning, hypothesis)`

Creates a new variant as a child of the specified parent. Automatically schedules GPU scoring. Fields:
- `message` — the new email text
- `leadId` — optional, which lead this was optimized for
- `reasoning` — markdown explanation of what changed and why (neural targeting rationale)
- `hypothesis` — label for A/B comparison (e.g., "specificity over flattery")

### 5. `updateLessons(campaignId, newInsights)`

Appends markdown insights to `campaign.lessonsMarkdown`. Called automatically by the learning loop when significant score deltas are detected, or manually by the agent when it discovers a pattern.

---

## Agent Workflow

### User-Triggered Optimization

```
User clicks "Optimize for [Lead]"
         │
         ▼
Frontend: ensureThread({campaignId})
         │ Creates or retrieves agent thread for this campaign
         ▼
Frontend: sendMessage({threadId, prompt})
         │ Prompt includes: variant ID, lead ID, current scores
         ▼
Convex mutation: saves message to thread, schedules generate()
         │
         ▼
Convex action: generate()
         │
         ├── Agent reads: getCampaignLessons()
         │     → "Specificity beats flattery. Collaborative language for high-E."
         │
         ├── Agent reads: getLeadProfile(leadId)
         │     → {name: "Diego", ocean: {e: 0.65, c: 0.80}, ...}
         │
         ├── Agent reads: getVariantScores(variantId)
         │     → {attention: 72, curiosity: 65, trust: 58, ...}
         │
         ├── Agent creates: createVariant(parentId, newMessage, ...)
         │     → New variant inserted, GPU scoring scheduled
         │
         └── Agent stops (max 8 steps)
```

### Automatic Learning Loop

After GPU scoring completes, if the variant has a parent with scores:

```
scoreVariant() completes
         │
         ▼
learnFromScoring() scheduled
         │
         ├── Calculate deltas: child.scores − parent.scores
         │
         ├── IF any delta ≥ 0.05 (5% change):
         │     │
         │     ▼
         │   Agent analyzes the delta
         │     │
         │     ├── "Trust jumped +90% — the specific PromaxBDA reference
         │     │    activated theory-of-mind regions"
         │     │
         │     └── updateLessons() appends insight
         │
         └── ELSE: skip (no significant change to learn from)
```

### Human Teaching

Users can also write lessons directly through the Lessons Drawer:

```
User types: "Mention projects over awards for creative leads"
         │
         ▼
Frontend: updateLessons mutation
         │ Appends to campaign.lessonsMarkdown
         ▼
Next optimization: agent reads getCampaignLessons()
         │ Now includes human-written insight
         ▼
Agent factors human teaching into next variant
```

---

## Learning Loop Design

The learning loop is the mechanism that makes BrainReach compound knowledge over time.

### What Gets Learned

Each lesson is a markdown entry appended to the campaign's `lessonsMarkdown` field. Examples from the demo seed:

- _"Specificity beats flattery: mentioning PromaxBDA Gold specifically lifted trust +90% and reduced resistance −107%"_
- _"Same email, different brain: Lluis showed 3× resistance vs. Diego on identical text — high-N leads need extra safety signals"_
- _"Referencing actual awards triggers curiosity peaks in anterior cingulate"_
- _"High-E profiles respond to collaborative language (trust and motivation both climb)"_

### Why This Architecture

1. **Lessons persist per campaign** — switching leads or variants doesn't lose context
2. **AI and human lessons are equal** — both land in the same markdown field, both are read by the agent
3. **Threshold filtering** — only deltas ≥ 5% trigger lesson generation, preventing noise
4. **Compound effect** — lesson 1 informs variant 2, which reveals lesson 2, which informs variant 3...

### Thread Model

Each campaign gets one persistent agent thread. This means:

- The agent sees the full conversation history for that campaign
- Multi-turn reasoning is preserved (the agent remembers what it already tried)
- Human messages and agent responses interleave naturally
- Thread creation is idempotent (`ensureThread` creates only if one doesn't exist)

---

## Scoring Pipeline Integration

The agent doesn't score variants directly — it delegates to the GPU pipeline:

```
Agent creates variant
    → Convex scheduler triggers scoreVariant action
        → HTTP POST to GPU inference server
            → TRIBE v2 predicts activations
            → Destrieux atlas extracts ROI scores
            → Kahneman peak-end aggregation
        → Scores written to variant document
    → If parent exists: learnFromScoring scheduled
        → Agent analyzes deltas
        → Lessons updated
```

This separation means:
- The agent focuses on language and strategy
- Scoring is deterministic and reproducible
- The pipeline works even without the agent (manual edits score too)

---

## Frontend Agent Interface

The campaign workspace exposes the agent through several interaction points:

| Action | What Happens |
|--------|-------------|
| **Optimize** button | Sends prompt with current variant + lead context → agent generates new variant |
| **Edit & Test** | User edits email inline → creates child variant → GPU scores it (no agent involved) |
| **Lessons Drawer** | Shows all AI + human lessons; counter badge shows total |
| **Teach input** | User writes insight → appended to lessons → agent reads next time |
| **Chat** | Agent responses stream into the UI via `listMessages()` polling |

---

## Configuration

The agent is initialized in `frontend/convex/agent.ts`:

```typescript
const optimizer = new Agent(components.agent, {
  name: "BrainReach Optimizer",
  model: anthropic("claude-sonnet-4-6"),
  instructions: "...",  // neuroscience copywriting expert prompt
  tools: { getVariantScores, getLeadProfile, getCampaignLessons, createVariant, updateLessons },
});
```

The Convex Agent component is integrated in `frontend/convex/convex.config.ts`:

```typescript
const app = defineApp();
app.use(agent);
export default app;
```

Exposed endpoints in `frontend/convex/chat.ts`:
- `ensureThread` — mutation to create/retrieve a thread
- `sendMessage` — mutation to send user prompt + schedule generation
- `listMessages` — query to stream agent responses to the UI
