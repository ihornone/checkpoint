/// <reference path="../worker-configuration.d.ts" />

declare global {
  // wrangler types only include bindings from wrangler.toml (Cloudflare.Env),
  // so the Paymock secret is merged in here.
  namespace Cloudflare {
    interface Env {
      PAYMOCK_TOKEN?: string;
    }
  }

  interface Env {
    PAYMOCK_TOKEN?: string;
  }
}

export {};
