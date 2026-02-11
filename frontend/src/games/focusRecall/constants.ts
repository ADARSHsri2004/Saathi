import type { CravingLevel } from './types';

export const PREVIEW_SECONDS: Record<CravingLevel, number> = {
  High: 2,
  Medium: 3,
  Low: 4,
};

export const GRID_CONFIG: Record<CravingLevel, { rows: number; cols: number }> = {
  High: { rows: 4, cols: 4 },
  Medium: { rows: 3, cols: 4 },
  Low: { rows: 3, cols: 3 },
};

export const PAIR_COUNT: Record<CravingLevel, number> = {
  High: 8,
  Medium: 6,
  Low: 4,
};

export const TILE_SYMBOL_KEYS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export const MATCH_SCORE = 10;
export const MISMATCH_PENALTY = 0;
export const MATCH_BONUS_TIME_FACTOR = 2;
