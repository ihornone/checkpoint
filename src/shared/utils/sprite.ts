export interface SpriteCoordinates {
  x: string;
  y: string;
}

export const SPRITE_COLUMNS = 4;
export const SPRITE_ROWS = 3;

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
