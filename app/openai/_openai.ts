import OpenAI from "openai";

export default function getOpenAIClient() {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });
  return openaiClient;
}
