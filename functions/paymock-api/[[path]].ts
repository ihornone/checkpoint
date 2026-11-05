const PAYMOCK_BASE = 'https://paymock.ihornone.site';

interface PagesFunctionContext {
  request: Request;
  env: Record<string, string | undefined>;
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
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
