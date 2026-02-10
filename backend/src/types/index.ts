// Types matching the frontend OnboardingContext

export type AddictionType =
  | 'social_media'
  | 'gaming'
  | 'porn'
  | 'alcohol'
  | 'smoking'
  | 'shopping'
  | 'other';

export type WhenItHappens =
  | 'stressed'
  | 'bored'
  | 'late_night'
  | 'after_bad_day'
  | 'habit_autopilot'
  | 'not_sure';

export type FeelAfter =
  | 'guilty'
  | 'empty'
  | 'relaxed'
  | 'numb'
  | 'regretful'
  | 'no_strong_feeling';

export type Frequency =
  | 'once_in_a_while'
  | 'few_times_week'
  | 'almost_every_day'
  | 'multiple_times_day'
  | 'not_sure';

export type ImpactArea =
  | 'sleep'
  | 'focus'
  | 'mood'
  | 'relationships'
  | 'health'
  | 'money'
  | 'not_really'
  | 'not_sure';

export type Intention = 'reduce' | 'pause' | 'just_understand';

export type Duration = '7_days' | '14_days' | '30_days' | 'not_sure';

// Request/Response types
export interface CreateUserRequest {
  displayName: string;
  age?: number;
}

export interface CreateUserResponse {
  id: string;
  displayName: string;
  age?: number;
  createdAt: string;
}

export interface OnboardingData {
  userId: string;
  addictionTypes: AddictionType[];
  whenItHappens: WhenItHappens[];
  feelAfter?: FeelAfter;
  frequency?: Frequency;
  moneySpent?: string;
  impactAreas: ImpactArea[];
  intention?: Intention;
  duration?: Duration;
}

export interface UpdateOnboardingRequest {
  addictionTypes?: AddictionType[];
  whenItHappens?: WhenItHappens[];
  feelAfter?: FeelAfter | null;
  frequency?: Frequency | null;
  frequencyQuantity?: number;
  frequencyUnit?: 'per_week' | 'per_day';
  moneySpent?: string;
  moneySpentUnit?: 'per_week' | 'per_day';
  impactAreas?: ImpactArea[];
  intention?: Intention | null;
  duration?: Duration | null;
}

export interface OnboardingResponse {
  id: string;
  userId: string;
  addictionTypes: AddictionType[];
  whenItHappens: WhenItHappens[];
  feelAfter?: FeelAfter;
  frequency?: Frequency;
  frequencyQuantity?: number;
  frequencyUnit?: 'per_week' | 'per_day';
  moneySpent?: string;
  moneySpentPerDay?: number;
  impactAreas: ImpactArea[];
  intention?: Intention;
  duration?: Duration;
  journeyStartDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
