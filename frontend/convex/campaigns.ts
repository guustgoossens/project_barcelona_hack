import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const LESSONS_MD = `# Campaign Lessons

## Specificity beats flattery
v1 used generic praise ("great asset"). v2 referenced actual Vimeo work.
Trust: **+90%**. Resistance: **-107%**.

## Reference their actual awards
Mentioning the PromaxBDA Gold in v2.1 triggered curiosity peaks.
The brain's information-gap regions (anterior cingulate) activate
when you name something specific they achieved.

## Same email, different creative brain
Lluis's high-Neuroticism profile shows 3x resistance on the same
email that scores well for Diego. Process-driven creatives need
structure signals, not just creative enthusiasm.

## Extraversion amplifies motivation
Nilton's extremely high Extraversion (0.95) makes the motivation
score spike on collaborative language. "What we're building"
outperforms "what I'm building" by 40% for high-E profiles.
`;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").collect();
  },
});

export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listLeads = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

export const getLead = query({
  args: { id: v.id("leads") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const updateLessons = mutation({
  args: { id: v.id("campaigns"), lessonsMarkdown: v.string() },
  handler: async (ctx, { id, lessonsMarkdown }) => {
    await ctx.db.patch(id, { lessonsMarkdown });
  },
});

export const resetDemo = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all leads, campaigns, variants, sessions
    for (const lead of await ctx.db.query("leads").collect())
      await ctx.db.delete(lead._id);
    for (const campaign of await ctx.db.query("campaigns").collect())
      await ctx.db.delete(campaign._id);
    for (const variant of await ctx.db.query("variants").collect())
      await ctx.db.delete(variant._id);
    for (const session of await ctx.db.query("sessions").collect())
      await ctx.db.delete(session._id);
  },
});

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if campaign already exists
    const existing = await ctx.db.query("campaigns").collect();
    if (existing.some((c) => c.name === "Creative Branding Designer — Barcelona")) {
      return;
    }

    // Create session
    const sessionId = await ctx.db.insert("sessions", {
      title: "Creative Branding Designer — Barcelona",
    });

    // Create root variant (v1)
    const v1Id = await ctx.db.insert("variants", {
      sessionId,
      message:
        "Dear candidate,\n\nI came across your portfolio and wanted to reach out about an exciting opportunity. We are a growing creative studio in Barcelona looking for talented branding designers to join our team. I believe your experience would be a great asset.\n\nWould you be available for a brief call?\n\nBest regards",
      status: "pending",
    });

    // Create child variant (v2)
    const v2Id = await ctx.db.insert("variants", {
      sessionId,
      parentId: v1Id,
      message:
        "Hey — I saw your motion work for Discovery and Fox on Vimeo. The way you bridge concept art and real-time production is rare. We're building a creative studio in Barcelona that operates at that same intersection, and I think you'd find what we're working on genuinely interesting. 20 minutes, no pitch — just curious if it resonates.",
      status: "pending",
    });

    // Create child variant (v2.1)
    const v2_1Id = await ctx.db.insert("variants", {
      sessionId,
      parentId: v2Id,
      message:
        "Hey — your PromaxBDA Gold work caught my eye, especially how you balance cinematic storytelling with brand constraints. That tension between artistic vision and commercial impact is exactly what we navigate daily. I run a creative studio here in Barcelona, and we're looking for someone who thinks in systems — not just deliverables. Would you trade 20 minutes for a look at what we're building? I think you'd have opinions.",
      status: "pending",
    });

    // Archive v1
    await ctx.db.patch(v1Id, { status: "archived" });

    // Schedule scoring for v2 and v2.1
    await ctx.scheduler.runAfter(0, api.actions.scoreVariant, {
      variantId: v2Id,
    });
    await ctx.scheduler.runAfter(0, api.actions.scoreVariant, {
      variantId: v2_1Id,
    });

    // Update session rootVariantId
    await ctx.db.patch(sessionId, { rootVariantId: v1Id });

    // Create campaign
    const campaignId = await ctx.db.insert("campaigns", {
      name: "Creative Branding Designer — Barcelona",
      sessionId,
      lessonsMarkdown: LESSONS_MD,
    });

    // Create leads (from Clay CSV export — real profiles)
    await ctx.db.insert("leads", {
      campaignId,
      name: "Diego Troiano",
      role: "Art Director & Motion Designer",
      company: "Dtmg.tv Studio",
      avatarEmoji: "🎬",
      ocean: { o: 0.91, c: 0.58, e: 0.72, a: 0.68, n: 0.22 },
      confidence: 0.88,
      personalityArgs:
        "Dual Gold PromaxBDA awards. 12 years in motion graphics for Fox, Discovery, Disney. Prolific on Vimeo and Behance. Bilingual creative with strong visual storytelling instinct. Open to bold creative challenges.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Lluis Gimeno",
      role: "Executive Creative Director & Founder",
      company: "El Kolador",
      avatarEmoji: "🚀",
      ocean: { o: 0.82, c: 0.85, e: 0.75, a: 0.50, n: 0.62 },
      confidence: 0.81,
      personalityArgs:
        "Founder of AR/VR-focused creative agency. Integrates AI into creative workflows. Process-driven strategist who values data and measurable results. Guards methodology — evaluates opportunities analytically before committing.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Nilton Navarro",
      role: "Brand Manager & Influencer Marketing",
      company: "InfoJobs",
      avatarEmoji: "⚡",
      ocean: { o: 0.78, c: 0.70, e: 0.95, a: 0.88, n: 0.15 },
      confidence: 0.92,
      personalityArgs:
        "Creator of 'Cool Jobs' campaign. International keynote speaker. Co-organizer of the world's largest Personal Branding congress. Extremely social, 10K+ connections. Driven by passion, positivity, and human connection.",
    });

    return { campaignId, sessionId };
  },
});
