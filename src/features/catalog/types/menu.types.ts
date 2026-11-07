export interface Dish {
  slug: string;
  name: string;
  category: string;
  price: number;
  portion: string;
  weight: string;
  /** Path to the photo stored in /public/images, e.g. "/images/pizza-bbq.webp". */
  imagePath: string;
  tag: string;
  description: string;
  ingredients: string;
  allergens: string;
}

export interface MenuCategory {
  name: string;
  icon: string;
  /** Path to the category cover photo stored in /public/images. */
  imagePath: string;
}

/** Minimal dish data hydratable into client components (cart). */
export interface CartDish {
  slug: string;
  name: string;
  price: number;
  imagePath: string;
}
