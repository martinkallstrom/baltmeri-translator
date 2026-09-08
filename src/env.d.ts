/// <reference types="astro/client" />
import type { KVNamespace } from "@cloudflare/workers-types/experimental";

declare global {
  interface Env {
    ANTHROPIC_API_KEY: string;
    ELEVENLABS_API_KEY: string;
    BALTMERI_CACHE?: KVNamespace;
  }
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {
  interface Locals extends Runtime {}
}
