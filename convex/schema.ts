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
    }).index("byClerkId", ["clerkId"]),
    messages: defineTable({
        clerkId: v.string(),
        conversationId: v.id("conversations"),
        text: v.string(),
        type: v.string(),
        sender: v.string(),
        imageUrl: v.optional(v.string()),
        resources: v.optional(v.array(v.string())),
    }).index("byConversationId", ["conversationId"]),
})