import { Request, Response } from 'express';
import { ApiResponse } from '../types/index';
import { prisma } from '../lib/prisma';

const XP_PER_LEVEL = 500;

interface BadgeDef {
  id: string;
  title: string;
  getProgress: (ctx: { streak: number; totalRelapses: number }) => number;
}

const BADGE_DEFS: BadgeDef[] = [
  { id: '1', title: 'First 7 Days', getProgress: (ctx) => Math.min(1, ctx.streak / 7) },
  { id: '2', title: 'Craving Fighter', getProgress: (ctx) => (ctx.streak >= 1 ? 1 : 0) },
  { id: '3', title: '30 Days Strong', getProgress: (ctx) => Math.min(1, ctx.streak / 30) },
];

function getLevelAndXp(totalXp: number): { level: number; xp: number; xpToNextLevel: number } {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  return { level, xp: xpInLevel, xpToNextLevel: XP_PER_LEVEL };
}

function deriveRiskScore(streakDays: number, totalRelapses: number, lastRelapseDate: Date | null): number {
  let score = Math.max(0, 100 - streakDays * 4);
  if (lastRelapseDate) {
    const daysSince = (Date.now() - lastRelapseDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 2) score = Math.min(100, score + 35);
    else if (daysSince < 7) score = Math.min(100, score + 15);
  }
  return Math.round(Math.min(100, Math.max(0, score)));
}

export interface ProfileResponse {
  displayName: string;
  username: string;
  streakDays: number;
  totalCleanDays: number;
  relapseCount: number;
  riskScore: number;
  xpPoints: number;
  level: number;
  xpToNextLevel: number;
  achievements: Array<{ id: string; title: string; unlocked: boolean }>;
  moodStats: { calm: number; anxious: number; motivated: number; low: number };
}

export class ProfileController {
  static async getProfile(
    req: Request<{ userId: string }>,
    res: Response<ApiResponse<ProfileResponse>>
  ) {
    try {
      const { userId } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true },
      });
      const onboarding = await prisma.onboarding.findUnique({ where: { userId } });
      if (!user || !onboarding) {
        return res.status(404).json({ success: false, error: 'User or onboarding not found' });
      }
      const relapses = await prisma.relapse.findMany({
        where: { userId },
        orderBy: { relapseDate: 'desc' },
      });
      const lastRelapse = relapses[0] || null;
      const journeyStartDate = onboarding.journeyStartDate || onboarding.completedAt;
      if (!journeyStartDate) {
        return res.status(400).json({
          success: false,
          error: 'Journey not started yet',
        });
      }
      const now = new Date();
      const lastResetDate = lastRelapse ? lastRelapse.relapseDate : journeyStartDate;
      const daysSinceLastReset = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24);
      const streakDays = Math.floor(daysSinceLastReset);
      const totalDaysSinceStart = (now.getTime() - journeyStartDate.getTime()) / (1000 * 60 * 60 * 24);
      const totalCleanDays = Math.max(0, Math.floor(totalDaysSinceStart) - relapses.length);
      const relapseCount = relapses.length;
      const riskScore = deriveRiskScore(streakDays, relapseCount, lastRelapse?.relapseDate ?? null);
      const totalXp = streakDays * 100 + Math.floor(totalDaysSinceStart) * 5;
      const xpPoints = totalXp;
      const { level, xpToNextLevel } = getLevelAndXp(totalXp);
      const badgeCtx = { streak: streakDays, totalRelapses: relapseCount };
      const achievements = BADGE_DEFS.map((b) => ({
        id: b.id,
        title: b.title,
        unlocked: b.getProgress(badgeCtx) >= 1,
      }));
      const moodStats = {
        calm: 40,
        anxious: 20,
        motivated: 35,
        low: 5,
      };
      const displayName = (user.displayName && user.displayName.trim()) || 'User';
      const data: ProfileResponse = {
        displayName,
        username: displayName,
        streakDays,
        totalCleanDays,
        relapseCount,
        riskScore,
        xpPoints,
        level,
        xpToNextLevel,
        achievements,
        moodStats,
      };
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
      });
    }
  }
}
