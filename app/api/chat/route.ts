import { api } from "@/convex/_generated/api";
import { inngest } from "@/inngest/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
export async function POST(req: Request) {
  const user = await currentUser();
  const { has } = await auth();
  const hasProPlan = has({ plan: "pro" });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 401,
    });
  }
  const { message, conversationId, tool, AIMessageId } = await req.json();
  if (!hasProPlan && tool !== "text") {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    if (!hasProPlan) {
      await convex.mutation(api.functions.updateMessage, {
        text: "You haven't pro plan to access the tools. Go to the [billing page](/billing) and purchase a plan to use this feature.",
        messageId: AIMessageId,
        type: "text",
        status: "failed",
      });
      return;
    }
  }
  await inngest.send({
    name: "chat/generate-ai-response",
    data: {
      message,
      conversationId,
      clerkId: user.id,
      tool,
      AIMessageId,
      hasProPlan,
    },
  });
  return new Response(JSON.stringify({ message }));
}
