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
  role?: 'patient' | 'companion';
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
  static async createUser(displayName: string, age?: number, role?: 'patient' | 'companion') {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName, age, role }),
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

export type BadgeCategory = 'consistency' | 'resilience' | 'self-control' | 'growth';

export interface RewardsBadgeResponse {
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

export interface RewardsRewardItemResponse {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  cost: number;
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
  badges: RewardsBadgeResponse[];
  rewards: RewardsRewardItemResponse[];
  weeklyGrowth: {
    improvementPercent: number;
    message: string;
  };
}

export class RewardsApi {
  static async getRewards(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/rewards`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse<RewardsResponse> = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch rewards');
      }
      return data.data!;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  }
}

export type AssistantRiskLevel = 'calm' | 'high_risk' | 'achievement';
export type GreetingHint = 'default' | 'proactive' | 'congratulatory';

export interface AssistantContextResponse {
  displayName: string;
  streak: number;
  riskLevel: AssistantRiskLevel;
  greetingHint: GreetingHint;
}

export interface ChatHistoryItem {
  id: string;
  message: string;
  reply: string;
  createdAt: string;
}

export interface SendChatResponse {
  id: string;
  userId: string;
  message: string;
  reply: string;
  createdAt: string;
}

export type CompanionPermission = 'view_streak' | 'relapse_alerts' | 'emergency_contact' | 'weekly_summary';

export interface CompanionResponse {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  permissions: CompanionPermission[];
  createdAt: string;
}

export interface AddCompanionPayload {
  name: string;
  phone: string;
  countryCode: string;
  permissions: CompanionPermission[];
}

export class CompanionApi {
  static async get(userId: string): Promise<CompanionResponse | null> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/companion`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<CompanionResponse> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to get companion');
    return data.data ?? null;
  }

  static async add(userId: string, payload: AddCompanionPayload): Promise<CompanionResponse> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/companion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<CompanionResponse> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to add companion');
    return data.data!;
  }

  static async remove(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/companion`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<{ message: string }> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to remove companion');
  }

  static async getPatientDashboard(patientId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/companion/patient/${patientId}/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<any> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to get patient dashboard');
    return data.data!;
  }
}

export interface RiskZoneItem {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
}

export class LocationShieldApi {
  static async getZones(userId: string): Promise<RiskZoneItem[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/location-shield/zones`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<RiskZoneItem[]> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to get risk zones');
    return data.data!;
  }

  static async saveZones(userId: string, zones: Omit<RiskZoneItem, 'id'>[]): Promise<RiskZoneItem[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/location-shield/zones`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zones: zones.map((z) => ({
          latitude: z.latitude,
          longitude: z.longitude,
          radius: z.radius,
          name: z.name,
        })),
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<RiskZoneItem[]> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to save risk zones');
    return data.data!;
  }
}

export class AssistantApi {
  static async getContext(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/assistant/context`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<AssistantContextResponse> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to get assistant context');
    return data.data!;
  }

  static async getChatHistory(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/chat/history`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<ChatHistoryItem[]> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to get chat history');
    return data.data!;
  }

  static async sendMessage(userId: string, message: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: ApiResponse<SendChatResponse> = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to send message');
    return data.data!;
  }
}

export interface AIRecommendations {
  nicotineReplacement?: boolean;
  behavioralTips: string[];
  triggerStrategies: string[];
  exerciseTips: string[];
}

export interface RecoveryPlanResponse {
  id: string;
  planSummary: string;
  addictionSeverity: string;
  relapseRisk: string;
  futureDailyLimits: number[];
  recoveryDurationDays: number;
  currentDayIndex: number;
  todayLimit: number;
  aiRecommendations: AIRecommendations;
  startedAt?: string;
  createdAt: string;
}

export interface GeneratePlanPayload {
  dailyConsumption: number;
  yearsOfAddiction: number;
  ftndAnswers?: Record<number, number>;
  triggers: string[];
}

export interface UpdatePlanPayload {
  recentUsage: number[];
  recentAllowedLimits: number[];
}

export class PlanApi {
  /**
   * Generate initial recovery plan
   */
  static async generatePlan(userId: string, payload: GeneratePlanPayload): Promise<RecoveryPlanResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/plan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<RecoveryPlanResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      return data.data!;
    } catch (error) {
      console.error('Error generating plan:', error);
      throw error;
    }
  }

  /**
   * Get user's current recovery plan
   */
  static async getPlan(userId: string): Promise<RecoveryPlanResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/plan`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<RecoveryPlanResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch plan');
      }

      return data.data!;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  /**
   * Update recovery plan based on progress
   */
  static async updatePlan(userId: string, payload: UpdatePlanPayload): Promise<RecoveryPlanResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/plan/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<RecoveryPlanResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update plan');
      }

      return data.data!;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  /**
   * Advance to next day in the plan
   */
  static async advanceDay(userId: string): Promise<{ currentDayIndex: number; todayLimit: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/plan/advance-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<{ currentDayIndex: number; todayLimit: number }> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to advance day');
      }

      return data.data!;
    } catch (error) {
      console.error('Error advancing day:', error);
      throw error;
    }
  }
}

