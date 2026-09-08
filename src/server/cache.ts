import type { KVNamespace } from "@cloudflare/workers-types/experimental";

/** Derivation and analysis cache: Cloudflare KV when bound, in-memory otherwise. */
export interface Cache {
  get<T>(key: string): Promise<T | null>;
  put<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
}

const memory = new Map<string, string>();

export function makeCache(kv?: KVNamespace): Cache {
  if (kv) {
    return {
      async get<T>(key: string) {
        const v = await kv.get(key);
        return v ? (JSON.parse(v) as T) : null;
      },
      async put<T>(key: string, value: T, ttlSeconds?: number) {
        await kv.put(key, JSON.stringify(value), ttlSeconds ? { expirationTtl: ttlSeconds } : undefined);
      }
    };
  }
  return {
    async get<T>(key: string) {
      const v = memory.get(key);
      return v ? (JSON.parse(v) as T) : null;
    },
    async put<T>(key: string, value: T) {
      memory.set(key, JSON.stringify(value));
    }
  };
}

export async function sha1(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
