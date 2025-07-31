import { WEB_SEARCH_SYSTEM_PROMPT } from "@/constants/prompt";
import { api } from "@/convex/_generated/api";
import { GoogleGenAI } from "@google/genai";
import { tavily } from "@tavily/core";
import { ConvexHttpClient } from "convex/browser";
import OpenAI from "openai";
import { EllaSimpleAgent, imagePropertiesIdentifierAgent } from "./agent";
import { inngest } from "./client";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
});

const imageClient = new OpenAI({
  baseURL: "https://api.studio.nebius.com/v1/",
  apiKey: process.env.NEXT_PUBLIC_NEBIUS_API_KEY,
});

const webClient = tavily({ apiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY! });

export const generateAIResponse = inngest.createFunction(
  { id: "generate-ai-response" },
  { event: "chat/generate-ai-response" },
  async ({ event, step }) => {
    const { message, conversationId, clerkId, tool, AIMessageId } =
      event.data;

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const messages = await convex.mutation(
          api.functions.getPreviousMessages,
          {
            conversationId,
            clerkId,
          }
        );
        return messages;
      }
    );

    if (tool === "web") {
      const webSearchResult = await step.run(
        "generate-web-response",
        async () => {
          const webResponse = await webClient.search(message, {
            includeAnswer: true,
            includeImages: true,
            includeImageDescriptions: true,
            includeFavicon: true,
            includeRawContent: "text",
          });
          const results = webResponse.results;
          const images = webResponse.images;
          const resources = results.map((result: any) => ({
            url: result.url,
            favicon: result?.favicon as string,
          }));
          const answer = webResponse.answer;

          const contents = webResponse.results.map(
            (result) => result.rawContent
          );

          return { results, images, resources, answer, contents };
        }
      );

      const getModifiedPrompt = await step.run(
        "get-modified-prompt",
        async () => {
          const prompt = WEB_SEARCH_SYSTEM_PROMPT.replace(
            "{{SEARCH_DETAILS}}",
            JSON.stringify(webSearchResult.contents)
          )
            .replace(
              "{{SIMPLE_ANSWER}}",
              webSearchResult.answer?.toString() || ""
            )
            .replace("{{PREVIOUS_MESSAGES}}", JSON.stringify(previousMessages));

          return prompt;
        }
      );

      const modifyTheWebResponse = await step.run(
        "modify-web-response",
        async () => {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
              systemInstruction: getModifiedPrompt,
            },
          });
          return response.text;
        }
      );

      const saveTheWebResponseToDB = await step.run("save-to-db", async () => {
        await convex.mutation(api.functions.updateMessage, {
          messageId: AIMessageId,
          text: modifyTheWebResponse as string,
          type: "web",
          resources: webSearchResult.resources,
          images:
            webSearchResult.images.length > 0
              ? webSearchResult.images.map((image) => ({
                  url: image.url,
                  description: image.description || "",
                }))
              : [],
          status: "completed",
        });
      });
    } else if (tool === "image") {
      const propertiesWholeResponse =
        await imagePropertiesIdentifierAgent.run(message);

      const properties = await step.run("clean-the-response", async () => {
        const propertiesUncleaned = (propertiesWholeResponse.output[0] as any)
          .content;
        const propertiesCleaned = propertiesUncleaned
          .replace(/```json\s*/g, "") // Remove starting ```json
          .replace(/```/g, "") // Remove ending ```
          .trim();

        const JsonProperties = JSON.parse(propertiesCleaned);
        return JsonProperties;
      });

      if (properties.statusCode === 404) {
      } else {
        const generateImageUrl = await step.run(
          "generate-image-url",
          async () => {
            const imageResponse = await imageClient.images.generate({
              model: "black-forest-labs/flux-schnell",
              response_format: "url",
              // @ts-ignore
              response_extension: properties.response_extension,
              width: properties.width,
              height: properties.height,
              num_inference_steps: 4,
              negative_prompt: properties.negative_prompt,
              seed: -1,
              loras: null,
              prompt: properties.prompt,
            });
            const generatedImageUrl = (imageResponse as any).data[0].url;
            return generatedImageUrl;
          }
        );

        const saveImageUrlToDB = await step.run(
          "save-image-to-db",
          async () => {
            await convex.mutation(api.functions.updateMessage, {
              messageId: AIMessageId,
              text: "",
              type: "image",
              status: "completed",
              imageUrl: generateImageUrl,
            });
          }
        );
      }
    } else {
      const AIResponse = await EllaSimpleAgent.run(message);
      const response = (AIResponse.output[0] as any).content;

      const saveEllaAIResponseToDB = await step.run(
        "save-ella-ai-response-to-db",
        async () => {
          await convex.mutation(api.functions.updateMessage, {
            messageId: AIMessageId,
            text: response,
            type: "text",
            status: "completed",
          });
        }
      );
    }
  }
);
