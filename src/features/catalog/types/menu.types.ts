export interface DishData {
  slug: string;
  name: string;
  category: string;
  price: number;
  portion: string;
  weight: string;
  image: string;
  tag: string;
  description: string;
  ingredients: string;
  allergens: string;
}

export interface Dish extends DishData {
  sprite: number;
}

export interface MenuCategory {
  name: string;
  icon: string;
}
