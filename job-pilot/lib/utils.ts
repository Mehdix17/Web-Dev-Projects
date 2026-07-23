import OpenAI from "openai";
import { getOpenRouterKeys } from "./openrouter-health";

export const MATCH_THRESHOLD = 70;

const ROUTER_MODEL = "openrouter/free";

function createClient(key: string) {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: key,
    defaultHeaders: {
      "HTTP-Referer": "https://jobpilot.example.com",
      "X-Title": "JobPilot Assistant",
    },
  });
}

export async function getAiCompletion(
  options: {
    messages: { role: "system" | "user"; content: string }[];
    temperature?: number;
    response_format?: { type: "json_object" };
  }
) {
  const keys = getOpenRouterKeys();
  if (keys.length === 0) {
    throw new Error("No OpenRouter API keys are configured. Please set them in .env.local.");
  }

  let lastError: any = null;

  for (const key of keys) {
    try {
      const client = createClient(key);
      return await client.chat.completions.create({
        model: ROUTER_MODEL,
        messages: options.messages as any,
        temperature: options.temperature,
        response_format: options.response_format,
      }, { signal: AbortSignal.timeout(60_000) });
    } catch (err: any) {
      lastError = err;
    }
  }

  console.warn(`[OpenRouter] All keys rate limited. Last: ${lastError?.message || ""}`);
  throw lastError || new Error("All OpenRouter keys are rate limited. Try again later.");
}
