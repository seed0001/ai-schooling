import OpenAI from "openai";

/**
 * OpenRouter speaks the OpenAI chat-completions protocol, so we point the
 * official SDK at its base URL. Keep everything provider-agnostic behind this
 * module — the rest of the app never imports `openai` directly.
 */
export const ai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
    "X-Title": "AI Schooling",
  },
});

export const MODELS = {
  outline: process.env.MODEL_OUTLINE ?? "anthropic/claude-3.5-haiku",
  weeks: process.env.MODEL_WEEKS ?? "anthropic/claude-3.5-haiku",
  lessons: process.env.MODEL_LESSONS ?? "anthropic/claude-3.5-sonnet",
} as const;

export function assertConfigured() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Copy .env.example to .env and add your key.",
    );
  }
}
