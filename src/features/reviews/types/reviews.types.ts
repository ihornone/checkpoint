export type ReviewCategory = 'all' | 'food' | 'delivery' | 'place';

export interface ReviewItem {
  name: string;
  initial: string;
  category: 'food' | 'delivery' | 'place';
  categoryLabel: string;
  text: string;
  image: string;
  imageAlt: string;
}
