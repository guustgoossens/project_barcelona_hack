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
  })
    .index("by_session", ["sessionId"])
    .index("by_parent", ["parentId"]),
});
