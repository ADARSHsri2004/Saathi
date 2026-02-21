import { Request, Response } from 'express';
import {
  CreateUserRequest,
  CreateUserResponse,
  UpdateOnboardingRequest,
  OnboardingResponse,
  ApiResponse,
} from '../types/index';
import { prisma } from '../lib/prisma';

export class OnboardingController {
  /**
   * Create a new user and initialize onboarding
   */
  static async createUser(
    req: Request<{}, {}, CreateUserRequest>,
    res: Response<ApiResponse<CreateUserResponse>>
  ) {
    try {
      const { displayName, age, role } = req.body as any;

      if (!displayName || displayName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Display name is required',
        });
      }

      const user = await prisma.user.create({
        data: {
          displayName,
          age: age ? parseInt(age.toString()) : null,
          role: role === 'companion' ? 'companion' : 'user',
        },
      });

      // Initialize onboarding record for this user
      await prisma.onboarding.create({
        data: {
          userId: user.id,
          addictionTypes: [],
          whenItHappens: [],
          impactAreas: [],
        },
      });

      return res.status(201).json({
        success: true,
        data: {
          id: user.id,
          displayName: user.displayName,
          age: user.age || undefined,
          createdAt: user.createdAt.toISOString(),
        },
        message: 'User created successfully',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user',
      });
    }
  }

  /**
   * Get user onboarding status
   */
  static async getUserOnboarding(
    req: Request<{ userId: string }>,
    res: Response<ApiResponse<OnboardingResponse>>
  ) {
    try {
      const { userId } = req.params;

      const onboarding = await prisma.onboarding.findUnique({
        where: { userId },
      });

      if (!onboarding) {
        return res.status(404).json({
          success: false,
          error: 'Onboarding not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: mapOnboardingResponse(onboarding),
      });
    } catch (error) {
      console.error('Error fetching onboarding:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch onboarding',
      });
    }
  }

  /**
   * Update onboarding data (can be called multiple times as user progresses)
   */
  static async updateOnboarding(
    req: Request<{ userId: string }, {}, UpdateOnboardingRequest>,
    res: Response<ApiResponse<OnboardingResponse>>
  ) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

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

      // Prepare update object
      const updatePayload: any = {};

      if (updateData.addictionTypes !== undefined) {
        updatePayload.addictionTypes = updateData.addictionTypes;
      }
      if (updateData.whenItHappens !== undefined) {
        updatePayload.whenItHappens = updateData.whenItHappens;
      }
      if (updateData.feelAfter !== undefined) {
        updatePayload.feelAfter = updateData.feelAfter;
      }
      if (updateData.frequency !== undefined) {
        updatePayload.frequency = updateData.frequency;
      }
      if (updateData.frequencyQuantity !== undefined) {
        updatePayload.frequencyQuantity = updateData.frequencyQuantity;
      }
      if (updateData.frequencyUnit !== undefined) {
        updatePayload.frequencyUnit = updateData.frequencyUnit;
      }
      if (updateData.moneySpent !== undefined) {
        updatePayload.moneySpent = updateData.moneySpent;
        
        // Calculate moneySpentPerDay
        const amount = parseFloat(updateData.moneySpent);
        if (!isNaN(amount)) {
          if (updateData.moneySpentUnit === 'per_day') {
            updatePayload.moneySpentPerDay = amount;
          } else if (updateData.moneySpentUnit === 'per_week') {
            updatePayload.moneySpentPerDay = amount / 7;
          }
        }
      }
      if (updateData.impactAreas !== undefined) {
        updatePayload.impactAreas = updateData.impactAreas;
      }
      if (updateData.intention !== undefined) {
        updatePayload.intention = updateData.intention;
      }
      if (updateData.duration !== undefined) {
        updatePayload.duration = updateData.duration;
      }

      const onboarding = await prisma.onboarding.update({
        where: { userId },
        data: updatePayload,
      });

      return res.status(200).json({
        success: true,
        data: mapOnboardingResponse(onboarding),
        message: 'Onboarding updated successfully',
      });
    } catch (error) {
      console.error('Error updating onboarding:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update onboarding',
      });
    }
  }

  /**
   * Complete onboarding - set completion timestamp and journey start date
   */
  static async completeOnboarding(
    req: Request<{ userId: string }>,
    res: Response<ApiResponse<OnboardingResponse>>
  ) {
    try {
      const { userId } = req.params;

      const now = new Date();
      const onboarding = await prisma.onboarding.update({
        where: { userId },
        data: {
          completedAt: now,
          journeyStartDate: now, // Start the journey when onboarding completes
        },
      });

      return res.status(200).json({
        success: true,
        data: mapOnboardingResponse(onboarding),
        message: 'Onboarding completed successfully',
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to complete onboarding',
      });
    }
  }

  /**
   * Health check endpoint
   */
  static async healthCheck(
    req: Request,
    res: Response<ApiResponse<{ status: string }>>
  ) {
    return res.status(200).json({
      success: true,
      data: { status: 'Server is running' },
    });
  }
}

/**
 * Helper function to map Prisma onboarding to API response
 */
function mapOnboardingResponse(onboarding: any): OnboardingResponse {
  return {
    id: onboarding.id,
    userId: onboarding.userId,
    addictionTypes: onboarding.addictionTypes,
    whenItHappens: onboarding.whenItHappens,
    feelAfter: onboarding.feelAfter || undefined,
    frequency: onboarding.frequency || undefined,
    frequencyQuantity: onboarding.frequencyQuantity || undefined,
    frequencyUnit: onboarding.frequencyUnit || undefined,
    moneySpent: onboarding.moneySpent || undefined,
    moneySpentPerDay: onboarding.moneySpentPerDay || undefined,
    impactAreas: onboarding.impactAreas,
    intention: onboarding.intention || undefined,
    duration: onboarding.duration || undefined,
    journeyStartDate: onboarding.journeyStartDate ? onboarding.journeyStartDate.toISOString() : undefined,
    completedAt: onboarding.completedAt ? onboarding.completedAt.toISOString() : undefined,
    createdAt: onboarding.createdAt.toISOString(),
    updatedAt: onboarding.updatedAt.toISOString(),
  };
}
