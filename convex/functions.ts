import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreateUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }
    // Find existing user
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject as string))
      .first(); // Instead of collect() + length check

    if (existingUser) {
      return existingUser; // Return if found
    }

    // Create new user if not found
    return ctx.db.insert("users", {
      clerkId: identity.subject as string,
      name: identity.name as string,
      imageUrl: identity.pictureUrl as string,
      email: identity.email as string,
    });
  },
});

export const createConversation = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }

    return await ctx.db.insert("conversations", {
      clerkId: identity.subject as string,
      title: "Untitled Conversation",
    });
  },
});


export const getConversations = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("No identity found");
        }
        return ctx.db.query("conversations").filter((q) => q.eq(q.field("clerkId"), identity.subject as string)).collect();
    },
});


export const createMessage = mutation({
  args: {
    clerkId: v.string(),
    conversationId: v.id("conversations"),
    text: v.string(),
    type: v.string(),
    sender: v.string(),
    imageUrl: v.optional(v.string()),
    resources: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.object({
        url: v.string(),
        description: v.optional(v.string()),
    }))),
    status: v.string(),
  },  
    handler: async (ctx, args) => {
        return ctx.db.insert("messages", {
            clerkId: args.clerkId,
            conversationId: args.conversationId,
            text: args.text,
            type: args.type,
            sender: args.sender,
            imageUrl: args.imageUrl,
            resources: args.resources,
            images: args.images,
            status: args.status,
        });
    },
});


export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.optional(v.string()),
    text: v.optional(v.string()),
    type: v.optional(v.string()),
    resources: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.object({
        url: v.string(),
        description: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    return ctx.db.patch(args.messageId, {
      status: args.status,
      text: args.text,
      type: args.type,
      resources: args.resources,
      images: args.images,
    });
  },
});


export const getPreviousMessages = mutation({
  args: {
    conversationId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("messages")
      .filter((q) =>
        q.eq(q.field("conversationId"), args.conversationId)
      ).take(5);
  }
});
