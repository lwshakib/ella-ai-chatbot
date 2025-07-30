import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getOrCreateUser = mutation({
    args: {
      clerkId: v.string(),
      name: v.string(),
      imageUrl: v.string(),
      email: v.string(),
    },
    handler: async (ctx, args) => {
      // Find existing user
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
        .first(); // Instead of collect() + length check
  
      if (existingUser) {
        return existingUser; // Return if found
      }
  
      // Create new user if not found
      return ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        imageUrl: args.imageUrl,
        email: args.email,
      });
    },
  });
  