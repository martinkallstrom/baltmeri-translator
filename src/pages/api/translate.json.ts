import type { APIRoute } from "astro";
import { MAX_CHARS, error, json, translator } from "../../server/env";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  let body: { text?: string; from?: string; to?: string };
  try { body = await ctx.request.json(); } catch { return error("Body must be JSON."); }
  const text = (body.text ?? "").trim();
  if (!text) return error("Nothing to translate.");
  if (text.length > MAX_CHARS) return error(`Please keep it under ${MAX_CHARS} characters.`);
  const from = body.from ?? "auto";
  const to = body.to ?? "bm";
  try {
    const t = translator(ctx);
    if (from === "bm") return json(await t.reverse(text, to === "auto" ? "en" : to));
    return json(await t.forward(text, from));
  } catch (e) {
    console.error(e);
    return error(e instanceof Error ? e.message : "Translation failed.", 502);
  }
};
