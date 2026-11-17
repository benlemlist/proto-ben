// Vercel Edge Function: the deployed equivalent of vite-plugin-agent.ts.
// Proxies POST /api/agent → DeepSeek's Anthropic-format Messages API
// (streaming), and adds the key on the server side, so the key never reaches
// the browser bundle. With no key: 503 + the header `x-agent-error: no_key`,
// which the client (src/lib/agent.ts) reads to fall back to the feature's mock.
//
// Requires OPENROUTER_API_KEY (DeepSeek through OpenRouter, used first) or
// DEEPSEEK_API_KEY (DeepSeek's own API) in the Vercel project (Settings →
// Environment Variables).

export const config = { runtime: "edge" };

// Both upstreams speak the Anthropic Messages API. Same values and same choice as in vite-plugin-agent.ts.
const DEEPSEEK = { url: "https://api.deepseek.com/anthropic/v1/messages", model: "deepseek-flash" };
const OPENROUTER = { url: "https://openrouter.ai/api/v1/messages", model: "deepseek/deepseek-v4.1-flash-1017" };

function upstreamOf(env: Record<string, string | undefined>) {
  const direct = (env.DEEPSEEK_API_KEY ?? "").trim();
  const router = (env.OPENROUTER_API_KEY ?? "").trim() || (direct.startsWith("sk-or-") ? direct : "");
  if (router) return { ...OPENROUTER, key: router };
  if (direct) return { ...DEEPSEEK, key: direct };
  return null;
}

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const up = upstreamOf(process.env);
  if (!up) return json({ error: "no_key" }, 503, { "x-agent-error": "no_key" });

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  let upstream: Response;
  try {
    upstream = await fetch(up.url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${up.key}` },
      // The proxy decides the model, whatever the client asks for.
      body: JSON.stringify({ stream: true, ...payload, model: up.model }),
    });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    // The client waits this long before its next try (429).
    const retryAfter = upstream.headers.get("retry-after");
    return json(text || { error: "upstream_error" }, upstream.status || 500, retryAfter ? { "retry-after": retryAfter } : {});
  }

  // Pipe the SSE stream straight through to the browser.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}
