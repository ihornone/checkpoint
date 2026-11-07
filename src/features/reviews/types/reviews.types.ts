export type ReviewCategory = 'all' | 'food' | 'delivery' | 'place';

export interface Review {
  name: string;
  initial: string;
  category: Exclude<ReviewCategory, 'all'>;
  categoryLabel: string;
  /** Short role line shown on the homepage testimonial cards. */
  role: string;
  text: string;
  /** Path to the photo stored in /public/images, empty when the review has no photo. */
  imagePath: string;
  imageAlt: string;
  rating: number;
}
