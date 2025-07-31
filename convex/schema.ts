import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  }).index("byClerkId", ["clerkId"]),
  conversations: defineTable({
    clerkId: v.string(),
    title: v.string(),
    updatedAt: v.string(),
  })
    .index("byClerkId", ["clerkId"])
    .index("byUpdatedAt", ["updatedAt"]),
  messages: defineTable({
    clerkId: v.string(),
    conversationId: v.id("conversations"),
    text: v.optional(v.string()),
    type: v.string(),
    sender: v.string(),
    imageUrl: v.optional(v.string()),
    resources: v.optional(v.array(v.object({
      url: v.string(),
      favicon: v.string()
    }))),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          description: v.optional(v.string()),
        })
      )
    ),
    status: v.string(),
  }).index("byConversationId", ["conversationId"]),
});
