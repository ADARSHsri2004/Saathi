import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types/index';

const prisma = new PrismaClient();

const LIFE_LOST_PER_CIGARETTE_MINUTES = 11;

export interface DashboardMetrics {
  // Today's progress (time-based: starts at 5 AM, fills over 24 hours)
  todayProgress: {
    percentage: number;
    timeElapsed: string; // e.g., "7h 40m"
    timeRemaining: string; // e.g., "16h 20m"
  };
  
  // Recovery metrics (since last reset/relapse)
  recoveryMetrics: {
    timeFreeHours: number; // Hours since last relapse
    lifeRegainedMinutes: number; // Life regained in minutes
    moneySaved: number; // Money saved since last relapse
    cigarettesNotConsumed: number; // Total cigarettes not consumed
  };
  
  // Past impact (total cumulative since journey started)
  pastImpact: {
    totalLifeLostMinutes: number; // Total life regained
    totalMoneyWasted: number; // Total money saved
    totalConsumed: number; // Total cigarettes not consumed
  };
  
  // Journey info
  journeyStartDate: string | null;
  lastRelapseDate: string | null;
  totalRelapses: number;
  currentStreakDays: number;
}

export interface FutureProjection {
  period: string;
  money: string;
  life: string;
}

export class DashboardController {
  /**
   * Get today's progress (time-based, starts at 5 AM)
   */
  private static getTodayProgress() {
    const now = new Date();
    const today5AM = new Date(now);
    today5AM.setHours(5, 0, 0, 0);
    
    // If current time is before 5 AM, we're still in yesterday's cycle
    if (now.getHours() < 5) {
      today5AM.setDate(today5AM.getDate() - 1);
    }
    
    const next5AM = new Date(today5AM);
    next5AM.setDate(next5AM.getDate() + 1);
    
    const totalDuration = next5AM.getTime() - today5AM.getTime(); // 24 hours in ms
    const elapsed = now.getTime() - today5AM.getTime();
    const remaining = next5AM.getTime() - now.getTime();
    
    const percentage = Math.min((elapsed / totalDuration) * 100, 100);
    
    return {
      percentage: Math.round(percentage),
      timeElapsed: DashboardController.formatDuration(elapsed),
      timeRemaining: DashboardController.formatDuration(remaining),
    };
  }
  
  /**
   * Format duration in milliseconds to readable format (e.g., "7h 40m")
   */
  private static formatDuration(ms: number): string {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  
  /**
   * Format time duration for life regained (handles days, months, years)
   */
  private static formatLifeDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    
    const hours = minutes / 60;
    if (hours < 24) {
      return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
    }
    
    const days = hours / 24;
    if (days < 30) {
      const remainingHours = Math.floor((days % 1) * 24);
      return `${Math.floor(days)}d ${remainingHours}h`;
    }
    
    const months = Math.floor(days / 30);
    const remainingDays = Math.floor(days % 30);
    if (months < 12) {
      return `${months}M ${remainingDays}d`;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years}Y ${remainingMonths}M`;
  }
  
  /**
   * Calculate cigarettes per day from onboarding data
   */
  private static getCigarettesPerDay(frequencyQuantity: number | null, frequencyUnit: string | null): number {
    if (!frequencyQuantity) return 0;
    
    if (frequencyUnit === 'per_day') {
      return frequencyQuantity;
    } else if (frequencyUnit === 'per_week') {
      return frequencyQuantity / 7;
    }
    
    return 0;
  }
  
  /**
   * Get dashboard metrics for a user
   */
  static async getDashboardMetrics(
    req: Request<{ userId: string }>,
    res: Response<ApiResponse<DashboardMetrics>>
  ) {
    try {
      const { userId } = req.params;
      
      // Get user onboarding data
      const onboarding = await prisma.onboarding.findUnique({
        where: { userId },
      });
      
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          error: 'User onboarding data not found',
        });
      }
      
      // Get all relapses
      const relapses = await prisma.relapse.findMany({
        where: { userId },
        orderBy: { relapseDate: 'desc' },
      });
      
      const totalRelapses = relapses.length;
      const lastRelapse = relapses[0] || null;
      const journeyStartDate = onboarding.journeyStartDate || onboarding.completedAt;
      
      if (!journeyStartDate) {
        return res.status(400).json({
          success: false,
          error: 'Journey not started yet',
        });
      }
      
      const now = new Date();
      const cigarettesPerDay = DashboardController.getCigarettesPerDay(
        onboarding.frequencyQuantity,
        onboarding.frequencyUnit
      );
      const moneyPerDay = onboarding.moneySpentPerDay || 0;
      
      // Calculate time since last relapse (or journey start if no relapses)
      const lastResetDate = lastRelapse ? lastRelapse.relapseDate : journeyStartDate;
      const hoursSinceLastReset = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60);
      const totalhoursfree = (now.getTime() - journeyStartDate.getTime()) / (1000 * 60 * 60);
      const daysSinceLastReset = hoursSinceLastReset / 24;
      
      
      const costPerUnit = moneyPerDay/cigarettesPerDay;
      // Past impact (total since journey start)
      const totalDaysSinceStart = (now.getTime() - journeyStartDate.getTime()) / (1000 * 60 * 60 * 24);
      const totalPossibleCigarettes = cigarettesPerDay * (totalDaysSinceStart+1);
      const totalCigarettesSmoked = totalRelapses; // Simplified: each relapse = 1 cigarette
      const totalCigarettesNotConsumed = Math.max(0, totalPossibleCigarettes - totalCigarettesSmoked);
      const totalLifeRegainedMinutes = totalCigarettesNotConsumed * LIFE_LOST_PER_CIGARETTE_MINUTES;
      const totalLifeLostMinutes = totalCigarettesSmoked * LIFE_LOST_PER_CIGARETTE_MINUTES;
      const totalMoneyWasted = totalCigarettesSmoked*costPerUnit;
      const totalMoneySaved = moneyPerDay * (totalDaysSinceStart+1)-totalMoneyWasted;
 
      // Recovery metrics (since last reset)
      const cigarettesNotConsumedSinceReset = cigarettesPerDay * daysSinceLastReset;
      const lifeRegainedMinutes = totalCigarettesNotConsumed * LIFE_LOST_PER_CIGARETTE_MINUTES;
      const moneySavedSinceReset = moneyPerDay * daysSinceLastReset;

      // Current streak (days without relapse)
      const currentStreakDays = Math.floor(daysSinceLastReset);
      
      const metrics: DashboardMetrics = {
        todayProgress: DashboardController.getTodayProgress(),
        recoveryMetrics: {
          timeFreeHours: Math.round(totalhoursfree * 10) / 10,
          lifeRegainedMinutes: Math.round(lifeRegainedMinutes),
          moneySaved: Math.round(totalMoneySaved * 100) / 100,
          cigarettesNotConsumed: Math.round(totalCigarettesNotConsumed),
        },
        pastImpact: {
          totalLifeLostMinutes: Math.round(totalLifeLostMinutes),
          totalMoneyWasted: Math.round(totalMoneyWasted * 100) / 100,
          totalConsumed: Math.round(totalCigarettesSmoked),
        },
        journeyStartDate: journeyStartDate.toISOString(),
        lastRelapseDate: lastRelapse ? lastRelapse.relapseDate.toISOString() : null,
        totalRelapses,
        currentStreakDays,
      };
      
      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard metrics',
      });
    }
  }
  
  /**
   * Get future projections (what you'll get if you don't relapse)
   */
  static async getFutureProjections(
    req: Request<{ userId: string }>,
    res: Response<ApiResponse<FutureProjection[]>>
  ) {
    try {
      const { userId } = req.params;
      
      const onboarding = await prisma.onboarding.findUnique({
        where: { userId },
      });
      
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          error: 'User onboarding data not found',
        });
      }
      
      const cigarettesPerDay = DashboardController.getCigarettesPerDay(
        onboarding.frequencyQuantity,
        onboarding.frequencyUnit
      );
      const moneyPerDay = onboarding.moneySpentPerDay || 0;
      
      const periods = [
        { label: '1 Week', days: 7 },
        { label: '1 Month', days: 30 },
        { label: '1 Year', days: 365 },
        { label: '5 Years', days: 365 * 5 },
        { label: '10 Years', days: 365 * 10 },
        { label: '20 Years', days: 365 * 20 },
      ];
      
      const projections: FutureProjection[] = periods.map(period => {
        const cigarettesNotSmoked = cigarettesPerDay * period.days;
        const lifeRegainedMinutes = cigarettesNotSmoked * LIFE_LOST_PER_CIGARETTE_MINUTES;
        const moneySaved = moneyPerDay * period.days;
        
        return {
          period: period.label,
          money: `₹ ${Math.round(moneySaved).toLocaleString()}`,
          life: DashboardController.formatLifeDuration(lifeRegainedMinutes),
        };
      });
      
      return res.status(200).json({
        success: true,
        data: projections,
      });
    } catch (error) {
      console.error('Error fetching future projections:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch future projections',
      });
    }
  }
  
  /**
   * Record a relapse (reset button clicked)
   */
  static async recordRelapse(
    req: Request<{ userId: string }>,
    res: Response<ApiResponse<{ message: string }>>
  ) {
    try {
      const { userId } = req.params;
      
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
      
      // Create relapse record
      await prisma.relapse.create({
        data: {
          userId,
          relapseDate: new Date(),
        },
      });
      
      return res.status(201).json({
        success: true,
        data: { message: 'Relapse recorded successfully' },
      });
    } catch (error) {
      console.error('Error recording relapse:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to record relapse',
      });
    }
  }
}
