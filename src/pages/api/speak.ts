import type { APIRoute } from "astro";
import { bindings, error } from "../../server/env";

export const prerender = false;

/** Eleven Multilingual v2, no language override: the model decides how Baltmeri sounds. */
const VOICE_ID = "XAezqB2SuTKEhjCMe7Oy";
const MODEL_ID = "eleven_multilingual_v2";

export const POST: APIRoute = async (ctx) => {
  let body: { text?: string };
  try { body = await ctx.request.json(); } catch { return error("Body must be JSON."); }
  const text = (body.text ?? "").trim();
  if (!text) return error("Nothing to say.");
  if (text.length > 1500) return error("Too long to voice.");
  const key = bindings(ctx).ELEVENLABS_API_KEY;
  if (!key) return error("ELEVENLABS_API_KEY is not configured.", 500);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: MODEL_ID })
  });
  if (!res.ok) {
    console.error("elevenlabs", res.status, await res.text());
    return error("Voice synthesis failed.", 502);
  }
  const slug = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "baltmeri";
  return new Response(res.body, {
    headers: {
      "content-type": "audio/mpeg",
      "content-disposition": `inline; filename="baltmeri-${slug}.mp3"`,
      "cache-control": "private, max-age=3600"
    }
  });
};
