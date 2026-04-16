"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

      await ctx.runMutation(api.variants.patchScoring, {
        id: variantId,
        status: "done",
        activationStorageId: storageId,
        shape: payload.shape,
        fps: payload.fps,
        hemodynamicOffsetS: payload.hemodynamic_offset_s,
        scores: {
          attention: att,
          curiosity: cur,
          trust: tru,
          motivation: mot,
          resistance: rst,
          overall: att + cur + tru + mot - rst,
        },
        scoreSeries: {
          attention: payload.scores.attention,
          curiosity: payload.scores.curiosity,
          trust: payload.scores.trust,
          motivation: payload.scores.motivation,
          resistance: payload.scores.resistance,
        },
      });
    } catch (e: any) {
      await ctx.runMutation(api.variants.patchScoring, {
        id: variantId,
        status: "failed",
        error: String(e?.message ?? e),
      });
    }
  },
});
