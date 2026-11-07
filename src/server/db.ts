import { env } from 'cloudflare:workers';
import type { Dish, MenuCategory } from '@/features/catalog/types/menu.types';
import type { Review } from '@/features/reviews/types/reviews.types';
import type { Contacts, PricingRules, SiteSettings, SocialItem } from '@/shared/types/site';

interface DishRow {
  slug: string;
  name: string;
  price: number;
  portion: string;
  weight: string;
  image_path: string;
  tag: string;
  description: string;
  ingredients: string;
  allergens: string;
  category: string;
}

interface CategoryRow {
  name: string;
  icon: string;
  image_path: string;
}

interface ReviewRow {
  name: string;
  initial: string;
  category: Review['category'];
  category_label: string;
  role: string;
  text: string;
  image_path: string;
  image_alt: string;
  rating: number;
}

function mapDish(row: DishRow): Dish {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    portion: row.portion,
    weight: row.weight,
    imagePath: row.image_path,
    tag: row.tag,
    description: row.description,
    ingredients: row.ingredients,
    allergens: row.allergens,
  };
}

function mapReview(row: ReviewRow): Review {
  return {
    name: row.name,
    initial: row.initial,
    category: row.category,
    categoryLabel: row.category_label,
    role: row.role,
    text: row.text,
    imagePath: row.image_path,
    imageAlt: row.image_alt,
    rating: row.rating,
  };
}

const DISH_SELECT = `
  SELECT d.slug, d.name, d.price, d.portion, d.weight, d.image_path, d.tag,
         d.description, d.ingredients, d.allergens, c.name AS category
  FROM dishes d
  JOIN categories c ON c.id = d.category_id
  WHERE d.is_available = 1
`;

export async function getCategories(): Promise<MenuCategory[]> {
  const { results } = await env.DB
    .prepare('SELECT name, icon, image_path FROM categories ORDER BY sort_order, id')
    .all<CategoryRow>();
  return results.map((row) => ({ name: row.name, icon: row.icon, imagePath: row.image_path }));
}

export async function getDishes(): Promise<Dish[]> {
  const { results } = await env.DB.prepare(`${DISH_SELECT} ORDER BY d.sort_order, d.id`).all<DishRow>();
  return results.map(mapDish);
}

export async function getDishBySlug(slug: string): Promise<Dish | undefined> {
  const row = await env.DB.prepare(`${DISH_SELECT} AND d.slug = ? LIMIT 1`).bind(slug).first<DishRow>();
  return row ? mapDish(row) : undefined;
}

export async function getRelatedDishes(category: string, excludeSlug: string, limit = 4): Promise<Dish[]> {
  const { results } = await env.DB
    .prepare(`${DISH_SELECT} AND c.name = ? AND d.slug != ? ORDER BY d.sort_order, d.id LIMIT ?`)
    .bind(category, excludeSlug, limit)
    .all<DishRow>();
  return results.map(mapDish);
}

export async function getPopularDishes(): Promise<Dish[]> {
  const { results } = await env.DB
    .prepare(`${DISH_SELECT} AND d.is_popular = 1 ORDER BY d.sort_order, d.id`)
    .all<DishRow>();
  return results.map(mapDish);
}

export async function getDishesBySlugs(slugs: string[]): Promise<Dish[]> {
  if (slugs.length === 0) return [];
  const placeholders = slugs.map(() => '?').join(', ');
  const { results } = await env.DB
    .prepare(`${DISH_SELECT} AND d.slug IN (${placeholders})`)
    .bind(...slugs)
    .all<DishRow>();
  return results.map(mapDish);
}

export async function getPublishedReviews(): Promise<Review[]> {
  const { results } = await env.DB
    .prepare('SELECT name, initial, category, category_label, role, text, image_path, image_alt, rating FROM reviews WHERE is_published = 1 ORDER BY sort_order, id')
    .all<ReviewRow>();
  return results.map(mapReview);
}

export async function getFeaturedReviews(): Promise<Review[]> {
  const { results } = await env.DB
    .prepare('SELECT name, initial, category, category_label, role, text, image_path, image_alt, rating FROM reviews WHERE is_featured = 1 AND is_published = 1 ORDER BY sort_order, id')
    .all<ReviewRow>();
  return results.map(mapReview);
}

async function getSetting<T>(key: string): Promise<T> {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
  if (!row) {
    throw new Error(`Setting "${key}" is missing in D1 (run migrations and seed)`);
  }
  return JSON.parse(row.value) as T;
}

export async function getPricing(): Promise<PricingRules> {
  return getSetting<PricingRules>('pricing');
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const [contacts, pricing, socials] = await Promise.all([
    getSetting<Omit<Contacts, 'phoneTel'>>('contacts'),
    getSetting<PricingRules>('pricing'),
    getSetting<SocialItem[]>('socials'),
  ]);
  return {
    contacts: { ...contacts, phoneTel: `tel:${contacts.phoneRaw}` },
    pricing,
    socials,
  };
}

export interface OrderInput {
  invoiceId: string;
  reference: string;
  name: string;
  phone: string;
  method: string;
  address?: string;
  items: Array<{ slug: string; name: string; qty: number; sum: number }>;
  total: number;
}

export async function createOrder(input: OrderInput): Promise<void> {
  const now = Date.now();
  await env.DB
    .prepare(
      `INSERT INTO orders (invoice_id, reference, status, customer_name, customer_phone, delivery_method, delivery_address, items_json, total, created_at, updated_at)
       VALUES (?, ?, 'created', ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.invoiceId,
      input.reference,
      input.name,
      input.phone,
      input.method,
      input.address ?? null,
      JSON.stringify(input.items),
      input.total,
      now,
      now
    )
    .run();
}

export async function updateOrderStatus(invoiceId: string, status: string): Promise<void> {
  await env.DB
    .prepare('UPDATE orders SET status = ?, updated_at = ? WHERE invoice_id = ?')
    .bind(status, Date.now(), invoiceId)
    .run();
}
