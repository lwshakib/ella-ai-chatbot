import { WEB_SEARCH_SYSTEM_PROMPT } from "@/constants/prompt";
import { api } from "@/convex/_generated/api";
import { GoogleGenAI } from "@google/genai";
import { tavily } from "@tavily/core";
import { ConvexHttpClient } from "convex/browser";
import { inngest } from "./client";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
});
const webClient = tavily({ apiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY! });

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);


export const generateAIResponse = inngest.createFunction(
  { id: "generate-ai-response" },
  { event: "chat/generate-ai-response" },
  async ({ event, step }) => {
    const {message, conversationId, clerkId} = event.data;

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    const saveUserMessageToDB = await step.run(
      "save-user-message-to-db",
      async () => {
        await convex.mutation(api.functions.createMessage, {
          conversationId,
          text: message,
          type: "text",
          sender: "user",
          status: "completed",
          clerkId,
        });
      }
    );



    const identifyTool = await step.run(
      "identify-tools",
      async () => {
        const webTool = message.startsWith("/web");
        const imageTool = message.startsWith("/image");
        
        if (webTool) {
          return "web"
        }
        if (imageTool) {
          return "image"
        }
        return "text"
      }
    );

    const createEllaMessageToDB = await step.run(
      "create-ella-message-to-db",
      async () => {
        const messageId = await convex.mutation(api.functions.createMessage, {
          conversationId,
          text: "", // Add empty text or appropriate message
          type: identifyTool,
          sender: "ella",
          status: "pending",
          clerkId,
        });
        return messageId;
      }
    );



    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const messages = await convex.mutation(api.functions.getPreviousMessages, {
          conversationId,
          clerkId,
        });
        return messages;
      }
    );

    const generateAIResponse = await step.run(
      "generate-ai-response",
      async () => {
        const tool = identifyTool;
        if (tool === "web") {
          const webResponse = await webClient.search(message, {
            includeAnswer: true,
            includeImages: true,
            includeImageDescriptions: true,
            includeFavicon: true,
            includeRawContent: "text"
          });
          const results = webResponse.results;
          const images = webResponse.images;
          const urls = results.map((result) => result.url);
          const answer = webResponse.answer;

          const WebResultsDetails = await webClient.extract(urls, {
            extractDepth: 'advanced',
            format: 'markdown'
          });

 
          const contents = WebResultsDetails.results.map((result) => result.rawContent);

          const prompt = WEB_SEARCH_SYSTEM_PROMPT.replace("{{SEARCH_DETAILS}}", JSON.stringify(contents)).replace("{{SIMPLE_ANSWER}}", answer?.toString() || "").replace("{{PREVIOUS_MESSAGES}}", JSON.stringify(previousMessages));

          
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
              systemInstruction: prompt
            }
          });



              await convex.mutation(api.functions.updateMessage, {
                messageId: createEllaMessageToDB,
                text: response.text as string,
                type: "web",
                resources: urls,
                images: images.length > 0 ? images.map((image) => ({
                  url: image.url,
                  description: image.description || "",
                })) : [],
                status: "completed",
              });


          return response.text;
        }
        if (tool === "image") {
          return "image"
        }
        return "normal"
      }
    );

    

    return generateAIResponse;
  },


);