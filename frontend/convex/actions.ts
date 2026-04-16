"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { optimizer } from "./agent";
import { createThread } from "@convex-dev/agent";
import { components } from "./_generated/api";

export const scoreVariant = action({
  args: { variantId: v.id("variants") },
  handler: async (ctx, { variantId }) => {
    await ctx.runMutation(api.variants.patchScoring, {
      id: variantId,
      status: "scoring",
    });

    const variant = await ctx.runQuery(api.variants.get, { id: variantId });
    if (!variant) throw new Error("variant vanished");

    const url = process.env.PYTHON_INFERENCE_URL;
    const token = process.env.INFERENCE_TOKEN;
    if (!url) throw new Error("PYTHON_INFERENCE_URL not set");

    try {
      const res = await fetch(`${url}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ input_type: "text", text: variant.message }),
      });
      if (!res.ok) {
        throw new Error(`inference ${res.status}: ${await res.text()}`);
      }
      const payload = (await res.json()) as {
        shape: number[];
        activations_b64_fp16: string;
        fps: number;
        hemodynamic_offset_s: number;
        scores: {
          attention: number[];
          curiosity: number[];
          trust: number[];
          motivation: number[];
          resistance: number[];
          overall: number;
        };
      };

      const bytes = Uint8Array.from(atob(payload.activations_b64_fp16), (c) =>
        c.charCodeAt(0),
      );
      const storageId = await ctx.storage.store(
        new Blob([bytes], { type: "application/octet-stream" }),
      );

      // Primacy-peak-recency: 40% mean + 20% first + 20% worst + 20% last
      const aggPos = (xs: number[]) => {
        if (!xs.length) return 0;
        const m = xs.reduce((a, b) => a + b, 0) / xs.length;
        return 0.4 * m + 0.2 * xs[0] + 0.2 * Math.min(...xs) + 0.2 * xs[xs.length - 1];
      };
      const aggNeg = (xs: number[]) => {
        if (!xs.length) return 0;
        const m = xs.reduce((a, b) => a + b, 0) / xs.length;
        return 0.4 * m + 0.2 * xs[0] + 0.2 * Math.max(...xs) + 0.2 * xs[xs.length - 1];
      };

      const att = aggPos(payload.scores.attention);
      const cur = aggPos(payload.scores.curiosity);
      const tru = aggPos(payload.scores.trust);
      const mot = aggPos(payload.scores.motivation);
      const rst = aggNeg(payload.scores.resistance);

      const childScores = {
        attention: att,
        curiosity: cur,
        trust: tru,
        motivation: mot,
        resistance: rst,
        overall: att + cur + tru + mot - rst,
      };

      await ctx.runMutation(api.variants.patchScoring, {
        id: variantId,
        status: "done",
        activationStorageId: storageId,
        shape: payload.shape,
        fps: payload.fps,
        hemodynamicOffsetS: payload.hemodynamic_offset_s,
        scores: childScores,
        scoreSeries: {
          attention: payload.scores.attention,
          curiosity: payload.scores.curiosity,
          trust: payload.scores.trust,
          motivation: payload.scores.motivation,
          resistance: payload.scores.resistance,
        },
      });

      // Trigger learning loop: if variant has a parent with scores, analyze the delta
      if (variant.parentId) {
        const parent = await ctx.runQuery(api.variants.get, { id: variant.parentId });
        if (parent?.scores) {
          // Find the campaign for this session
          const campaigns = await ctx.runQuery(api.campaigns.list, {});
          const campaign = campaigns.find((c: any) => c.sessionId === variant.sessionId);
          if (campaign) {
            await ctx.scheduler.runAfter(0, internal.actions.learnFromScoring, {
              campaignId: campaign._id,
              parentMessage: parent.message.slice(0, 200),
              childMessage: variant.message.slice(0, 200),
              parentScores: parent.scores,
              childScores,
              leadId: variant.leadId ?? undefined,
            });
          }
        }
      }
    } catch (e: any) {
      await ctx.runMutation(api.variants.patchScoring, {
        id: variantId,
        status: "failed",
        error: String(e?.message ?? e),
      });
    }
  },
});

// Learning loop: agent analyzes parent→child score delta and updates campaign lessons
export const learnFromScoring = internalAction({
  args: {
    campaignId: v.id("campaigns"),
    parentMessage: v.string(),
    childMessage: v.string(),
    parentScores: v.object({
      attention: v.number(),
      curiosity: v.number(),
      trust: v.number(),
      motivation: v.number(),
      resistance: v.number(),
      overall: v.number(),
    }),
    childScores: v.object({
      attention: v.number(),
      curiosity: v.number(),
      trust: v.number(),
      motivation: v.number(),
      resistance: v.number(),
      overall: v.number(),
    }),
    leadId: v.optional(v.id("leads")),
  },
  handler: async (ctx, args) => {
    const { campaignId, parentMessage, childMessage, parentScores, childScores, leadId } = args;

    const campaign = await ctx.runQuery(api.campaigns.get, { id: campaignId });
    if (!campaign) return;

    // Ensure thread exists
    let threadId = campaign.agentThreadId;
    if (!threadId) {
      threadId = await createThread(ctx, components.agent, {
        title: `${campaign.name} — Learning`,
      });
      await ctx.runMutation(api.campaigns.updateLessons, {
        id: campaignId,
        lessonsMarkdown: campaign.lessonsMarkdown,
      });
    }

    const delta = (key: keyof typeof parentScores) =>
      (childScores[key] - parentScores[key]).toFixed(3);

    let leadContext = "";
    if (leadId) {
      const lead = await ctx.runQuery(api.campaigns.getLead, { id: leadId });
      if (lead) {
        leadContext = `\nThis variant was optimized for ${lead.name} (${lead.role}, OCEAN: O=${lead.ocean.o} C=${lead.ocean.c} E=${lead.ocean.e} A=${lead.ocean.a} N=${lead.ocean.n}).`;
      }
    }

    const prompt = `A new variant just got scored by TRIBE v2. Analyze the parent→child score delta and extract a reusable lesson.

**Parent email** (first 200 chars): "${parentMessage}"
**Child email** (first 200 chars): "${childMessage}"
${leadContext}

**Score deltas:**
- Attention: ${delta("attention")} (parent ${parentScores.attention.toFixed(3)} → child ${childScores.attention.toFixed(3)})
- Curiosity: ${delta("curiosity")} (parent ${parentScores.curiosity.toFixed(3)} → child ${childScores.curiosity.toFixed(3)})
- Trust: ${delta("trust")} (parent ${parentScores.trust.toFixed(3)} → child ${childScores.trust.toFixed(3)})
- Motivation: ${delta("motivation")} (parent ${parentScores.motivation.toFixed(3)} → child ${childScores.motivation.toFixed(3)})
- Resistance: ${delta("resistance")} (parent ${parentScores.resistance.toFixed(3)} → child ${childScores.resistance.toFixed(3)})
- Overall: ${delta("overall")} (parent ${parentScores.overall.toFixed(3)} → child ${childScores.overall.toFixed(3)})

Campaign ID: ${campaignId}

If any score moved by ≥0.05, call updateLessons with a concise insight (2-4 sentences max). Format:
## [What you observed]
[Score deltas]. [Why it likely happened — map to brain regions]. [Rule for future variants].

If all deltas are <0.05, the change was negligible — do NOT update lessons. Just respond "No significant delta."`;

    const result = await optimizer.streamText(
      ctx,
      { threadId },
      { prompt },
    );
    await result.consumeStream();
  },
});
