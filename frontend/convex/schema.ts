import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    title: v.string(),
    candidateName: v.optional(v.string()),
    rootVariantId: v.optional(v.id("variants")),
  }),

  variants: defineTable({
    sessionId: v.id("sessions"),
    parentId: v.optional(v.id("variants")),
    message: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("scoring"),
      v.literal("done"),
      v.literal("failed"),
      v.literal("archived"),
    ),
    activationStorageId: v.optional(v.id("_storage")),
    shape: v.optional(v.array(v.number())),
    fps: v.optional(v.number()),
    hemodynamicOffsetS: v.optional(v.number()),
    scores: v.optional(
      v.object({
        attention: v.number(),
        curiosity: v.number(),
        trust: v.number(),
        motivation: v.number(),
        resistance: v.number(),
        overall: v.number(),
      }),
    ),
    scoreSeries: v.optional(
      v.object({
        attention: v.array(v.number()),
        curiosity: v.array(v.number()),
        trust: v.array(v.number()),
        motivation: v.array(v.number()),
        resistance: v.array(v.number()),
      }),
    ),
    error: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_parent", ["parentId"]),
});
