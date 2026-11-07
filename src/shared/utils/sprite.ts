export interface SpriteCoordinates {
  x: string;
  y: string;
}

export const SPRITE_COLUMNS = 4;
export const SPRITE_ROWS = 3;

/**
 * Slugs rendered as CSS sprite illustrations (food-atlas) instead of photos.
 * Kept in code: it maps to a compiled CSS sprite, not to photo files.
 */
export const SPRITE_DISH_IDS = [
  'pepperoni',
  'margherita',
  'hawaiian',
  'meat',
  'four-cheese',
  'bbq',
  'mushroom',
  'prosciutto',
  'chief-burger',
  'chicken-wrap',
  'cezar-krevetka',
  'fries',
] as const;

/** Returns the sprite sheet index for a dish slug, or -1 when the dish uses a photo. */
export function getSpriteIndex(slug: string): number {
  return (SPRITE_DISH_IDS as readonly string[]).indexOf(slug);
}

/**
 * Calculates CSS percentage offsets for 4x3 food-atlas sprite sheet
 */
export function getSpriteCoordinates(spriteIndex: number): SpriteCoordinates {
  if (spriteIndex < 0) {
    return { x: '0%', y: '0%' };
  }

  const row = Math.floor(spriteIndex / SPRITE_COLUMNS);
  const col = spriteIndex % SPRITE_COLUMNS;

  const x = `${(col * 100) / (SPRITE_COLUMNS - 1)}%`;
  const y = `${row === 2 ? 96 : row * 50}%`;

  return { x, y };
}
