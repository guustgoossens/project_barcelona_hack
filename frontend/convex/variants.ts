import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export const list = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const rows = await ctx.db
      .query("variants")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
    return rows;
  },
});

export const get = query({
  args: { id: v.id("variants") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return null;
    const url = row.activationStorageId
      ? await ctx.storage.getUrl(row.activationStorageId)
      : null;
    return { ...row, activationsUrl: url };
  },
});

export const createRoot = mutation({
  args: { title: v.string(), message: v.string() },
  handler: async (ctx, { title, message }) => {
    const sessionId = await ctx.db.insert("sessions", { title });
    const variantId = await ctx.db.insert("variants", {
      sessionId,
      message,
      status: "pending",
    });
    await ctx.db.patch(sessionId, { rootVariantId: variantId });
    await ctx.scheduler.runAfter(0, api.actions.scoreVariant, { variantId });
    return { sessionId, variantId };
  },
});

export const createChild = mutation({
  args: { parentId: v.id("variants"), message: v.string() },
  handler: async (ctx, { parentId, message }) => {
    const parent = await ctx.db.get(parentId);
    if (!parent) throw new Error("parent not found");
    const variantId = await ctx.db.insert("variants", {
      sessionId: parent.sessionId,
      parentId,
      message,
      status: "pending",
    });
    await ctx.scheduler.runAfter(0, api.actions.scoreVariant, { variantId });
    return variantId;
  },
});

export const archive = mutation({
  args: { id: v.id("variants") },
  handler: async (ctx, { id }) => {
    const descendants = await collectDescendants(ctx, id);
    for (const vId of [id, ...descendants]) {
      await ctx.db.patch(vId, { status: "archived" });
    }
  },
});

async function collectDescendants(
  ctx: QueryCtx,
  rootId: Id<"variants">,
): Promise<Id<"variants">[]> {
  const out: Id<"variants">[] = [];
  const stack: Id<"variants">[] = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    const children = await ctx.db
      .query("variants")
      .withIndex("by_parent", (q) => q.eq("parentId", cur))
      .collect();
    for (const c of children) {
      out.push(c._id);
      stack.push(c._id);
    }
  }
  return out;
}

export const patchScoring = mutation({
  args: {
    id: v.id("variants"),
    status: v.union(
      v.literal("pending"),
      v.literal("scoring"),
      v.literal("done"),
      v.literal("failed"),
    ),
    activationStorageId: v.optional(v.id("_storage")),
    shape: v.optional(v.array(v.number())),
    fps: v.optional(v.number()),
    hemodynamicOffsetS: v.optional(v.number()),
    scores: v.optional(
      v.object({
        curiosity: v.number(),
        social: v.number(),
        threat: v.number(),
        valence: v.number(),
        aggregate: v.number(),
      }),
    ),
    scoreSeries: v.optional(
      v.object({
        curiosity: v.array(v.number()),
        social: v.array(v.number()),
        threat: v.array(v.number()),
      }),
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});
