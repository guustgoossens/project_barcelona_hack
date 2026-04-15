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
          curiosity: number[];
          social: number[];
          threat: number[];
          aggregate: number;
          valence: number;
        };
      };

      const bytes = Uint8Array.from(atob(payload.activations_b64_fp16), (c) =>
        c.charCodeAt(0),
      );
      const storageId = await ctx.storage.store(
        new Blob([bytes], { type: "application/octet-stream" }),
      );

      const mean = (xs: number[]) =>
        xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

      await ctx.runMutation(api.variants.patchScoring, {
        id: variantId,
        status: "done",
        activationStorageId: storageId,
        shape: payload.shape,
        fps: payload.fps,
        hemodynamicOffsetS: payload.hemodynamic_offset_s,
        scores: {
          curiosity: mean(payload.scores.curiosity),
          social: mean(payload.scores.social),
          threat: mean(payload.scores.threat),
          valence: payload.scores.valence,
          aggregate: payload.scores.aggregate,
        },
        scoreSeries: {
          curiosity: payload.scores.curiosity,
          social: payload.scores.social,
          threat: payload.scores.threat,
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
