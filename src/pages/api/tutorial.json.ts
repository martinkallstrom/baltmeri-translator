import type { APIRoute } from "astro";
import { error, json, translator } from "../../server/env";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  let body: { source?: string; sourceLang?: string; baltmeri?: string; trace?: string };
  try { body = await ctx.request.json(); } catch { return error("Body must be JSON."); }
  if (!body.source || !body.baltmeri) return error("source and baltmeri are required.");
  try {
    const t = translator(ctx);
    return json({ tutorial: await t.tutorial(body.source, body.sourceLang ?? "auto", body.baltmeri, body.trace ?? "") });
  } catch (e) {
    console.error(e);
    return error(e instanceof Error ? e.message : "Tutorial failed.", 502);
  }
};
