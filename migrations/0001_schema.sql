-- CHECK POINT site content schema for Cloudflare D1.
-- Photos live in /public/images; the database stores only their paths.

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    image_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL REFERENCES categories (id),
    name TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    portion TEXT NOT NULL,
    weight TEXT NOT NULL,
    image_path TEXT NOT NULL,
    tag TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    allergens TEXT NOT NULL,
    is_popular INTEGER NOT NULL DEFAULT 0,
    is_available INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_dishes_category ON dishes (category_id, sort_order);
CREATE INDEX idx_dishes_popular ON dishes (sort_order) WHERE is_popular = 1;

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    initial TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('food', 'delivery', 'place')),
    category_label TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL,
    image_path TEXT NOT NULL DEFAULT '',
    image_alt TEXT NOT NULL DEFAULT '',
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_published INTEGER NOT NULL DEFAULT 1,
    is_featured INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_reviews_published ON reviews (is_published, sort_order);
CREATE INDEX idx_reviews_featured ON reviews (sort_order) WHERE is_featured = 1;

-- Key-value store for site-wide content: contacts, pricing rules, social links.
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id TEXT UNIQUE,
    reference TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    delivery_address TEXT,
    items_json TEXT NOT NULL,
    total INTEGER NOT NULL CHECK (total >= 0),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX idx_orders_created ON orders (created_at);
