import type { APIRoute } from 'astro';
import { updateOrderStatus } from '@/server/db';
import { getInvoiceStatus, PaymockError } from '@/server/paymock';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const invoiceId = url.searchParams.get('invoiceId');
  if (!invoiceId || invoiceId.length > 128) {
    return jsonResponse({ error: 'invoiceId query parameter is required' }, 400);
  }

  try {
    const invoice = await getInvoiceStatus(invoiceId);
    // Row may not exist for invoices created before D1 — the UPDATE is a no-op then.
    await updateOrderStatus(invoiceId, invoice.status);
    return jsonResponse(invoice);
  } catch (error) {
    if (error instanceof PaymockError) {
      return jsonResponse({ error: error.message }, 502);
    }
    return jsonResponse({ error: 'Failed to fetch invoice status' }, 500);
  }
};
