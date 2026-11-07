import type { CSSProperties } from 'react';
import type { CartDish } from '@/features/catalog/types/menu.types';
import { getSpriteCoordinates, getSpriteIndex } from '@/shared/utils/sprite';

interface CartItemPhotoProps {
  dish: CartDish;
  className?: string;
}

export function CartItemPhoto({ dish, className = 'size-16 shrink-0 rounded-xl' }: CartItemPhotoProps) {
  const spriteIndex = getSpriteIndex(dish.slug);
  if (spriteIndex >= 0) {
    const coords = getSpriteCoordinates(spriteIndex);
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
      src={dish.imagePath}
      alt={dish.name}
      width="64"
      height="64"
      loading="lazy"
    />
  );
}
