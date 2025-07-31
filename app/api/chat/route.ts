import { inngest } from "@/inngest/client";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    const user = await currentUser();
    if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
            status: 401,
        });
    }
    const { message, conversationId, tool, AIMessageId } = await req.json();
    await inngest.send({
        name: "chat/generate-ai-response",
        data: {
            message,
            conversationId,
            clerkId: user.id,
            tool,
            AIMessageId
        },
    });
    return new Response(JSON.stringify({ message }));
}