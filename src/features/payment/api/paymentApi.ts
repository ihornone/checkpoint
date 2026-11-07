import type { InvoiceStatusResponse } from '../types/payment.types';

export const paymentApi = {
  async checkInvoiceStatus(invoiceId: string): Promise<InvoiceStatusResponse> {
    const response = await fetch(`/api/orders/status?invoiceId=${encodeURIComponent(invoiceId)}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Order status fetch error: HTTP ${response.status}`);
    }

    return response.json();
  },
};
