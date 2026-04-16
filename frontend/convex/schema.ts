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

  campaigns: defineTable({
    name: v.string(),
    sessionId: v.id("sessions"),
    lessonsMarkdown: v.string(),
  }),

  leads: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    role: v.string(),
    company: v.string(),
    avatarEmoji: v.string(),
    ocean: v.object({
      o: v.number(),
      c: v.number(),
      e: v.number(),
      a: v.number(),
      n: v.number(),
    }),
    confidence: v.number(),
    personalityArgs: v.string(),
  }).index("by_campaign", ["campaignId"]),
});
