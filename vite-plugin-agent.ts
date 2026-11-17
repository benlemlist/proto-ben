import type { Connect, Plugin } from "vite";
import { loadEnv } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

// Both upstreams speak the Anthropic Messages API (streaming, tools, thinking blocks).
// Same values in api/agent.ts.
/** DeepSeek's own API (a key from platform.deepseek.com). `deepseek-v4-pro` is the larger model. */
const DEEPSEEK = { name: "DeepSeek", url: "https://api.deepseek.com/anthropic/v1/messages", model: "deepseek-flash" };
/** DeepSeek through OpenRouter (a key that starts with `sk-or-`). The dated id: the lempire workspace's guardrail refuses the undated one. */
const OPENROUTER = { name: "OpenRouter", url: "https://openrouter.ai/api/v1/messages", model: "deepseek/deepseek-v4.1-flash-1017" };

/** Which upstream the keys of .env.local give: OpenRouter first, then DeepSeek's own API. An OpenRouter key put in DEEPSEEK_API_KEY goes to OpenRouter. */
function upstreamOf(env: Record<string, string | undefined>) {
  const direct = (env.DEEPSEEK_API_KEY ?? "").trim();
  const router = (env.OPENROUTER_API_KEY ?? "").trim() || (direct.startsWith("sk-or-") ? direct : "");
  if (router) return { ...OPENROUTER, key: router };
  if (direct) return { ...DEEPSEEK, key: direct };
  return null;
}

// `pnpm dev` and `pnpm preview` only. Proxies POST /api/agent → DeepSeek
// (streaming), and adds the key of .env.local (OPENROUTER_API_KEY or
// DEEPSEEK_API_KEY) on the server side, so the key never reaches the browser
// bundle. With no key: 503 + the header `x-agent-error: no_key`, which the
// client (src/lib/agent.ts) reads to fall back to the feature's mock. The
// deployed equivalent is api/agent.ts.
export function agentProxy(): Plugin {
  let target: ReturnType<typeof upstreamOf> = null;

  const handler: Connect.NextHandleFunction = (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }
    const up = target;
    if (!up) {
      res.statusCode = 503;
      res.setHeader("content-type", "application/json");
      res.setHeader("x-agent-error", "no_key");
      res.end(JSON.stringify({ error: "no_key" }));
      return;
    }
    let body = "";
    req.on("error", () => { if (!res.writableEnded) res.end(); });
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const upstream = await fetch(up.url, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${up.key}` },
          // The proxy decides the model, whatever the client asks for.
          body: JSON.stringify({ stream: true, ...payload, model: up.model }),
        });
        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text();
          if (upstream.status === 401) console.warn(`[agent-proxy] ${up.name} refused the key (401). Check the key in .env.local, then restart \`pnpm dev\`.`);
          else if (upstream.status === 402) console.warn(`[agent-proxy] ${up.name}: insufficient balance (402). Top up the account of this key.`);
          else console.warn(`[agent-proxy] ${up.name} answered ${upstream.status}: ${text.slice(0, 200)}`);
          res.statusCode = upstream.status || 500;
          res.setHeader("content-type", "application/json");
          // The client waits this long before its next try (429).
          const retryAfter = upstream.headers.get("retry-after");
          if (retryAfter) res.setHeader("retry-after", retryAfter);
          res.end(text || JSON.stringify({ error: "upstream_error" }));
          return;
        }
        res.statusCode = 200;
        res.setHeader("content-type", "text/event-stream");
        res.setHeader("cache-control", "no-cache");
        res.setHeader("connection", "keep-alive");
        res.flushHeaders?.();
        // Pipe SSE bytes straight through, unbuffered.
        // A dropped upstream (ECONNRESET mid-stream) or a closed tab must never take the dev server down:
        // end this response, the client sees a stream error and retries or shows "Try again".
        const stream = Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]);
        stream.on("error", (err) => {
          console.warn("[agent-proxy] upstream stream error:", (err as Error).message);
          if (!res.writableEnded) res.end();
        });
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
  };

  return {
    name: "agent-proxy",
    configResolved(config) {
      // Vite does NOT populate process.env for middleware — read .env* explicitly.
      target = upstreamOf(loadEnv(config.mode, config.root, ""));
      config.logger.info(
        target
          ? `  [agent-proxy] ${target.name} key loaded: AI features run live on ${target.model}.`
          : "  [agent-proxy] No OPENROUTER_API_KEY or DEEPSEEK_API_KEY in .env.local: AI features use their mock.",
      );
    },
    configureServer(server) {
      server.middlewares.use("/api/agent", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/agent", handler);
    },
  };
}
