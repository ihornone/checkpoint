import type { CSSProperties } from 'react';
import type { Dish } from '@/features/catalog/types/menu.types';
import { getSpriteCoordinates } from '@/shared/utils/sprite';

interface CartItemPhotoProps {
  dish: Dish;
  className?: string;
}

export function CartItemPhoto({ dish, className = 'size-16 shrink-0 rounded-xl' }: CartItemPhotoProps) {
  if (dish.sprite !== undefined && dish.sprite >= 0) {
    const coords = getSpriteCoordinates(dish.sprite);
    return (
      <span
        className={`food-sprite object-cover ${className}`}
        role="img"
        aria-label={dish.name}
        style={
          {
            '--sprite-x': coords.x,
            '--sprite-y': coords.y,
          } as CSSProperties
        }
      />
    );
  }

  return (
    <img
      className={`${className} object-cover`}
      src={`/images/${dish.image}.webp`}
      alt={dish.name}
      width="64"
      height="64"
      loading="lazy"
    />
  );
}
