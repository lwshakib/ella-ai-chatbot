import { inngest } from "@/inngest/client";
import { generateAIResponse } from "@/inngest/functions";
import { serve } from "inngest/next";
import { NextRequest } from "next/server";

const handler = serve({
  client: inngest,
  functions: [generateAIResponse],
});

export async function GET(req: NextRequest, context: any) {
  try {
    return await handler.GET(req, context);
  } catch (error) {
    console.error("Error in inngest GET:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      }),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    return await handler.POST(req, context);
  } catch (error) {
    console.error("Error in inngest POST:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      }),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    return await handler.PUT(req, context);
  } catch (error) {
    console.error("Error in inngest PUT:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      }),
      { status: 500 }
    );
  }
}
