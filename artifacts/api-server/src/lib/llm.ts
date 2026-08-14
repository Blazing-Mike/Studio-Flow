/**
 * Shared LLM client built on the Vercel AI SDK (v7).
 *
 * Uses an OpenAI-compatible provider (@ai-sdk/openai-compatible) so the same
 * env-driven setup keeps working: Gemini by default, or DeepSeek / OpenAI by
 * changing GEMINI_BASE_URL + GEMINI_MODEL.
 *
 * Env vars:
 *   GEMINI_API_KEY   — Google AI Studio API key (or any OpenAI-compatible key)
 *   GEMINI_BASE_URL  — default https://generativelanguage.googleapis.com/v1beta/openai/
 *   GEMINI_MODEL     — default gemini-3.1-flash-lite
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

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

let cachedProvider: ReturnType<typeof createOpenAICompatible> | undefined;

/** Lazily build the provider so env changes are picked up. */
function provider(): ReturnType<typeof createOpenAICompatible> {
  if (!cachedProvider) {
    cachedProvider = createOpenAICompatible({
      name: "openai-compatible",
      baseURL: BASE_URL(),
      apiKey: API_KEY(),
    });
  }
  return cachedProvider;
}

/** Build the configured language model from the current env. */
export function llmModel(): LanguageModel {
  return provider()(MODEL());
}
