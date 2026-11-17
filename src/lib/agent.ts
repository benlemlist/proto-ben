// Shared agent transport + tool loop for the prototype's AI surfaces.
// Talks only to /api/agent (dev proxy vite-plugin-agent.ts / Vercel edge
// function api/agent.ts), which adds the key on the server side.
// The wire format is the Anthropic Messages API (OpenRouter and DeepSeek's own
// API both serve it). The Live AI switch (lib/ai/live.ts) off, or no
// key = NoKeyError, so callers use their mock. No SDK: a thin hand-rolled SSE
// reader is lighter for browser streaming through our proxy.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { liveAiOn, markAiUnavailable } from "./ai/live";

export class NoKeyError extends Error {
  constructor() { super("agent: no API key configured"); this.name = "NoKeyError"; }
}

export type Role = "user" | "assistant";
export interface AnthropicMessage { role: Role; content: any }
export interface ToolUse { id: string; name: string; input: any }
export interface TurnResult {
  text: string;
  toolUses: ToolUse[];
  stopReason: string | null;
  /** The assistant turn's blocks in order (thinking, text, tool_use), as the API wants them back in a tool loop. */
  content: any[];
}

export type Thinking = { type: "enabled"; budget_tokens?: number } | { type: "disabled" };

export interface StreamBody {
  system?: any;
  messages: AnthropicMessage[];
  tools?: any[];
  tool_choice?: any;
  max_tokens?: number;
  /**
   * Reason first (streamed through onThinking), or not. Sent as "disabled"
   * when unset: DeepSeek reasons by default, which is slow for bulk calls and
   * refuses a forced tool_choice.
   */
  thinking?: Thinking;
}

const MAX_TOKENS = 2048;
const THINKING_BUDGET = 1200;

// Transient upstream failures (overload, rate limit, gateway) — worth retrying.
const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504, 529]);
const MAX_RETRIES = 5;
const MAX_RETRY_AFTER_MS = 20_000; // never sleep more than 20s on a single retry

/** Our proxy's "no key" answer (503 + this header), not an upstream 503. */
const isNoKey = (res: Response) => res.status === 503 && res.headers.get("x-agent-error") === "no_key";

// Parse a `retry-after` header (seconds OR HTTP date). Returns ms to wait, or
// null when missing/unparseable. Capped at MAX_RETRY_AFTER_MS so a hostile or
// stale value can't freeze the UI.
function parseRetryAfter(h: string | null): number | null {
  if (!h) return null;
  const trimmed = h.trim();
  // Numeric seconds.
  const secs = Number(trimmed);
  if (Number.isFinite(secs) && secs >= 0) {
    return Math.min(MAX_RETRY_AFTER_MS, Math.round(secs * 1000));
  }
  // HTTP date.
  const t = Date.parse(trimmed);
  if (!Number.isNaN(t)) {
    const delta = t - Date.now();
    if (delta > 0) return Math.min(MAX_RETRY_AFTER_MS, delta);
  }
  return null;
}

// Pick a backoff delay for the given attempt + status. 429 gets a much longer
// base than overload/network errors (rate limits are time-window based; short
// retries just burn through more limit before the window resets).
function backoffMs(attempt: number, status: number): number {
  const base = status === 429 ? 2_000 : 500;
  const cap = status === 429 ? 15_000 : 6_000;
  const exp = Math.min(cap, base * Math.pow(2, attempt));
  return exp + Math.random() * 400;
}

async function fetchWithRetry(body: any, signal?: AbortSignal): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let status = 0;
    let retryAfterMs: number | null = null;
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ max_tokens: MAX_TOKENS, ...body }),
        signal,
      });
      status = res.status;
      // No key behind the proxy: no retry, the caller shows its mock.
      if (isNoKey(res)) return res;
      if (!TRANSIENT_STATUSES.has(res.status)) return res;
      // Transient — capture the proxy-forwarded retry-after before retrying.
      retryAfterMs = parseRetryAfter(res.headers.get("retry-after"));
      const text = await res.text().catch(() => "");
      lastErr = new Error(`agent request failed: ${res.status} ${text.slice(0, 200)}`);
    } catch (err) {
      // Network errors are also transient; aborts propagate immediately.
      if ((err as { name?: string })?.name === "AbortError") throw err;
      lastErr = err;
    }
    // Don't sleep after the last attempt.
    if (attempt >= MAX_RETRIES - 1) break;
    const delay = retryAfterMs ?? backoffMs(attempt, status || 500);
    await new Promise((r) => setTimeout(r, delay));
  }
  throw lastErr ?? new Error("agent request failed after retries");
}

type Block =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string; signature: string }
  | { type: "tool_use"; id: string; name: string; json: string };

// One streamed model turn. Calls onText with each text delta; collects tool_use
// blocks and the stop_reason. Throws NoKeyError when the proxy has no key.
// Transient upstream failures (429/5xx) are retried up to 5 times.
export async function streamMessage(
  body: StreamBody,
  opts: { onText?: (delta: string) => void; onThinking?: (delta: string) => void; onToolStart?: (name: string) => void; signal?: AbortSignal } = {},
): Promise<TurnResult> {
  // Live AI off: every caller falls back to its mock, as with no key.
  if (!liveAiOn()) throw new NoKeyError();
  // OpenRouter wants a budget with "enabled"; DeepSeek's own API ignores it.
  const thinking: Thinking = body.thinking?.type === "enabled" ? { budget_tokens: THINKING_BUDGET, ...body.thinking } : { type: "disabled" };
  const res = await fetchWithRetry({ ...body, thinking }, opts.signal);
  if (isNoKey(res)) {
    markAiUnavailable();
    throw new NoKeyError();
  }
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    const hint =
      res.status === 401 ? " (the provider refused the key: check the key in .env.local, then restart `pnpm dev`)"
      : res.status === 402 ? " (insufficient balance on this key's account)"
      : "";
    throw new Error(`agent request failed: ${res.status}${hint} ${text.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let text = "";
  let stopReason: string | null = null;
  const blocks: Record<number, Block> = {};

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const chunks = buf.split(/\r?\n\r?\n/);
    buf = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const dataLine = chunk.split(/\r?\n/).find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      const data = dataLine.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      let json: any;
      try { json = JSON.parse(data); } catch { continue; }
      switch (json.type) {
        case "content_block_start": {
          const cb = json.content_block;
          if (cb?.type === "tool_use") {
            blocks[json.index] = { type: "tool_use", id: cb.id, name: cb.name, json: "" };
            // The model starts writing a tool's input (it can take seconds): say what it's doing.
            opts.onToolStart?.(cb.name);
          } else if (cb?.type === "thinking") {
            blocks[json.index] = { type: "thinking", thinking: cb.thinking ?? "", signature: cb.signature ?? "" };
          } else if (cb?.type === "text") {
            blocks[json.index] = { type: "text", text: cb.text ?? "" };
          }
          break;
        }
        case "content_block_delta": {
          const b = blocks[json.index];
          const d = json.delta;
          if (d?.type === "text_delta") {
            text += d.text;
            if (b?.type === "text") b.text += d.text;
            opts.onText?.(d.text);
          } else if (d?.type === "thinking_delta") {
            // The model's reasoning (only when `thinking` is enabled).
            if (b?.type === "thinking") b.thinking += d.thinking ?? "";
            opts.onThinking?.(d.thinking ?? "");
          } else if (d?.type === "signature_delta") {
            if (b?.type === "thinking") b.signature += d.signature ?? "";
          } else if (d?.type === "input_json_delta") {
            if (b?.type === "tool_use") b.json += d.partial_json;
          }
          break;
        }
        case "message_delta":
          if (json.delta?.stop_reason) stopReason = json.delta.stop_reason;
          break;
        case "error": {
          // A real SSE event when the upstream chokes mid-stream
          // (overloaded_error, api_error, etc.). Surface it so the caller's
          // catch shows something useful instead of an empty bubble.
          const e = json.error ?? json;
          throw new Error(`stream error: ${e.type ?? "unknown"}${e.message ? `, ${e.message}` : ""}`);
        }
      }
    }
  }

  const toolUses: ToolUse[] = [];
  const content: any[] = [];
  for (const index of Object.keys(blocks).map(Number).sort((a, b) => a - b)) {
    const b = blocks[index];
    if (b.type === "tool_use") {
      let input: any = {};
      try { input = b.json ? JSON.parse(b.json) : {}; } catch { input = {}; }
      toolUses.push({ id: b.id, name: b.name, input });
      content.push({ type: "tool_use", id: b.id, name: b.name, input });
    } else if (b.type === "thinking") {
      content.push({ type: "thinking", thinking: b.thinking, signature: b.signature });
    } else if (b.text.trim()) {
      // The API rejects whitespace-only text blocks.
      content.push({ type: "text", text: b.text });
    }
  }
  return { text, toolUses, stopReason, content };
}

// Returned from onTool to pause the loop for human input (e.g. a questionnaire).
// The caller resumes by appending the matching tool_result to history and
// calling runAgentTurn again.
export const PAUSE = Symbol("agent-pause");

export interface AgentHooks {
  /** A streamed text delta from the model. */
  onText: (delta: string) => void;
  /** A streamed reasoning delta (when `thinking` is enabled). */
  onThinking?: (delta: string) => void;
  /** The model starts writing a tool call (before it runs). */
  onToolStart?: (name: string) => void;
  /** A tool is about to run — render its artifact, reset the live text bubble,
   *  or return PAUSE to wait for human input. */
  onTool: (name: string, input: any, toolUseId: string) => unknown | typeof PAUSE | Promise<unknown | typeof PAUSE>;
}

// Multi-turn tool loop. `history` is mutated in place (it's the API source of
// truth and is persisted by the caller). Streams text via hooks.onText and
// dispatches tool calls via hooks.onTool, feeding results back until the model
// stops asking for tools (or maxTurns is hit).
export async function runAgentTurn(
  history: AnthropicMessage[],
  cfg: { system: any; tools: any[]; signal?: AbortSignal; maxTokens?: number; thinking?: Thinking },
  hooks: AgentHooks,
  maxTurns = 6,
): Promise<void> {
  for (let turn = 0; turn < maxTurns; turn++) {
    const { toolUses, stopReason, content } = await streamMessage(
      { system: cfg.system, messages: history, tools: cfg.tools, max_tokens: cfg.maxTokens ?? MAX_TOKENS, thinking: cfg.thinking },
      { onText: hooks.onText, onThinking: hooks.onThinking, onToolStart: hooks.onToolStart, signal: cfg.signal },
    );

    // Echo the whole assistant turn back into history, thinking blocks
    // included: DeepSeek wants them back to continue a tool loop in thinking
    // mode. A turn with nothing usable (rare: usually an error mid-stream)
    // becomes a single dot, since the API rejects an empty content.
    const hasOutput = content.some((b) => b.type !== "thinking");
    history.push({ role: "assistant", content: hasOutput ? content : [...content, { type: "text", text: "." }] });

    if (stopReason !== "tool_use" || toolUses.length === 0) return;

    const results: any[] = [];
    for (const tu of toolUses) {
      const out = await Promise.resolve(hooks.onTool(tu.name, tu.input, tu.id));
      // Human-in-the-loop tool (e.g. ask_preferences): stop here. The assistant
      // turn with the tool_use is already in history; the caller resumes by
      // appending the matching tool_result and re-invoking runAgentTurn.
      if (out === PAUSE) return;
      results.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(out ?? {}) });
    }
    history.push({ role: "user", content: results });
  }
}
