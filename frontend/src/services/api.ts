import {
  AddictionType,
  WhenItHappens,
  FeelAfter,
  Frequency,
  FrequencyUnit,
  ImpactArea,
  Intention,
  Duration,
} from '../context/OnboardingContext';

export type MoneySpentUnit = 'per_week' | 'per_day';

// Change this to your backend URL
// const API_BASE_URL = 'https://saathi-f69t.onrender.com/api';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://saathi-f69t.onrender.com/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateUserResponse {
  id: string;
  displayName: string;
  age?: number;
  createdAt: string;
}

export interface OnboardingDataResponse {
  id: string;
  userId: string;
  addictionTypes: AddictionType[];
  whenItHappens: WhenItHappens[];
  feelAfter?: FeelAfter;
  frequency?: Frequency;
  moneySpent?: string;
  impactAreas: ImpactArea[];
  intention?: Intention;
  duration?: Duration;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Service for Onboarding
 */
export class OnboardingApi {
  /**
   * Create a new user
   */
  static async createUser(displayName: string, age?: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName, age }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<CreateUserResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      return data.data!;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get onboarding status for a user
   */
  static async getOnboarding(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/onboarding`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<OnboardingDataResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch onboarding');
      }

      return data.data!;
    } catch (error) {
      console.error('Error fetching onboarding:', error);
      throw error;
    }
  }

  /**
   * Update onboarding data
   */
  static async updateOnboarding(
    userId: string,
    updateData: {
      addictionTypes?: AddictionType[];
      whenItHappens?: WhenItHappens[];
      feelAfter?: FeelAfter | null;
      frequency?: Frequency | null;
      frequencyUnit?: FrequencyUnit | null;
      frequencyQuantity?: number | null;
      moneySpent?: string;
      moneySpentUnit?: MoneySpentUnit | null;
      impactAreas?: ImpactArea[];
      intention?: Intention | null;
      duration?: Duration | null;
    }
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<OnboardingDataResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update onboarding');
      }

      return data.data!;
    } catch (error) {
      console.error('Error updating onboarding:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding
   */
  static async completeOnboarding(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<OnboardingDataResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      return data.data!;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });

      const data: ApiResponse<{ status: string }> = await response.json();
      return data.success;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

/**
 * Dashboard API Response Types
 */
export interface TodayProgressResponse {
  percentage: number;
  timeElapsed: string;
  timeRemaining: string;
}

export interface RecoveryMetricsResponse {
  timeFreeHours: number;
  lifeRegainedMinutes: number;
  moneySaved: number;
  cigarettesNotConsumed: number;
}

export interface PastImpactResponse {
  totalLifeLostMinutes: number;
  totalMoneyWasted: number;
  totalConsumed: number;
}

export interface DashboardMetricsResponse {
  todayProgress: TodayProgressResponse;
  recoveryMetrics: RecoveryMetricsResponse;
  pastImpact: PastImpactResponse;
  journeyStartDate: string | null;
  lastRelapseDate: string | null;
  totalRelapses: number;
  currentStreakDays: number;
}

export interface FutureProjectionResponse {
  period: string;
  money: string;
  life: string;
}

/**
 * API Service for Dashboard
 */
export class DashboardApi {
  /**
   * Get dashboard metrics
   */
  static async getDashboardMetrics(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/dashboard/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<DashboardMetricsResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard metrics');
      }

      return data.data!;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get future projections
   */
  static async getFutureProjections(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/dashboard/projections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<FutureProjectionResponse[]> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch future projections');
      }

      return data.data!;
    } catch (error) {
      console.error('Error fetching future projections:', error);
      throw error;
    }
  }

  /**
   * Record a relapse
   */
  static async recordRelapse(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/dashboard/relapse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<{ message: string }> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to record relapse');
      }

      return data.data!;
    } catch (error) {
      console.error('Error recording relapse:', error);
      throw error;
    }
  }
}

