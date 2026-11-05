export type PaymentState = 'pending' | 'success' | 'failure';

export type InvoicePaymentStatus =
  | 'created'
  | 'processing'
  | 'hold'
  | 'success'
  | 'failure'
  | 'reversed'
  | 'expired';

export interface InvoiceStatusResponse {
  status: InvoicePaymentStatus;
  invoiceId: string;
  amount?: number;
  ccy?: number;
}
