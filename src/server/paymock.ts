import { env } from 'cloudflare:workers';
import type { InvoiceStatusResponse } from '@/features/payment/types/payment.types';

const PAYMOCK_BASE = 'https://paymock.ihornone.site';

export interface InvoiceCreatePayload {
  amount: number;
  ccy: number;
  redirectUrl: string;
  merchantPaymInfo: {
    reference: string;
    destination: string;
    customerName: string;
    customerPhone: string;
    deliveryMethod: string;
    deliveryAddress?: string;
    basketOrder: Array<{ name: string; qty: number; price: number; sum: number; image: string }>;
  };
}

export interface InvoiceCreateResponse {
  invoiceId: string;
  pageUrl: string;
}

export class PaymockError extends Error {
  constructor(
    readonly httpStatus: number,
    message: string
  ) {
    super(message);
    this.name = 'PaymockError';
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = env.PAYMOCK_TOKEN;
  if (!token) {
    throw new PaymockError(500, 'PAYMOCK_TOKEN is not configured');
  }

  const response = await fetch(PAYMOCK_BASE + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Token': token,
    },
  });

  if (!response.ok) {
    throw new PaymockError(response.status, `Paymock request failed: HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function createInvoice(payload: InvoiceCreatePayload): Promise<InvoiceCreateResponse> {
  return request('/api/merchant/invoice/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getInvoiceStatus(invoiceId: string): Promise<InvoiceStatusResponse> {
  return request(`/api/merchant/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`, {
    method: 'GET',
  });
}
