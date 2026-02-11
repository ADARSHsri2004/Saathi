export type CravingLevel = 'Low' | 'Medium' | 'High';

export type GamePhase = 'pregame' | 'preview' | 'matching' | 'complete';

export type GridSize = { rows: number; cols: number };

export interface TileItem {
  id: string;
  symbolKey: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameConfig {
  cravingLevel: CravingLevel;
  previewSeconds: number;
  gridSize: GridSize;
  pairCount: number;
}

export interface FocusRecallAnalytics {
  cravingBefore: CravingLevel;
  cravingAfter: CravingLevel;
  timeToCompletionMs: number;
  mistakeCount: number;
  totalPairs: number;
  reactionSpeedMs: number | null;
  sessionTimestamp: string;
  accuracyPercent: number;
  score: number;
}

export type OnGameComplete = (data: FocusRecallAnalytics) => void;
