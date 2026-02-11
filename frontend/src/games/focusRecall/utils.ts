import type { TileItem } from './types';
import { TILE_SYMBOL_KEYS } from './constants';

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildTiles(pairCount: number): TileItem[] {
  const keys = TILE_SYMBOL_KEYS.slice(0, pairCount);
  const symbols = [...keys, ...keys];
  const shuffled = shuffle(symbols);
  return shuffled.map((symbolKey, index) => ({
    id: `tile-${index}`,
    symbolKey,
    isFlipped: true,
    isMatched: false,
  }));
}

export function flipTilesFaceDown(tiles: TileItem[]): TileItem[] {
  return tiles.map((t) => ({ ...t, isFlipped: false }));
}
