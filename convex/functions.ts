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
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getConversations = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }
    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject as string))
      .collect();

    // Sort by updatedAt in descending order (most recent first)
    return conversations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },
});

export const getConversation = query({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .collect();
    if (!conversation[0]) {
      return null;
    }

    // Ensure the user owns the conversation
    if (conversation[0].clerkId !== identity.subject) {
      return null;
    }

    return conversation[0];
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
    resources: v.optional(v.array(v.any())),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          description: v.optional(v.string()),
        })
      )
    ),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Update the conversation's updatedAt timestamp
    await ctx.db.patch(args.conversationId, {
      updatedAt: new Date().toISOString(),
    });

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
    resources: v.optional(v.array(v.any())),
    imageUrl: v.optional(v.string()),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          description: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (message?.conversationId) {
      await ctx.db.patch(message.conversationId, {
        updatedAt: new Date().toISOString(),
      });
    }

    return ctx.db.patch(args.messageId, {
      status: args.status,
      text: args.text,
      type: args.type,
      resources: args.resources,
      images: args.images,
      imageUrl: args.imageUrl,
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
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .take(5);
  },
});

export const getMessages = query({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .collect();
    return messages;
  },
});

export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }

    // Find the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Ensure the user owns the conversation
    if (conversation.clerkId !== identity.subject) {
      throw new Error("Unauthorized to delete this conversation");
    }

    // Delete related messages first (if necessary)
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // Delete the conversation
    await ctx.db.delete(args.conversationId);

    return { success: true, message: "Conversation deleted successfully" };
  },
});

export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }

    // Find the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Ensure the user owns the conversation
    if (conversation.clerkId !== identity.subject) {
      throw new Error("Unauthorized to update this conversation");
    }

    // Update the conversation title
    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, message: "Title updated successfully" };
  },
});


export const getGeneratedImages = query({
  handler: async(ctx)=>{
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) return [];

    const images = await ctx.db.query("messages").filter(q=> q.eq(q.field("clerkId"), identity.subject)).filter(q=> q.eq(q.field("type"), "image")).collect();
    return images;
  }
})

export const searchConversation = mutation({
  args: {
    searchTerm: v.string(), // the text to search for
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }

    // Fetch conversations for the current user
    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .collect();

    // Filter conversations based on the search term (case-insensitive)
    const term = args.searchTerm.toLowerCase();

    const filteredConversations = conversations.filter((conv) =>
      conv.title?.toLowerCase().includes(term)
    );

    // (Optional) You can also search inside messages
    // Get all messages of this user
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .collect();

    // Find conversation IDs that have messages matching the search term
    const matchingConversationIds = new Set(
      messages
        .filter((msg) => msg.text?.toLowerCase().includes(term))
        .map((msg) => msg.conversationId)
    );

    // Merge conversations found by title + messages
    const finalResults = filteredConversations.concat(
      conversations.filter((conv) => matchingConversationIds.has(conv._id))
    );

    // Remove duplicates
    const uniqueResults = Array.from(
      new Map(finalResults.map((conv) => [conv._id, conv])).values()
    );

    return uniqueResults.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },
});
