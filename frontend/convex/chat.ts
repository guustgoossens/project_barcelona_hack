import { mutation, internalAction, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import {
  createThread,
  listUIMessages,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { components, internal } from "./_generated/api";
import { optimizer } from "./agent";

// Ensure a campaign has an agent thread, creating one if needed.
export const ensureThread = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.agentThreadId) return campaign.agentThreadId;

    const threadId = await createThread(ctx, components.agent, {
      title: campaign.name,
    });
    await ctx.db.patch(campaignId, { agentThreadId: threadId });
    return threadId;
  },
});

// Send a message and schedule async generation.
export const sendMessage = mutation({
  args: { threadId: v.string(), prompt: v.string() },
  handler: async (ctx, { threadId, prompt }) => {
    const { messageId } = await optimizer.saveMessage(ctx, {
      threadId,
      prompt,
    });
    await ctx.scheduler.runAfter(0, internal.chat.generate, {
      threadId,
      promptMessageId: messageId,
    });
    return { messageId };
  },
});

// Generate response asynchronously (internal action, runs in Node).
export const generate = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  handler: async (ctx, { threadId, promptMessageId }) => {
    const result = await optimizer.streamText(
      ctx,
      { threadId },
      { promptMessageId },
    );
    await result.consumeStream();
  },
});

// List messages for the chat UI (paginated + streaming).
export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const streams = await syncStreams(ctx, components.agent, args);
    const paginated = await listUIMessages(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});
