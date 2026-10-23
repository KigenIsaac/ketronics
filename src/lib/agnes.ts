import { z } from "zod";

export const AGNES_BASE_URL = "https://apihub.agnes-ai.com/v1";
export const DEFAULT_AGNES_MODEL = "agnes-2.5-flash";

const responseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.union([z.string(), z.array(z.unknown())]).optional(),
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
  const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 700,
      stream: false,
      ...(options?.tools?.length ? { tools: options.tools, tool_choice: "auto" } : {}),
    }),
    signal: options?.signal ?? AbortSignal.timeout(25_000),
    cache: "no-store",
  });

  if (response.status === 429) throw new Error("AGNES_RATE_LIMITED");
  if (!response.ok) {
    const error = new Error(`AGNES_UPSTREAM_${response.status}`);
    throw error;
  }

  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("AGNES_INVALID_RESPONSE");
  const message = parsed.data.choices[0]?.message;
  const content = message?.content;
  const answer = typeof content === "string" ? content.trim() : "";
  const toolCalls = message?.tool_calls ?? [];
  if (!answer && toolCalls.length === 0) throw new Error("AGNES_EMPTY_RESPONSE");
  return { answer: answer.slice(0, 8000), toolCalls, model };
}