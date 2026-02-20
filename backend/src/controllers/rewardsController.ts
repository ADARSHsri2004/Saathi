import { Request, Response } from 'express';
import { ApiResponse } from '../types/index';
import { prisma } from '../lib/prisma';

const XP_PER_LEVEL = 500;
const DEFAULT_SAVINGS_GOAL = 10000;
const DEFAULT_GOAL_REWARD = 'New Headphones';

type BadgeCategory = 'consistency' | 'resilience' | 'self-control' | 'growth';

interface BadgeDefinition {
  id: string;
  category: BadgeCategory;
  title: string;
  description: string;
  icon: string;
  unlockCondition: string;
  motivationalLine: string;
  getProgress: (ctx: { streak: number; totalRelapses: number }) => number;
}

interface RewardDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'consistency-7',
    category: 'consistency',
    title: 'Week Warrior',
    description: '7 days of consistent progress',
    icon: 'calendar-check',
    unlockCondition: 'Complete 7 consecutive days',
    motivationalLine: 'Consistency is your superpower',
    getProgress: (ctx) => Math.min(1, ctx.streak / 7),
  },
  {
    id: 'resilience-1',
    category: 'resilience',
    title: 'First Step',
    description: 'Overcame your first urge',
    icon: 'shield-check',
    unlockCondition: 'Resist your first strong urge',
    motivationalLine: 'Every journey begins with one step',
    getProgress: (ctx) => (ctx.streak >= 1 ? 1 : 0),
  },
  {
    id: 'self-control-30',
    category: 'self-control',
    title: 'Month Master',
    description: '30 days of self-control',
    icon: 'hand-okay',
    unlockCondition: 'Complete 30 days without relapse',
    motivationalLine: 'You are stronger than your urges',
    getProgress: (ctx) => Math.min(1, ctx.streak / 30),
  },
  {
    id: 'growth-100',
    category: 'growth',
    title: 'Century Champion',
    description: '100 days of growth',
    icon: 'trending-up',
    unlockCondition: 'Reach 100 days of recovery',
    motivationalLine: 'Growth happens one day at a time',
    getProgress: (ctx) => Math.min(1, ctx.streak / 100),
  },
];

const REWARD_DEFINITIONS: RewardDefinition[] = [
  { id: 'theme-dark', title: 'Dark Theme', description: 'Unlock premium dark mode', icon: 'moon', cost: 500 },
  { id: 'theme-nature', title: 'Nature Theme', description: 'Calming nature backgrounds', icon: 'leaf', cost: 1000 },
  { id: 'avatar-premium', title: 'Premium Avatar', description: 'Exclusive avatar frames', icon: 'account-star', cost: 2000 },
];

function getLevelAndXp(totalXp: number): { level: number; xp: number; xpToNextLevel: number } {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  return { level, xp: xpInLevel, xpToNextLevel: XP_PER_LEVEL };
}

function getIdentityTitle(level: number): string {
  if (level >= 8) return 'Champion';
  if (level >= 5) return 'Warrior';
  if (level >= 3) return 'Fighter';
  return 'Beginner';
}

function getCigarettesPerDay(frequencyQuantity: number | null, frequencyUnit: string | null): number {
  if (!frequencyQuantity) return 0;
  if (frequencyUnit === 'per_day') return frequencyQuantity;
  if (frequencyUnit === 'per_week') return frequencyQuantity / 7;
  return 0;
}

export interface RewardsResponse {
  streak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  identityTitle: string;
  moneySaved: {
    amount: number;
    goal: number;
    goalReward: string;
  };
  badges: Array<{
    id: string;
    category: BadgeCategory;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    unlockCondition: string;
    motivationalLine: string;
  }>;
  rewards: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    cost: number;
  }>;
  weeklyGrowth: {
    improvementPercent: number;
    message: string;
  };
}

export class RewardsController {
  static async getRewards(
    req: Request<{ userId: string }>,
    res: Response<ApiResponse<RewardsResponse>>
  ) {
    try {
      const { userId } = req.params;
      const onboarding = await prisma.onboarding.findUnique({ where: { userId } });
      if (!onboarding) {
        return res.status(404).json({ success: false, error: 'User onboarding data not found' });
      }
      const relapses = await prisma.relapse.findMany({
        where: { userId },
        orderBy: { relapseDate: 'desc' },
      });
      const lastRelapse = relapses[0] || null;
      const journeyStartDate = onboarding.journeyStartDate || onboarding.completedAt;
      if (!journeyStartDate) {
        return res.status(400).json({ success: false, error: 'Journey not started yet' });
      }
      const now = new Date();
      const moneyPerDay = onboarding.moneySpentPerDay || 0;
      const lastResetDate = lastRelapse ? lastRelapse.relapseDate : journeyStartDate;
      const hoursSinceLastReset = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60);
      const daysSinceLastReset = hoursSinceLastReset / 24;
      const streak = Math.floor(daysSinceLastReset);
      const totalDaysSinceStart = (now.getTime() - journeyStartDate.getTime()) / (1000 * 60 * 60 * 24);
      const cigarettesPerDay = getCigarettesPerDay(onboarding.frequencyQuantity, onboarding.frequencyUnit);
      const costPerUnit = cigarettesPerDay > 0 ? (moneyPerDay || 0) / cigarettesPerDay : 0;
      const totalMoneySaved = Math.max(
        0,
        (moneyPerDay || 0) * (totalDaysSinceStart + 1) - relapses.length * costPerUnit
      );
      const totalXp = streak * 100 + Math.floor(totalDaysSinceStart) * 5;
      const { level, xp, xpToNextLevel } = getLevelAndXp(totalXp);
      const identityTitle = getIdentityTitle(level);
      const badgeCtx = { streak, totalRelapses: relapses.length };
      const badges = BADGE_DEFINITIONS.map((b) => {
        const progress = Math.min(1, Math.max(0, b.getProgress(badgeCtx)));
        return {
          id: b.id,
          category: b.category,
          title: b.title,
          description: b.description,
          icon: b.icon,
          unlocked: progress >= 1,
          progress,
          unlockCondition: b.unlockCondition,
          motivationalLine: b.motivationalLine,
        };
      });
      const rewards = REWARD_DEFINITIONS.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        icon: r.icon,
        cost: r.cost,
        unlocked: totalXp >= r.cost,
      }));
      const weeklyGrowth = {
        improvementPercent: 0,
        message: "Keep going to see your weekly growth",
      };
      const data: RewardsResponse = {
        streak,
        level,
        xp,
        xpToNextLevel,
        identityTitle,
        moneySaved: {
          amount: Math.round(totalMoneySaved * 100) / 100,
          goal: DEFAULT_SAVINGS_GOAL,
          goalReward: DEFAULT_GOAL_REWARD,
        },
        badges,
        rewards,
        weeklyGrowth,
      };
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch rewards',
      });
    }
  }
}
