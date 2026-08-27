import type { z } from "zod";
import { ai, assertConfigured } from "./client";

function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : raw).trim();
  const start = body.search(/[[{]/);
  if (start === -1) return body;
  // Walk to the matching closing bracket so trailing prose is ignored.
  const open = body[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return body.slice(start, i + 1);
    }
  }
  return body.slice(start);
}

/**
 * One structured-generation call. Asks the model for JSON, parses tolerantly,
 * validates against a Zod schema, and retries once with the validation error
 * fed back in.
 */
export async function generateJSON<T extends z.ZodTypeAny>(opts: {
  model: string;
  system: string;
  prompt: string;
  schema: T;
  temperature?: number;
  maxRetries?: number;
}): Promise<z.infer<T>> {
  assertConfigured();
  const { model, system, prompt, schema, temperature = 0.7, maxRetries = 1 } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const messages: { role: "system" | "user"; content: string }[] = [
      { role: "system", content: system },
      {
        role: "user",
        content:
          prompt +
          (attempt > 0
            ? `\n\nYour previous response failed validation:\n${String(lastErr)}\nReturn ONLY a single valid JSON value that matches the requested shape. No prose, no markdown fences.`
            : ""),
      },
    ];

    const res = await ai.chat.completions.create({
      model,
      messages,
      temperature,
      response_format: { type: "json_object" },
    });

    const raw = res.choices[0]?.message?.content ?? "";
    try {
      return schema.parse(JSON.parse(extractJSON(raw)));
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(`Structured generation failed after ${maxRetries + 1} attempts: ${String(lastErr)}`);
}
