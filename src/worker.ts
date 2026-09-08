import { handle } from "@astrojs/cloudflare/handler";
import type { ExecutionContext, ExportedHandler } from "@cloudflare/workers-types/experimental";

/** Public but unindexed: every response carries X-Robots-Tag: noindex. */
export default {
  async fetch(request, env, context) {
    const response = await handle(request as unknown as Request, env, context as unknown as ExecutionContext);
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers }) as unknown as ReturnType<NonNullable<ExportedHandler<Env>["fetch"]>>;
  }
} satisfies ExportedHandler<Env>;
