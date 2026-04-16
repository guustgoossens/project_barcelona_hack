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
    // Delete storage files referenced by variants first
    for (const variant of await ctx.db.query("variants").collect()) {
      if (variant.activationStorageId)
        await ctx.storage.delete(variant.activationStorageId);
      await ctx.db.delete(variant._id);
    }
    for (const lead of await ctx.db.query("leads").collect())
      await ctx.db.delete(lead._id);
    for (const campaign of await ctx.db.query("campaigns").collect())
      await ctx.db.delete(campaign._id);
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

    // Real GPU-computed scores from TRIBE v2 (persisted for instant demo startup)
    const v2Scores = {
      attention: -0.06715946936359009, curiosity: -0.18446058691479267,
      trust: -0.2897699903541555, motivation: -0.2231407934178909,
      resistance: 0.5273130156487847, overall: -1.2918438556992138,
    };
    const v2_1Scores = {
      attention: -0.06359056061754625, curiosity: -0.21466680926581222,
      trust: -0.23450260370969772, motivation: -0.31094977623472614,
      resistance: 0.32122842003901797, overall: -1.1449381698668004,
    };
    const v2_2Scores = {
      attention: -0.03583796279361616, curiosity: -0.2445818515637746,
      trust: -0.27006130358204244, motivation: -0.2940606236457825,
      resistance: 0.5184704686013553, overall: -1.363012210186571,
    };
    const v3Scores = {
      attention: -0.02490622649590174, curiosity: -0.17772886694098514,
      trust: -0.24127262813660005, motivation: -0.2762402250431478,
      resistance: 0.5111232074598471, overall: -1.2312711540764818,
    };

    // Create root variant (v1) — archived, never scored
    const v1Id = await ctx.db.insert("variants", {
      sessionId,
      message:
        "Dear candidate,\n\nI came across your portfolio and wanted to reach out about an exciting opportunity. We are a growing creative studio in Barcelona looking for talented branding designers to join our team. I believe your experience would be a great asset.\n\nWould you be available for a brief call?\n\nBest regards",
      status: "pending",
    });

    // Create child variant (v2) — references real work
    const v2Id = await ctx.db.insert("variants", {
      sessionId,
      parentId: v1Id,
      message:
        "Hey — I saw your motion work for Discovery and Fox on Vimeo. The way you bridge concept art and real-time production is rare. We're building a creative studio in Barcelona that operates at that same intersection, and I think you'd find what we're working on genuinely interesting. 20 minutes, no pitch — just curious if it resonates.",
      status: "done",
      scores: v2Scores,
    });

    // Branch A from v2: references specific award (v2.1)
    const v2_1Id = await ctx.db.insert("variants", {
      sessionId,
      parentId: v2Id,
      message:
        "Hey — your PromaxBDA Gold work caught my eye, especially how you balance cinematic storytelling with brand constraints. That tension between artistic vision and commercial impact is exactly what we navigate daily. I run a creative studio here in Barcelona, and we're looking for someone who thinks in systems — not just deliverables. Would you trade 20 minutes for a look at what we're building? I think you'd have opinions.",
      status: "done",
      scores: v2_1Scores,
    });

    // Branch B from v2: empathy-led approach (v2.2)
    const v2_2Id = await ctx.db.insert("variants", {
      sessionId,
      parentId: v2Id,
      message:
        "Hey — I noticed your Discovery work isn't just pretty, it tells stories that hold people. That's the hardest thing in motion design. We're a small creative studio in Barcelona, and honestly we struggle to find people who care about narrative as much as craft. No agenda — just wondering if you'd be open to a 15-minute chat about what storytelling looks like in our world.",
      status: "done",
      scores: v2_2Scores,
      hypothesis: "Empathy-led framing outperforms achievement-led framing",
    });

    // Branch C from v1: curiosity-driven angle (v3)
    const v3Id = await ctx.db.insert("variants", {
      sessionId,
      parentId: v1Id,
      message:
        "Quick question — have you ever worked on a project where the brand's visual identity had to evolve in real-time based on audience data? We're experimenting with that here in Barcelona and I keep running into the same wall: finding designers who think in systems. Your Vimeo reel suggests you might be one of them. Curious if that resonates at all.",
      status: "done",
      scores: v3Scores,
    });

    // Archive v1
    await ctx.db.patch(v1Id, { status: "archived" });

    // Update session rootVariantId
    await ctx.db.patch(sessionId, { rootVariantId: v1Id });

    // Create campaign
    const campaignId = await ctx.db.insert("campaigns", {
      name: "Creative Branding Designer — Barcelona",
      sessionId,
      lessonsMarkdown: LESSONS_MD,
    });

    // Create leads (from Clay CSV export — real OCEAN profiles)
    await ctx.db.insert("leads", {
      campaignId,
      name: "Guillaume Descordes",
      role: "Sr Character Artist & Concept Artist",
      company: "Fortis Games",
      avatarEmoji: "🎨",
      ocean: { o: 0.78, c: 0.75, e: 0.45, a: 0.72, n: 0.25 },
      confidence: 0.52,
      personalityArgs:
        "Senior character artist bridging concept design and real-time 3D production for mobile games. Multidisciplinary background (economics → 3D graphics → fine arts at Sorbonne). High openness: broad aesthetic curiosity spanning animation, illustration, creature sculpting, and concept art. Quiet but community-supportive — all observed posts are silent reshares amplifying peers across seniority levels. Mentors aspiring artists at Artside School with structured curriculum (ZBrush, character stylization, soft skills). 56K followers but entirely passive public communication — influential through accumulation, not vocal leadership. Emotionally stable with calm, steady career progression. Values craft excellence, community support, and knowledge sharing.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Diego Troiano",
      role: "Art Director & Motion Designer",
      company: "Dtmg.tv Studio",
      avatarEmoji: "🎬",
      ocean: { o: 0.78, c: 0.80, e: 0.65, a: 0.75, n: 0.22 },
      confidence: 0.71,
      personalityArgs:
        "Founder of Dtmg.tv Studio. Dual Gold PromaxBDA 2016 awards in Art Direction & Typography. 12+ years in motion graphics for Fox (7 years), Discovery (3.5 years), Disney, Warner Bros. Every post follows deliberate structure: concept → execution → credits → legal notice. Shares rejected pitches openly, showing confidence and low neuroticism. Warm and credit-generous — consistently names collaborators. Concept-first creative process. 19+ years of pro-bono work for cerebral palsy association ADESEC. Bilingual (Spanish/English) with portfolio-led communication style. Values craft excellence, creative identity, collaboration, and professional recognition.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Lluis Gimeno",
      role: "Executive Creative Director & Founder",
      company: "El Kolador",
      avatarEmoji: "🚀",
      ocean: { o: 0.82, c: 0.74, e: 0.68, a: 0.65, n: 0.28 },
      confidence: 0.62,
      personalityArgs:
        "Founder of El Kolador de Ideas Creativas, an AR/VR-focused creative agency. 25+ years spanning graphic design → digital art direction → creative direction → agency founder. Anti-fluff communicator: 'sin relleno y sin fórmulas vacías.' Embraces emerging tech (AI, AR, VR) pragmatically — 'Innovación, sí. Pero con cabeza.' Very high openness across domains (pharma, agriculture, education, arts, fitness clients). Direct and opinionated, rejects hollow marketing speak. Predominantly amplifies others' content with minimal self-promotion. 28K+ connections. Driven by strategic creativity at the intersection of technology and meaningful results.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Massimo Lo Bianco",
      role: "Founder & Artist Manager",
      company: "22MGMT.co",
      avatarEmoji: "🎵",
      ocean: { o: 0.75, c: 0.82, e: 0.78, a: 0.62, n: 0.45 },
      confidence: 0.62,
      personalityArgs:
        "Founder of 22MGMT.co. 15+ years in entertainment (music, fashion, film). Day-to-Day Manager for Adriatique, Event Manager for X. Exceptionally high conscientiousness — exhaustive documentation of events, dates, venues across all roles. Career built on connecting talent with opportunity. Emotionally resilient but situationally reactive to perceived injustice. Mixed agreeableness: warm and collaborative professionally, but sharp and confrontational when provoked. Multi-role operator managing global touring logistics simultaneously. Values talent empowerment, operational excellence, discretion, and creative solution-finding.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Michael Hoffman",
      role: "International Executive Coach & Author",
      company: "ScaleYOU",
      avatarEmoji: "🎯",
      ocean: { o: 0.82, c: 0.78, e: 0.72, a: 0.76, n: 0.25 },
      confidence: 0.71,
      personalityArgs:
        "Renowned executive coach and CEO of LeanMail (since 2007). Career spans classical music conducting → Lean consulting → AI book co-authorship → executive coaching. Clifton Strengths: Learner, Achiever, Restorative, Intellection, Individualization, Responsibility. Co-authored book with AI on coaching. Warm yet analytical communicator — contextualizes professional lessons through personal stories. Runs immersive leadership retreats (El Camino walking). Mentors African startups through Bridge for Billions. Values integrity, continuous learning, human development, and work-life balance. Moderate extraversion with preference for intimate small-group depth over mass engagement.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Didac Esteve",
      role: "Co-CEO & Art Director",
      company: "Esteve Arquitectes",
      avatarEmoji: "🏗️",
      ocean: { o: 0.82, c: 0.70, e: 0.80, a: 0.62, n: 0.32 },
      confidence: 0.72,
      personalityArgs:
        "Co-CEO of Esteve Arquitectes (50-year family firm, 2nd generation). Founder of Esteve Real Estate and Real Token APP (blockchain real estate). Award-winning graphic designer turned architect/real estate entrepreneur. LinkedIn Creator since 2022 with 22K+ connections. Provocateur and community builder — frames uncomfortable truths, invites replies. Direct and emotionally engaged communicator alternating between indignation and analytical gravity. Long-term volunteer for human rights and environmental causes. Values family, human-centered service, entrepreneurial impact, and craft quality. High openness: graphic design → architecture → blockchain → drones.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Nilton Navarro Flores",
      role: "Brand Manager & Influencer Marketing",
      company: "InfoJobs",
      avatarEmoji: "⚡",
      ocean: { o: 0.85, c: 0.72, e: 0.92, a: 0.82, n: 0.15 },
      confidence: 0.76,
      personalityArgs:
        "Brand Manager at InfoJobs since 2015, creator of 'Cool Jobs' campaign. International keynote speaker and co-organizer of the world's largest Personal Branding congress. Extremely high extraversion (10K connections, 22K followers). Built career from Mexican TV to Spanish digital marketing through sheer perseverance. Partners with top Spanish influencers (TheGrefg, Ibai Llanos, Kings League). Very low neuroticism — entire brand built on positivity, resilience, and forward momentum. Frames challenges as adventures. Values innovation, happiness at work, perseverance, and human connection.",
    });

    await ctx.db.insert("leads", {
      campaignId,
      name: "Kike Doatis",
      role: "Independent Creative Director",
      company: "Kike Doatis",
      avatarEmoji: "💡",
      ocean: { o: 0.88, c: 0.60, e: 0.72, a: 0.78, n: 0.28 },
      confidence: 0.71,
      personalityArgs:
        "Independent Creative Director with 20+ brand clients (Danone, FC Barcelona, Casa Batlló, Vogue). Professor of Creativity at 8+ institutions including film academies and universities. Exceptionally high openness — uses mythology, poetry, and philosophy in commercial work. Champions LGBTQ+ inclusion and diversity through campaigns for AXEL HOTELS. Turns creative constraints into differentiators. Poetic, emotionally resonant communicator with lyrical, narrative-first style. Collaborative and credit-generous. Values creative liberty, human-centered storytelling, social inclusion, and educational mentorship.",
    });

    // Schedule GPU scoring to get real brain activations
    for (const variantId of [v2Id, v2_1Id, v2_2Id, v3Id]) {
      await ctx.scheduler.runAfter(0, api.actions.scoreVariant, { variantId });
    }

    return { campaignId, sessionId };
  },
});
