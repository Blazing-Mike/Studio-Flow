/**
 * Shared OpenAI-compatible chat-completions client.
 *
 * Used by both the project-plan generator (ai-generate.ts) and the job
 * proposal writer (job-proposal.ts). Works against Gemini (default), DeepSeek,
 * or OpenAI by changing environment variables. Returns null when no API key is
 * configured or the request fails, so callers can fall back gracefully.
 *
 * Env vars:
 *   GEMINI_API_KEY   — Google AI Studio API key (or any OpenAI-compatible key)
 *   GEMINI_BASE_URL  — default https://generativelanguage.googleapis.com/v1beta/openai/
 *   GEMINI_MODEL     — default gemini-3.1-flash-lite
 */

const API_KEY = () => (process.env["GEMINI_API_KEY"] ?? "").trim();
const BASE_URL = () =>
  (
    process.env["GEMINI_BASE_URL"] ??
    "https://generativelanguage.googleapis.com/v1beta/openai/"
  ).replace(/\/+$/, "");
const MODEL = () => process.env["GEMINI_MODEL"] ?? "gemini-3.1-flash-lite";

export function llmConfigured(): boolean {
  return Boolean(API_KEY());
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  temperature?: number;
  /** Request a strict JSON object response (model-dependent; not required to parse). */
  json?: boolean;
  maxTokens?: number;
};

/**
 * Send a chat-completions request and return the assistant text content,
 * or null when AI is not configured / the request fails.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string | null> {
  if (!llmConfigured()) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    let response: Response;
    try {
      response = await fetch(`${BASE_URL()}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY()}`,
        },
        body: JSON.stringify({
          model: MODEL(),
          temperature: options.temperature ?? 0.7,
          ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
          ...(options.json ? { response_format: { type: "json_object" } } : {}),
          messages,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `[llm] ${response.status} ${response.statusText}: ${detail.slice(0, 300)}`,
      );
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error(
      "[llm] request failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
