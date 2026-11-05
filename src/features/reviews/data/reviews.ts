import type { ReviewItem } from '../types/reviews.types';

export const REVIEWS_DATA: ReviewItem[] = [
  {
    name: 'Андрій К.',
    initial: 'А',
    category: 'delivery',
    categoryLabel: 'Доставка',
    text: 'Найкращі бургери у місті! Соковиті, великі порції і швидка доставка.',
    image: '/images/home-combo.png',
    imageAlt: 'Бургер і картопля фрі',
  },
  {
    name: 'Марія С.',
    initial: 'М',
    category: 'food',
    categoryLabel: 'Їжа',
    text: 'Дуже смачна піца, завжди свіжа і гаряча. Замовляємо вже не перший раз!',
    image: '/images/home-pizza.png',
    imageAlt: 'Піца пепероні з тягучим сиром',
  },
  {
    name: 'Іван П.',
    initial: 'І',
    category: 'place',
    categoryLabel: 'Заклад',
    text: 'Зручний сервіс, приємні акції та завжди висока якість. Рекомендую!',
    image: '/images/about-interior.png',
    imageAlt: 'Інтер’єр CHECK POINT',
  },
];
