# CHECK POINT

Багатосторінковий food-сайт на Astro 7 (SSR) + Cloudflare Workers + Cloudflare D1: чорний фон з контурними ілюстраціями, жовті кнопки, великі фотографії їжі, піца, бургери, салати та комбо.

Весь контент сайту (меню, категорії, відгуки, контакти, ціни, соцмережі, замовлення) зберігається в Cloudflare D1. Фотографії лежать у `public/images/`, а в БД зберігаються лише шляхи до них (наприклад `/images/pizza-bbq.webp`).

## Запуск локально

1. `npm install`
2. Створи D1 локально та застосуй міграції (схема + сід-дані):
   `npm run db:migrate:local`
3. Для локальної оплати скопіюй `.dev.vars.example` → `.dev.vars` і встав свій `PAYMOCK_TOKEN`.
4. `npm run dev` — dev-сервер працює на workerd з біндінгом `DB` (локальний стан у `.wrangler/state`).

## Схема D1 (`migrations/`)

- `0001_schema.sql` — таблиці:
  - `categories` — категорії меню (назва, іконка, шлях до обкладинки, порядок)
  - `dishes` — страви (slug, ціна, вага, **image_path**, опис, склад, алергени, `is_popular`, `is_available`)
  - `reviews` — відгуки (публікація, `is_featured` для головної, рейтинг, **image_path**)
  - `settings` — key-value з JSON: `contacts`, `pricing`, `socials`
  - `orders` — замовлення з оплати (інвойс, статус, клієнт, позиції, сума)
- `0002_seed.sql` — початковий контент сайту.

Зміни структури — лише новою міграцією в `migrations/`, далі `npm run db:migrate:local` / `npm run db:migrate:remote`.

Редагування контенту — SQL до D1 (наприклад через `wrangler d1 execute` або Cloudflare dashboard). Ціна/наявність страви змінюється в БД і сайт одразу показує нові дані без передеплою.

## Серверні API

- `POST /api/orders` — валідує кошик, перераховує суму за цінами з D1, створює інвойс у Paymock (токен лише на сервері) і зберігає замовлення в D1.
- `GET /api/orders/status?invoiceId=...` — перевіряє статус інвойсу в Paymock і оновлює статус замовлення в D1.

## Збірка

`npm run build` — результат у `dist/` (worker + статичні ассети).

`npm run preview` — превʼю на workerd з локальною D1.

## Деплой на Cloudflare Workers

1. Створи D1: `npx wrangler d1 create checkpoint-db` і встав `database_id` у `wrangler.toml`.
2. Застосуй міграції на проді: `npm run db:migrate:remote`.
3. Вистав секрет: `npx wrangler secret put PAYMOCK_TOKEN`.
4. Деплой: `npx wrangler deploy` (або через CI: build + deploy).

`wrangler.toml` містить біндінги: `DB` (D1), `ASSETS` (статика з `dist/`). Шлях `main` вказує на уніфікований entrypoint адаптера `@astrojs/cloudflare/entrypoints/server`.

## Оплата (Paymock)

Проєкт Paymock: CHECK POINT. Кошик створює замовлення через `/api/orders`, далі користувач потрапляє на сторінку оплати Paymock. На сторінці оплати доступні дії платіжника (успіх / відмова / прострочення) — статус інвойсу підхоплюється на `/payment/` і фіксується в D1.
