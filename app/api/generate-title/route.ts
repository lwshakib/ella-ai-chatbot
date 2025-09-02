import { GoogleGenAI } from "@google/genai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await currentUser();
    const { has } = await auth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
    });
    
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    // Generate title using Gemini
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a title generator. Your task is to create a short, meaningful, and attention-grabbing title of 3–4 words based on the overall context and key topics of the conversation.

Guidelines:
- The title must reflect the main theme or purpose of the conversation
- Keep it concise, relevant, and professional
- Avoid unnecessary words, punctuation, or filler terms
- Use title case (capitalize major words)
- The title should feel like a headline, not a full sentence
- No fluff, just the title we need

Conversation messages:
${JSON.stringify(messages, null, 2)}

Generate only the title, nothing else:`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 50,
      },
    });

    const title = result.text?.trim();

    if (!title) {
      return NextResponse.json(
        { error: "Failed to generate title" },
        { status: 500 }
      );
    }

    return NextResponse.json({ title });

  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
