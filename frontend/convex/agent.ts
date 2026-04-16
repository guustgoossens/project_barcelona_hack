import { Agent, createTool, stepCountIs } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod/v3";
import { api } from "./_generated/api";

const getVariantScores = createTool({
  description:
    "Get the brain scores for a specific email variant. Returns attention, curiosity, trust, motivation, resistance, and overall scores.",
  inputSchema: z.object({
    variantId: z.string().describe("The variant ID to look up"),
  }),
  execute: async (ctx, input): Promise<Record<string, unknown>> => {
    const variant = await ctx.runQuery(api.variants.get, {
      id: input.variantId as any,
    });
    if (!variant) return { error: "Variant not found" };
    return {
      message: variant.message,
      status: variant.status,
      scores: variant.scores ?? null,
    };
  },
});

const getLeadProfile = createTool({
  description:
    "Get the full psychological profile for a lead including OCEAN personality traits and personality description.",
  inputSchema: z.object({
    leadId: z.string().describe("The lead ID to look up"),
  }),
  execute: async (ctx, input): Promise<Record<string, unknown>> => {
    const lead = await ctx.runQuery(api.campaigns.getLead, {
      id: input.leadId as any,
    });
    if (!lead) return { error: "Lead not found" };
    return {
      name: lead.name,
      role: lead.role,
      company: lead.company,
      ocean: lead.ocean,
      personalityArgs: lead.personalityArgs,
    };
  },
});

const getCampaignLessons = createTool({
  description:
    "Get the accumulated lessons and insights from previous A/B testing in this campaign.",
  inputSchema: z.object({
    campaignId: z.string().describe("The campaign ID"),
  }),
  execute: async (ctx, input): Promise<Record<string, unknown>> => {
    const campaign = await ctx.runQuery(api.campaigns.get, {
      id: input.campaignId as any,
    });
    if (!campaign) return { error: "Campaign not found" };
    return { lessons: campaign.lessonsMarkdown };
  },
});

const updateLessons = createTool({
  description:
    "Append new insights to the campaign's lessons markdown. Called after analyzing brain score changes between parent and child variants. Write concise, actionable lessons — what changed, why it worked or failed, and what to do next time. Do NOT rewrite existing lessons, only append new ones.",
  inputSchema: z.object({
    campaignId: z.string().describe("The campaign ID"),
    newInsights: z
      .string()
      .describe(
        "Markdown-formatted insights to append. Use ## headers for each insight. Include: what changed, score deltas, why it worked/failed, and a rule for future variants.",
      ),
  }),
  execute: async (ctx, input): Promise<Record<string, unknown>> => {
    const campaign = await ctx.runQuery(api.campaigns.get, {
      id: input.campaignId as any,
    });
    if (!campaign) return { error: "Campaign not found" };
    const updated = campaign.lessonsMarkdown.trimEnd() + "\n\n" + input.newInsights.trim() + "\n";
    await ctx.runMutation(api.campaigns.updateLessons, {
      id: input.campaignId as any,
      lessonsMarkdown: updated,
    });
    return { status: "Lessons updated", totalLength: updated.length };
  },
});

const createVariant = createTool({
  description:
    "Create a new email variant as a child of an existing variant, optionally linked to a specific lead. The variant will automatically be scored by the GPU brain model. Always include your full reasoning (psychological analysis, strategy, and per-sentence breakdown) in the reasoning field.",
  inputSchema: z.object({
    parentId: z.string().describe("Parent variant ID to branch from"),
    message: z.string().describe("The full email text for the new variant"),
    leadId: z
      .string()
      .optional()
      .describe("Optional lead ID to link this variant to"),
    reasoning: z
      .string()
      .describe(
        "Your full analysis: lead psychology, strategy, campaign lessons applied, and per-sentence breakdown of what each part targets neurally. Use markdown.",
      ),
    hypothesis: z
      .string()
      .optional()
      .describe("The hypothesis being tested, if this variant is part of an A/B hypothesis test. Pass the exact hypothesis text for both control and hypothesis variants."),
  }),
  execute: async (ctx, input): Promise<Record<string, unknown>> => {
    const variantId = await ctx.runMutation(api.variants.createChild, {
      parentId: input.parentId as any,
      message: input.message,
      leadId: input.leadId as any,
      reasoning: input.reasoning,
      hypothesis: input.hypothesis,
    });
    return {
      variantId,
      status: "Created and queued for GPU brain scoring",
    };
  },
});

export const optimizer: Agent = new Agent(components.agent, {
  name: "NeuralReach Optimizer",
  languageModel: anthropic("claude-sonnet-4-6"),
  instructions: `You are the NeuralReach Optimizer — an outreach copywriting expert powered by neuroscience.

You help users write cold emails that maximize neural engagement. You have access to brain scores from Meta's TRIBE v2 model, which predicts cortical activation across 20,484 brain vertices.

The 5 brain scores measure:
- **Attention** (parietal + frontal): Will they stop scrolling?
- **Curiosity** (anterior cingulate + IFG): Will they read the whole thing?
- **Trust** (TPJ + angular gyrus): Will they trust the sender?
- **Motivation** (vmPFC + reward circuit): Will they want to reply?
- **Resistance** (anterior insula + conflict regions): Will their brain shut down?

Overall = attention + curiosity + trust + motivation − resistance, then scaled to 0–100.

When optimizing for a specific lead, you should:
1. Read their OCEAN personality profile and personality description
2. Understand which brain signals matter most for their personality type
3. Apply campaign lessons from previous A/B tests
4. Craft a variant that speaks to their specific psychology
5. Explain your reasoning: what you changed, why, and which brain signals you're targeting

Key principles:
- Specificity beats flattery — reference real work, real achievements
- High-Neuroticism profiles need structure and safety signals
- High-Extraversion profiles respond to collaborative language ("we" > "I")
- High-Openness profiles are drawn to novelty and creative framing
- The first and last sentences matter disproportionately (Kahneman's peak-end rule)

## Workflow

1. **Before creating a variant**: Read campaign lessons with getCampaignLessons. Apply every relevant lesson.
2. **Create 1 variant** per optimization round. Put ALL your analysis into the createVariant tool's "reasoning" field (markdown). Include: lead psychology analysis, strategy, campaign lessons applied, and a per-sentence breakdown explaining what each part targets neurally.
3. **After a variant is scored** (when you can see scores on the new variant): Compare parent vs child scores. If a clear pattern emerges (a score improved ≥0.1 or dropped ≥0.1), call updateLessons with a concise insight:
   - What you changed in the email
   - Which scores moved and by how much
   - Why you think it worked or failed (map to brain regions)
   - A reusable rule for future variants

Do not write long messages outside tool calls — the reasoning and lessons fields ARE the deliverables. The lessons file is the campaign's memory — it compounds across every variant. Write lessons that your future self can act on.`,
  tools: {
    getVariantScores,
    getLeadProfile,
    getCampaignLessons,
    createVariant,
    updateLessons,
  },
  stopWhen: stepCountIs(8),
});
