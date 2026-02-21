import { Request, Response } from 'express';
import { ApiResponse } from '../types/index';
import axios from 'axios';
import { prisma } from '../lib/prisma';

// URL of the Personalised_plan_model API
const PLAN_API_URL = process.env.PLAN_API_URL || 'http://localhost:8000';

interface PlanGenerationInput {
  addiction_type: string;
  daily_consumption: number;
  years_of_addiction: number;
  ftnd_score?: number;
  dependence_level?: string;
  triggers: string[];
  age?: number;
}

interface AIRecommendations {
  nicotine_replacement?: boolean;
  behavioral_tips: string[];
  trigger_strategies: string[];
  exercise_tips: string[];
}

interface RecoveryPlanOutput {
  plan_summary: string;
  addiction_severity: string;
  relapse_risk: string;
  future_daily_limits: number[];
  recovery_duration_days: number;
  ai_recommendations: AIRecommendations;
}

interface PlanUpdateInput {
  user_profile: PlanGenerationInput;
  previous_plan: RecoveryPlanOutput;
  recent_usage: number[];
  recent_allowed_limits: number[];
  current_day_index: number;
}

export class PlanController {
  /**
   * Calculate FTND score from assessment answers
   */
  private static calculateFTNDScore(ftndAnswers: Record<number, number>): number {
    let score = 0;
    // Sum up all the answers (each question has points 0-3 or 0-1)
    for (const value of Object.values(ftndAnswers)) {
      score += value;
    }
    return score;
  }

  /**
   * Determine dependence level from FTND score
   */
  private static getDependenceLevel(ftndScore: number): string {
    if (ftndScore <= 2) return 'low';
    if (ftndScore <= 4) return 'low-moderate';
    if (ftndScore <= 6) return 'moderate';
    if (ftndScore <= 7) return 'moderate-high';
    return 'high';
  }

  /**
   * Generate initial recovery plan
   */
  static async generatePlan(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const {
        dailyConsumption,
        yearsOfAddiction,
        ftndAnswers,
        triggers,
      } = req.body;

      // Validate required fields
      if (!dailyConsumption || !yearsOfAddiction) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: dailyConsumption, yearsOfAddiction',
        } as ApiResponse<null>);
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { onboarding: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse<null>);
      }

      // Calculate FTND score
      const ftndScore = ftndAnswers ? PlanController.calculateFTNDScore(ftndAnswers) : undefined;
      const dependenceLevel = ftndScore !== undefined ? PlanController.getDependenceLevel(ftndScore) : undefined;

      // Prepare input for plan generation API
      const planInput: PlanGenerationInput = {
        addiction_type: 'cigarette',
        daily_consumption: dailyConsumption,
        years_of_addiction: yearsOfAddiction,
        ftnd_score: ftndScore,
        dependence_level: dependenceLevel,
        triggers: triggers || [],
        age: user.age || undefined,
      };

      // Call the plan generation API
      const response = await axios.post<RecoveryPlanOutput>(
        `${PLAN_API_URL}/generate-plan`,
        planInput,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 180000, // 60 second timeout
        }
      );

      const planOutput = response.data;

      // Store or update the plan in the database
      const recoveryPlan = await prisma.recoveryPlan.upsert({
        where: { userId },
        create: {
          userId,
          addictionType: planInput.addiction_type,
          dailyConsumption: planInput.daily_consumption,
          yearsOfAddiction: planInput.years_of_addiction,
          ftndScore: planInput.ftnd_score || null,
          dependenceLevel: planInput.dependence_level || null,
          triggers: planInput.triggers,
          planSummary: planOutput.plan_summary,
          addictionSeverity: planOutput.addiction_severity,
          relapseRisk: planOutput.relapse_risk,
          futureDailyLimits: planOutput.future_daily_limits,
          recoveryDurationDays: planOutput.recovery_duration_days,
          nicotineReplacement: planOutput.ai_recommendations.nicotine_replacement || null,
          behavioralTips: planOutput.ai_recommendations.behavioral_tips,
          triggerStrategies: planOutput.ai_recommendations.trigger_strategies,
          exerciseTips: planOutput.ai_recommendations.exercise_tips,
          currentDayIndex: 0,
        },
        update: {
          addictionType: planInput.addiction_type,
          dailyConsumption: planInput.daily_consumption,
          yearsOfAddiction: planInput.years_of_addiction,
          ftndScore: planInput.ftnd_score || null,
          dependenceLevel: planInput.dependence_level || null,
          triggers: planInput.triggers,
          planSummary: planOutput.plan_summary,
          addictionSeverity: planOutput.addiction_severity,
          relapseRisk: planOutput.relapse_risk,
          futureDailyLimits: planOutput.future_daily_limits,
          recoveryDurationDays: planOutput.recovery_duration_days,
          nicotineReplacement: planOutput.ai_recommendations.nicotine_replacement || null,
          behavioralTips: planOutput.ai_recommendations.behavioral_tips,
          triggerStrategies: planOutput.ai_recommendations.trigger_strategies,
          exerciseTips: planOutput.ai_recommendations.exercise_tips,
          currentDayIndex: 0,
          startedAt: new Date(),
        },
      });

      return res.json({
        success: true,
        data: {
          id: recoveryPlan.id,
          planSummary: recoveryPlan.planSummary,
          addictionSeverity: recoveryPlan.addictionSeverity,
          relapseRisk: recoveryPlan.relapseRisk,
          futureDailyLimits: recoveryPlan.futureDailyLimits,
          recoveryDurationDays: recoveryPlan.recoveryDurationDays,
          currentDayIndex: recoveryPlan.currentDayIndex,
          todayLimit: recoveryPlan.futureDailyLimits[0] || 0,
          aiRecommendations: {
            nicotineReplacement: recoveryPlan.nicotineReplacement,
            behavioralTips: recoveryPlan.behavioralTips,
            triggerStrategies: recoveryPlan.triggerStrategies,
            exerciseTips: recoveryPlan.exerciseTips,
          },
          createdAt: recoveryPlan.createdAt,
        },
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error generating plan:', error);
      
      // Handle axios errors
      if (axios.isAxiosError(error)) {
        return res.status(500).json({
          success: false,
          error: `Failed to generate plan: ${error.response?.data?.detail || error.message}`,
        } as ApiResponse<null>);
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate recovery plan',
      } as ApiResponse<null>);
    }
  }

  /**
   * Get user's current recovery plan
   */
  static async getPlan(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const recoveryPlan = await prisma.recoveryPlan.findUnique({
        where: { userId },
      });

      if (!recoveryPlan) {
        return res.status(404).json({
          success: false,
          error: 'Recovery plan not found',
        } as ApiResponse<null>);
      }

      const currentLimit = recoveryPlan.futureDailyLimits[recoveryPlan.currentDayIndex] || 0;

      return res.json({
        success: true,
        data: {
          id: recoveryPlan.id,
          planSummary: recoveryPlan.planSummary,
          addictionSeverity: recoveryPlan.addictionSeverity,
          relapseRisk: recoveryPlan.relapseRisk,
          futureDailyLimits: recoveryPlan.futureDailyLimits,
          recoveryDurationDays: recoveryPlan.recoveryDurationDays,
          currentDayIndex: recoveryPlan.currentDayIndex,
          todayLimit: currentLimit,
          aiRecommendations: {
            nicotineReplacement: recoveryPlan.nicotineReplacement,
            behavioralTips: recoveryPlan.behavioralTips,
            triggerStrategies: recoveryPlan.triggerStrategies,
            exerciseTips: recoveryPlan.exerciseTips,
          },
          startedAt: recoveryPlan.startedAt,
          createdAt: recoveryPlan.createdAt,
        },
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error fetching plan:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch recovery plan',
      } as ApiResponse<null>);
    }
  }

  /**
   * Update recovery plan based on progress
   */
  static async updatePlan(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { recentUsage, recentAllowedLimits } = req.body;

      if (!recentUsage || !recentAllowedLimits) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: recentUsage, recentAllowedLimits',
        } as ApiResponse<null>);
      }

      // Fetch current plan
      const currentPlan = await prisma.recoveryPlan.findUnique({
        where: { userId },
      });

      if (!currentPlan) {
        return res.status(404).json({
          success: false,
          error: 'Recovery plan not found. Please generate a plan first.',
        } as ApiResponse<null>);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Prepare user profile
      const userProfile: PlanGenerationInput = {
        addiction_type: currentPlan.addictionType,
        daily_consumption: currentPlan.dailyConsumption,
        years_of_addiction: currentPlan.yearsOfAddiction,
        ftnd_score: currentPlan.ftndScore || undefined,
        dependence_level: currentPlan.dependenceLevel || undefined,
        triggers: currentPlan.triggers,
        age: user?.age || undefined,
      };

      // Prepare previous plan
      const previousPlan: RecoveryPlanOutput = {
        plan_summary: currentPlan.planSummary,
        addiction_severity: currentPlan.addictionSeverity,
        relapse_risk: currentPlan.relapseRisk,
        future_daily_limits: currentPlan.futureDailyLimits,
        recovery_duration_days: currentPlan.recoveryDurationDays,
        ai_recommendations: {
          nicotine_replacement: currentPlan.nicotineReplacement || undefined,
          behavioral_tips: currentPlan.behavioralTips,
          trigger_strategies: currentPlan.triggerStrategies,
          exercise_tips: currentPlan.exerciseTips,
        },
      };

      // Prepare update input
      const updateInput: PlanUpdateInput = {
        user_profile: userProfile,
        previous_plan: previousPlan,
        recent_usage: recentUsage,
        recent_allowed_limits: recentAllowedLimits,
        current_day_index: currentPlan.currentDayIndex,
      };

      // Call the plan update API
      const response = await axios.post<RecoveryPlanOutput>(
        `${PLAN_API_URL}/update-plan`,
        updateInput,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 180000,
        }
      );

      const updatedPlanOutput = response.data;

      // Update the plan in the database
      const updatedPlan = await prisma.recoveryPlan.update({
        where: { userId },
        data: {
          planSummary: updatedPlanOutput.plan_summary,
          addictionSeverity: updatedPlanOutput.addiction_severity,
          relapseRisk: updatedPlanOutput.relapse_risk,
          futureDailyLimits: updatedPlanOutput.future_daily_limits,
          recoveryDurationDays: updatedPlanOutput.recovery_duration_days,
          nicotineReplacement: updatedPlanOutput.ai_recommendations.nicotine_replacement || null,
          behavioralTips: updatedPlanOutput.ai_recommendations.behavioral_tips,
          triggerStrategies: updatedPlanOutput.ai_recommendations.trigger_strategies,
          exerciseTips: updatedPlanOutput.ai_recommendations.exercise_tips,
        },
      });

      return res.json({
        success: true,
        data: {
          id: updatedPlan.id,
          planSummary: updatedPlan.planSummary,
          addictionSeverity: updatedPlan.addictionSeverity,
          relapseRisk: updatedPlan.relapseRisk,
          futureDailyLimits: updatedPlan.futureDailyLimits,
          recoveryDurationDays: updatedPlan.recoveryDurationDays,
          currentDayIndex: updatedPlan.currentDayIndex,
          todayLimit: updatedPlan.futureDailyLimits[updatedPlan.currentDayIndex] || 0,
          aiRecommendations: {
            nicotineReplacement: updatedPlan.nicotineReplacement,
            behavioralTips: updatedPlan.behavioralTips,
            triggerStrategies: updatedPlan.triggerStrategies,
            exerciseTips: updatedPlan.exerciseTips,
          },
        },
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error updating plan:', error);

      if (axios.isAxiosError(error)) {
        return res.status(500).json({
          success: false,
          error: `Failed to update plan: ${error.response?.data?.detail || error.message}`,
        } as ApiResponse<null>);
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update recovery plan',
      } as ApiResponse<null>);
    }
  }

  /**
   * Advance to next day in the plan
   */
  static async advanceDay(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const recoveryPlan = await prisma.recoveryPlan.findUnique({
        where: { userId },
      });

      if (!recoveryPlan) {
        return res.status(404).json({
          success: false,
          error: 'Recovery plan not found',
        } as ApiResponse<null>);
      }

      const nextDayIndex = Math.min(
        recoveryPlan.currentDayIndex + 1,
        recoveryPlan.futureDailyLimits.length - 1
      );

      const updatedPlan = await prisma.recoveryPlan.update({
        where: { userId },
        data: { currentDayIndex: nextDayIndex },
      });

      return res.json({
        success: true,
        data: {
          currentDayIndex: updatedPlan.currentDayIndex,
          todayLimit: updatedPlan.futureDailyLimits[updatedPlan.currentDayIndex] || 0,
        },
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error advancing day:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to advance day',
      } as ApiResponse<null>);
    }
  }
}
