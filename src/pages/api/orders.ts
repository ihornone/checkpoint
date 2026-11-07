import type { APIRoute } from 'astro';
import { createOrder, getDishesBySlugs, getPricing } from '@/server/db';
import { createInvoice, PaymockError } from '@/server/paymock';

const DELIVERY_METHODS = ['Самовивіз', 'Доставка'] as const;
type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

const MAX_ITEMS = 30;
const MAX_QTY_PER_ITEM = 20;
const PHONE_PATTERN = /^[+0-9 ()-]{10,20}$/;

interface OrderRequestBody {
  name: string;
  phone: string;
  method: string;
  address?: string;
  items: Array<{ slug: string; qty: number }>;
}

interface ValidatedOrder {
  name: string;
  phone: string;
  method: DeliveryMethod;
  address?: string;
  items: Array<{ slug: string; qty: number }>;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function validateOrder(body: unknown): ValidatedOrder | string {
  if (!body || typeof body !== 'object') return 'Body must be a JSON object';
  const { name, phone, method, address, items } = body as Partial<OrderRequestBody>;

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return 'Name must be 2-100 characters';
  }
  if (typeof phone !== 'string' || !PHONE_PATTERN.test(phone.trim())) {
    return 'Phone must match [+0-9 ()-]{10,20}';
  }
  if (typeof method !== 'string' || !DELIVERY_METHODS.includes(method as DeliveryMethod)) {
    return `Method must be one of: ${DELIVERY_METHODS.join(', ')}`;
  }

  let deliveryAddress: string | undefined;
  if (method === 'Доставка') {
    if (typeof address !== 'string' || address.trim().length < 1 || address.trim().length > 200) {
      return 'Address is required for delivery (1-200 characters)';
    }
    deliveryAddress = address.trim();
  }

  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_ITEMS) {
    return `Items must be a non-empty array of at most ${MAX_ITEMS} entries`;
  }

  // Merge duplicate slugs so a tampered cart cannot inflate quantities.
  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!item || typeof item !== 'object') return 'Each item must be an object';
    const { slug, qty } = item as Partial<{ slug: string; qty: number }>;
    if (typeof slug !== 'string' || slug.length < 1 || slug.length > 100) {
      return 'Item slug must be a string of 1-100 characters';
    }
    if (!Number.isInteger(qty) || (qty as number) < 1 || (qty as number) > MAX_QTY_PER_ITEM) {
      return `Item quantity must be an integer between 1 and ${MAX_QTY_PER_ITEM}`;
    }
    quantities.set(slug, Math.min((quantities.get(slug) ?? 0) + (qty as number), MAX_QTY_PER_ITEM));
  }

  return {
    name: name.trim(),
    phone: phone.trim(),
    method: method as DeliveryMethod,
    address: deliveryAddress,
    items: [...quantities].map(([slug, qty]) => ({ slug, qty })),
  };
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const order = validateOrder(body);
  if (typeof order === 'string') {
    return jsonResponse({ error: order }, 400);
  }

  try {
    const dishes = await getDishesBySlugs(order.items.map((item) => item.slug));
    if (dishes.length !== order.items.length) {
      return jsonResponse({ error: 'Some dishes are missing from the menu' }, 400);
    }

    const dishBySlug = new Map(dishes.map((dish) => [dish.slug, dish]));
    const origin = new URL(request.url).origin;
    const orderItems = order.items.map(({ slug, qty }) => {
      const dish = dishBySlug.get(slug)!;
      return {
        slug,
        name: dish.name,
        qty,
        price: dish.price,
        sum: dish.price * qty,
        image: `${origin}${dish.imagePath}`,
      };
    });
    const total = orderItems.reduce((sum, item) => sum + item.sum, 0);
    const reference = `order-${Date.now()}`;

    const pricing = await getPricing();
    const invoice = await createInvoice({
      amount: total * 100,
      ccy: pricing.currencyCodeUah,
      redirectUrl: `${origin}/payment/`,
      merchantPaymInfo: {
        reference,
        destination: 'Замовлення CHECK POINT',
        customerName: order.name,
        customerPhone: order.phone,
        deliveryMethod: order.method,
        deliveryAddress: order.address,
        basketOrder: orderItems.map(({ name, qty, price, sum, image }) => ({ name, qty, price, sum, image })),
      },
    });

    await createOrder({
      invoiceId: invoice.invoiceId,
      reference,
      name: order.name,
      phone: order.phone,
      method: order.method,
      address: order.address,
      items: orderItems.map(({ slug, name, qty, sum }) => ({ slug, name, qty, sum })),
      total,
    });

    return jsonResponse({ invoiceId: invoice.invoiceId, pageUrl: invoice.pageUrl });
  } catch (error) {
    if (error instanceof PaymockError) {
      return jsonResponse({ error: error.message }, 502);
    }
    return jsonResponse({ error: 'Failed to create order' }, 500);
  }
};
