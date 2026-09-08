import { handle } from "@astrojs/cloudflare/handler";

/** Public but unindexed: every response carries X-Robots-Tag: noindex. */
export default {
  async fetch(request, env, context) {
    const response = await handle(request, env, context);
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
} satisfies ExportedHandler<Env>;
