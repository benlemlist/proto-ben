// The prototype's AI stack. Every AI feature goes through here, so a new one
// runs on the real model the moment it calls these:
// - aiText: a streamed answer (text deltas, reasoning deltas);
// - aiObject: structured output, a tool call validated by its schema;
// - aiAgent: the multi-turn tool loop (lib/agent.ts runAgentTurn);
// - aiPool: many calls, a few in flight (AI columns, bulk);
// - isAiFallback: true for the errors after which a caller shows its mock.
// All of it goes to /api/agent (DeepSeek, the key on the server side:
// OPENROUTER_API_KEY or DEEPSEEK_API_KEY in .env.local) and honours the Live
// AI switch (live.ts): off or no key → NoKeyError → the caller's mock.

import { NoKeyError, streamMessage, type AnthropicMessage, type Thinking } from "../agent";

export { NoKeyError, PAUSE, runAgentTurn as aiAgent, type AnthropicMessage, type AgentHooks } from "../agent";
export { AI_MODEL_LABEL, liveAiOn, setLiveAi, useLiveAi, useLiveAiSetting, useLiveAiUnavailable } from "./live";

/** lemlist, for any prompt that needs to know what the product is. */
export const LEMLIST_CONTEXT =
  "lemlist is a multichannel sales engagement platform: sequences on email, LinkedIn, calls, WhatsApp and SMS, a People Database of 450M+ contacts, waterfall enrichment, buying signals (job changes, funding, hiring, website visits), CRM sync (HubSpot, Salesforce, Pipedrive), deliverability tools (lemwarm), and lemAgent, its AI agent.";

/** House style for anything the AI writes in the product's UI. */
export const AI_STYLE = "Write in plain, direct English. Short sentences. No hype, no emojis, no em dashes. Never invent figures you were not given.";

export interface AiCallOptions {
  system?: string;
  /** A single user prompt, or a whole conversation. */
  prompt?: string;
  messages?: AnthropicMessage[];
  maxTokens?: number;
  signal?: AbortSignal;
  onText?: (delta: string) => void;
  onThinking?: (delta: string) => void;
  /**
   * true: reason first, streamed through onThinking (for what the user watches).
   * false or unset: no reasoning (faster, cheaper, the whole budget for the answer).
   */
  think?: boolean;
}

const thinkingOf = (think?: boolean): Thinking => ({ type: think ? "enabled" : "disabled" });

const messagesOf = (o: AiCallOptions): AnthropicMessage[] => o.messages ?? [{ role: "user", content: o.prompt ?? "" }];

/** A streamed text answer. Resolves with the whole text. */
export async function aiText(o: AiCallOptions): Promise<string> {
  const res = await streamMessage(
    // The reasoning counts in max_tokens: leave it room.
    { system: o.system, messages: messagesOf(o), max_tokens: o.maxTokens ?? (o.think ? 4000 : 1500), thinking: thinkingOf(o.think) },
    { onText: o.onText, onThinking: o.onThinking, signal: o.signal },
  );
  return res.text.trim();
}

/**
 * Structured output: the model must call `name` with input matching `schema`
 * (a JSON schema object). Resolves with that input.
 */
export async function aiObject<T>(o: AiCallOptions & { name: string; description: string; schema: Record<string, unknown> }): Promise<T> {
  // DeepSeek's own API refuses a forced tool_choice in thinking mode: with
  // `think`, the prompt asks for the call, and a turn without it runs again, forced.
  const call = (think: boolean) =>
    streamMessage(
      {
        system: think ? [o.system, `Answer by calling the ${o.name} tool.`].filter(Boolean).join("\n\n") : o.system,
        messages: messagesOf(o),
        tools: [{ name: o.name, description: o.description, input_schema: o.schema }],
        tool_choice: think ? { type: "auto" } : { type: "tool", name: o.name },
        max_tokens: o.maxTokens ?? (think ? 5000 : 2500),
        thinking: thinkingOf(think),
      },
      { onThinking: o.onThinking, onText: o.onText, signal: o.signal },
    );
  const find = (res: Awaited<ReturnType<typeof call>>) => res.toolUses.find((u) => u.name === o.name);
  let use = find(await call(Boolean(o.think)));
  if (!use && o.think) use = find(await call(false));
  if (!use) throw new Error(`ai: the model didn't call ${o.name}`);
  return use.input as T;
}

/** The errors after which a caller falls back to its mock (Live AI off, no key, an abort). */
export const isAiFallback = (err: unknown) => err instanceof NoKeyError || (err as { name?: string })?.name === "AbortError";

/** Runs several AI calls with at most `limit` in flight (AI columns, bulk generation). */
export async function aiPool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
