interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  PAYMOCK_TOKEN?: string;
}

const PAYMOCK_BASE = 'https://paymock.ihornone.site';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/paymock-api')) {
      const target = PAYMOCK_BASE + url.pathname.replace(/^\/paymock-api/, '') + url.search;
      const headers = new Headers();
      const contentType = request.headers.get('content-type');
      if (contentType) headers.set('Content-Type', contentType);

      const token = env.PAYMOCK_TOKEN || request.headers.get('X-Token');
      if (token) headers.set('X-Token', token);

      const response = await fetch(target, {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
