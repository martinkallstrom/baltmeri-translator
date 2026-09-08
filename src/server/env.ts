import type { APIContext } from "astro";
import type { KVNamespace } from "@cloudflare/workers-types/experimental";
import { env as workerEnv } from "cloudflare:workers";
import { client } from "./llm";
import { Translator } from "./translate";

export interface Bindings {
  ANTHROPIC_API_KEY: string;
  ELEVENLABS_API_KEY: string;
  BALTMERI_CACHE?: KVNamespace;
}

export function bindings(ctx: APIContext): Bindings {
  void ctx;
  const env = (workerEnv ?? {}) as Partial<Bindings>;
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const p = g.process?.env ?? {};
  return {
    ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY ?? p.ANTHROPIC_API_KEY ?? "",
    ELEVENLABS_API_KEY: env.ELEVENLABS_API_KEY ?? p.ELEVENLABS_API_KEY ?? "",
    BALTMERI_CACHE: env.BALTMERI_CACHE
  };
}

export function translator(ctx: APIContext): Translator {
  const b = bindings(ctx);
  if (!b.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured.");
  return new Translator(client(b.ANTHROPIC_API_KEY), b.BALTMERI_CACHE);
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

export function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export const MAX_CHARS = 1200;
