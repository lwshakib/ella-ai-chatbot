
import { GoogleGenAI } from "@google/genai";
import { tavily } from "@tavily/core";

import OpenAI from "openai";



export const nebiusApiKey = process.env.NEBIUS_API_KEY!;
export const googleApiKey= process.env.GOOGLE_API_KEY!;
export const tavilyApiKey = process.env.TAVILY_API_KEY!;


export const ai = new GoogleGenAI({
    apiKey: googleApiKey,
  });
  
  export const imageClient = new OpenAI({
    baseURL: "https://api.studio.nebius.com/v1/",
    apiKey: nebiusApiKey,
  });
  
  export const webClient = tavily({ apiKey: tavilyApiKey });