import type { Dish } from '@/features/catalog/types/menu.types';

export type CartMap = Record<string, number>;

export interface CartItem {
  dish: Dish;
  count: number;
}

export type DeliveryMethod = 'Самовивіз' | 'Доставка';

export interface CheckoutStatus {
  kind: 'idle' | 'pending' | 'error' | 'done';
  text: string;
}

export interface StoredOrder {
  invoiceId: string;
  total: number;
  items: Array<{
    name: string;
    qty: number;
    sum: number;
  }>;
  at: number;
}
