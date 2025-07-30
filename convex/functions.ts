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

    return ctx.db.insert("conversations", {
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