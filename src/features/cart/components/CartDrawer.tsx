import { useEffect, useState, type FormEvent } from 'react';
import { Drawer } from 'vaul';
import type { CartDish } from '@/features/catalog/types/menu.types';
import type { PricingRules } from '@/shared/types/site';
import { CartItemPhoto } from './CartItemPhoto';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { CUSTOM_EVENTS } from '@/shared/constants/events';
import type { CartMap, DeliveryMethod, CheckoutStatus, StoredOrder } from '../types/cart.types';

interface CartDrawerProps {
  /** Dishes loaded from D1 on the server and passed down from Layout. */
  dishes: CartDish[];
  pricing: PricingRules;
}

function readCart(dishes: CartDish[]): CartMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const valid: CartMap = {};
    for (const [id, count] of Object.entries(parsed)) {
      if (dishes.some((dish) => dish.slug === id) && Number.isInteger(count) && (count as number) >= 1) {
        valid[id] = count as number;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

export default function CartDrawer({ dishes, pricing }: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartMap>({});
  const [direction, setDirection] = useState<'bottom' | 'right'>('bottom');
  const [method, setMethod] = useState<DeliveryMethod>('Самовивіз');
  const [status, setStatus] = useState<CheckoutStatus>({ kind: 'idle', text: '' });

  useEffect(() => {
    setCart(readCart(dishes));
    const mq = matchMedia('(min-width: 640px)');
    const apply = () => setDirection(mq.matches ? 'right' : 'bottom');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const badge = document.querySelector('#cart-count');
    if (badge) badge.textContent = String(Object.values(cart).reduce((sum, count) => sum + count, 0));
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const add = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    };
    const openCart = () => {
      delete document.documentElement.dataset.cartRequested;
      setOpen(true);
    };
    document.addEventListener(CUSTOM_EVENTS.CART_ADD, add);
    document.addEventListener(CUSTOM_EVENTS.CART_OPEN, openCart);
    if (document.documentElement.dataset.cartRequested === 'true') openCart();
    return () => {
      document.removeEventListener(CUSTOM_EVENTS.CART_ADD, add);
      document.removeEventListener(CUSTOM_EVENTS.CART_OPEN, openCart);
    };
  }, []);

  const entries = Object.entries(cart);
  const items = entries.map(([id, count]) => ({ dish: dishes.find((item) => item.slug === id)!, count }));
  const total = items.reduce((sum, { dish, count }) => sum + dish.price * count, 0);

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!entries.length || status.kind === 'pending') return;
    const data = new FormData(event.target as HTMLFormElement);
    setStatus({ kind: 'pending', text: 'Створюємо рахунок…' });
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          phone: data.get('phone'),
          method,
          address: data.get('address') || undefined,
          items: items.map(({ dish, count }) => ({ slug: dish.slug, qty: count })),
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `HTTP ${response.status}`);
      }
      const invoice = (await response.json()) as { invoiceId: string; pageUrl: string };
      const lastOrder: StoredOrder = {
        invoiceId: invoice.invoiceId,
        total,
        items: items.map(({ dish, count }) => ({ name: dish.name, qty: count, sum: dish.price * count })),
        at: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.LAST_ORDER, JSON.stringify(lastOrder));
      setCart({});
      setStatus({ kind: 'done', text: 'Рахунок створено! Переходимо до оплати…' });
      window.location.href = invoice.pageUrl;
    } catch (error) {
      console.error(error);
      setStatus({ kind: 'error', text: 'Не вдалося створити рахунок. Спробуй ще раз.' });
    }
  }

  const scrollAreaClass = 'flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

  return (
    <Drawer.Root direction={direction} open={open} onOpenChange={setOpen} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" />
        <Drawer.Content
          key={direction}
          className={
            direction === 'right'
              ? 'fixed inset-y-0 right-0 z-[70] flex w-[30rem] max-w-full flex-col gap-0 overflow-hidden rounded-l-3xl border border-white/10 bg-ink px-8 py-8 text-paper outline-none'
              : 'fixed inset-x-0 bottom-0 z-[70] flex max-h-[88dvh] flex-col gap-0 rounded-t-3xl border border-white/10 bg-ink px-5 pb-8 pt-2 text-paper outline-none'
          }
        >
          {direction === 'bottom' && <span className="mx-auto mb-4 mt-1 block h-1.5 w-12 shrink-0 rounded-full bg-white/20" aria-hidden="true" />}
          <div className="flex shrink-0 items-center justify-between gap-5 border-b border-white/10 pb-5">
            <Drawer.Title className="mb-0 text-3xl font-black">Твій кошик<span className="text-brand">.</span></Drawer.Title>
            {direction === 'right' && (
              <button className="rounded-xl p-2 text-2xl text-white/70 hover:text-brand" onClick={() => setOpen(false)} aria-label="Закрити кошик" type="button">✕</button>
            )}
          </div>

          <div className={`${scrollAreaClass} mt-2 min-h-0`}>
            {items.length ? (
              items.map(({ dish, count }) => (
                <div key={dish.slug} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-start gap-4 border-b border-white/10 py-5">
                  <CartItemPhoto dish={dish} />
                  <div className="min-w-0">
                    <a className="font-extrabold text-paper" href={`/menu/${dish.slug}/`}>{dish.name}</a>
                    <p className="my-1 text-xs text-white/50">{dish.price} грн</p>
                    <div className="inline-flex items-center gap-3">
                      <button
                        className="grid size-8 place-items-center rounded-xl border border-white/15"
                        onClick={() => setCart((current) => {
                          const next = { ...current };
                          if (next[dish.slug] <= 1) delete next[dish.slug];
                          else next[dish.slug] -= 1;
                          return next;
                        })}
                        aria-label={`Зменшити кількість ${dish.name}`}
                        type="button"
                      >
                        −
                      </button>
                      <span>{count}</span>
                      <button
                        className="grid size-8 place-items-center rounded-xl border border-white/15"
                        onClick={() => setCart((current) => ({ ...current, [dish.slug]: current[dish.slug] + 1 }))}
                        aria-label={`Збільшити кількість ${dish.name}`}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <b className="whitespace-nowrap text-sm">{dish.price * count} грн</b>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-sm leading-7 text-white/60">
                <p className="mb-3 text-base font-bold text-paper">Твій кошик поки порожній</p>
                <p className="mb-5 text-white/50">Обери гарячу піцу, соковитий бургер або вигідне комбо — приготуємо та доставимо від 30 хвилин!</p>
                <a className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-extrabold text-ink transition hover:brightness-110" href="/menu/" onClick={() => setOpen(false)}>
                  Відкрити меню ↗
                </a>
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-base sm:text-lg">
                  <span className="text-white/70">Сума замовлення:</span>
                  <b className="text-xl font-black text-paper">{total} грн</b>
                </div>
                {method === 'Доставка' && (
                  <div className="mt-2 text-xs leading-5">
                    {total >= pricing.freeDeliveryThreshold ? (
                      <span className="font-bold text-brand">🎉 Доставка по Львову для тебе БЕЗКОШТОВНА!</span>
                    ) : (
                      <span className="text-white/55">
                        Додай страв ще на <b className="text-paper">{pricing.freeDeliveryThreshold - total} грн</b> для безкоштовної доставки по місту.
                      </span>
                    )}
                  </div>
                )}
                {method === 'Самовивіз' && (
                  <p className="mt-1 text-xs text-brand font-bold">
                    ✓ Самовивіз на вул. Київській, 36 зі знижкою −{pricing.onlineDiscountPercent}% (готовність 15–20 хв)
                  </p>
                )}
              </div>
            )}

            {items.length > 0 && (
              <form className="mt-5 grid gap-4" onSubmit={checkout}>
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
                  Твоє ім’я
                  <input className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-base font-normal text-paper transition focus:border-brand focus:outline-none" name="name" required autoComplete="given-name" placeholder="Як до тебе звертатися?" />
                </label>
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
                  Номер телефону
                  <input className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-base font-normal text-paper transition focus:border-brand focus:outline-none" name="phone" type="tel" required pattern="[+0-9 ()-]{10,20}" autoComplete="tel" placeholder="+380 (XX) XXX-XX-XX" />
                </label>
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
                  Спосіб отримання
                  <span className="relative block">
                    <select
                      className="min-h-12 w-full appearance-none rounded-xl border border-white/15 bg-ink px-4 pr-11 text-base font-normal text-paper transition focus:border-brand focus:outline-none"
                      name="method"
                      value={method}
                      onChange={(event) => setMethod((event.target as HTMLSelectElement).value as DeliveryMethod)}
                    >
                      <option value="Самовивіз">Самовивіз (вул. Київська, 36) — знижка −{pricing.onlineDiscountPercent}%</option>
                      <option value="Доставка">Кур’єрська доставка по Львову та передмістю</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                  </span>
                </label>
                {method === 'Доставка' && (
                  <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
                    Адреса доставки у Львові
                    <input className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-base font-normal text-paper transition focus:border-brand focus:outline-none" name="address" required autoComplete="street-address" placeholder="Вулиця, номер будинку, під’їзд, квартира" />
                  </label>
                )}
                <button className="min-h-12 rounded-xl bg-brand px-5 py-3 font-extrabold text-ink transition hover:brightness-110 disabled:opacity-60" type="submit" disabled={status.kind === 'pending'}>
                  {status.kind === 'pending' ? 'Створюємо рахунок…' : `Оформити та оплатити онлайн (${total} грн) →`}
                </button>
                <div className="flex items-center justify-center gap-2 text-center text-[11px] text-white/45">
                  <span>🔒 Безпечна оплата Paymock</span>
                  <span>·</span>
                  <span>Apple Pay / Google Pay / Картка</span>
                </div>
                {status.text && (
                  <p className={`mb-0 text-sm leading-6 ${status.kind === 'error' ? 'text-red-400' : 'text-brand'}`} role="status">{status.text}</p>
                )}
              </form>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
