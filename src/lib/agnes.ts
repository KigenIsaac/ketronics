import { z } from "zod";

export const AGNES_BASE_URL = "https://apihub.agnes-ai.com/v1";
export const DEFAULT_AGNES_MODEL = "agnes-2.5-flash";

const responseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.union([z.string(), z.array(z.unknown())]).nullable().optional(),
      tool_calls: z.array(z.object({
        id: z.string(),
        type: z.literal("function"),
        function: z.object({ name: z.string(), arguments: z.string() }),
      })).optional(),
    }),
  })).min(1),
});

export type AgnesMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<Record<string, unknown>>;
  tool_call_id?: string;
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
};

export async function callAgnes(messages: AgnesMessage[], options?: {
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
  tools?: Array<Record<string, unknown>>;
}) {
  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) throw new Error("AGNES_NOT_CONFIGURED");

  const model = process.env.AGNES_MODEL || DEFAULT_AGNES_MODEL;
  const requestBody = JSON.stringify({
    model,
    messages,
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 700,
    stream: false,
    ...(options?.tools?.length ? { tools: options.tools, tool_choice: "auto" } : {}),
  });
  const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);
  let response: Response | undefined;

  // Retry only transient provider/network failures, with bounded exponential backoff.
  // Three total attempts prevent a temporary outage from immediately breaking the chat.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: requestBody,
        signal: options?.signal ?? AbortSignal.timeout(25_000),
        cache: "no-store",
      });
    } catch (error) {
      if (attempt === 2) throw new Error("AGNES_NETWORK_ERROR");
      await new Promise((resolve) => setTimeout(resolve, 300 * (2 ** attempt)));
      continue;
    }

    if (!retryableStatuses.has(response.status) || attempt === 2) break;
    const retryAfter = Number(response.headers.get("retry-after") ?? 0);
    const delayMs = Math.min(2_000, Math.max(300 * (2 ** attempt), retryAfter > 0 ? retryAfter * 1_000 : 0));
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  if (!response) throw new Error("AGNES_NETWORK_ERROR");
  if (response.status === 429) throw new Error("AGNES_RATE_LIMITED");
  if (!response.ok) {
    const error = new Error(`AGNES_UPSTREAM_${response.status}`);
    throw error;
  }

  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("AGNES_INVALID_RESPONSE");
  const message = parsed.data.choices[0]?.message;
  const content = message?.content;
  const rawAnswer = typeof content === "string" ? content.trim() : "";
  // Some model/provider responses accidentally expose internal <think> blocks.
  // Remove the full block (not merely its tags) before any content reaches customers.
  const answer = rawAnswer
    .replace(/<think\\b[^>]*>[\\s\\S]*?<\\/think\\s*>/gi, "")
    .replace(/<think\\b[^>]*>[\\s\\S]*$/gi, "")
    .replace(/<\\/?think\\b[^>]*>/gi, "")
    .trim();
  const toolCalls = message?.tool_calls ?? [];
  if (!answer && toolCalls.length === 0) throw new Error("AGNES_EMPTY_RESPONSE");
  return { answer: answer.slice(0, 8000), toolCalls, model };
}