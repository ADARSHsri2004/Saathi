export type BadgeCategory = 'consistency' | 'resilience' | 'self-control' | 'growth';

export interface Badge {
  id: string;
  category: BadgeCategory;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  unlockCondition: string;
  motivationalLine: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  cost: number;
}
