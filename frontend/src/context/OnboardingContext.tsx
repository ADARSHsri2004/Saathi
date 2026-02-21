import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingApi } from '../services/api';

export type AddictionType =
  | 'alcohol'
  | 'smoking';

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

export type FrequencyUnit = 'per_week' | 'per_day';

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

export interface OnboardingState {
  userId: string;
  displayName: string;
  age: string;
  role: 'patient' | 'companion' | null;
  patientId: string;
  addictionTypes: AddictionType[];
  whenItHappens: WhenItHappens[];
  feelAfter: FeelAfter | null;
  frequency: Frequency | null;
  frequencyUnit: FrequencyUnit;
  frequencyQuantity: number;
  moneySpent: string;
  impactAreas: ImpactArea[];
  intention: Intention | null;
  duration: Duration | null;
}

const initialState: OnboardingState = {
  userId: '',
  displayName: '',
  age: '',
  role: null,
  patientId: '',
  addictionTypes: [],
  whenItHappens: [],
  feelAfter: null,
  frequency: null,
  frequencyUnit: 'per_week',
  frequencyQuantity: 1,
  moneySpent: '',
  impactAreas: [],
  intention: null,
  duration: null,
};

type OnboardingContextValue = {
  state: OnboardingState;
  isLoading: boolean;
  isHydrating: boolean;
  isOnboardingComplete: boolean;
  error: string | null;
  setDisplayName: (v: string) => void;
  setAge: (v: string) => void;
  setRole: (v: 'patient' | 'companion' | null) => void;
  setPatientId: (v: string) => void;
  setAddictionTypes: (v: AddictionType[] | ((prev: AddictionType[]) => AddictionType[])) => void;
  setWhenItHappens: (v: WhenItHappens[] | ((prev: WhenItHappens[]) => WhenItHappens[])) => void;
  setFeelAfter: (v: FeelAfter | null) => void;
  setFrequency: (v: Frequency | null) => void;
  setFrequencyUnit: (v: FrequencyUnit) => void;
  setFrequencyQuantity: (v: number) => void;
  setMoneySpent: (v: string) => void;
  setImpactAreas: (v: ImpactArea[] | ((prev: ImpactArea[]) => ImpactArea[])) => void;
  setIntention: (v: Intention | null) => void;
  setDuration: (v: Duration | null) => void;
  reset: () => void;
  createUser: (displayName: string, age?: number, role?: 'patient' | 'companion') => Promise<string>;
  saveToBackend: () => Promise<void>;
  completeOnboarding: (userId?: string) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const USER_ID_KEY = 'user_id';
const USER_ROLE_KEY = 'user_role';
const PATIENT_ID_KEY = 'patient_id';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        // Load onboarding complete status
        const stored = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setIsOnboardingComplete(stored === 'true');
        
        // Load userId from storage
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (storedUserId) {
          setState((s) => ({ ...s, userId: storedUserId }));
        }

        // Load user role from storage
        const storedRole = await AsyncStorage.getItem(USER_ROLE_KEY);
        if (storedRole && (storedRole === 'patient' || storedRole === 'companion')) {
          setState((s) => ({ ...s, role: storedRole as 'patient' | 'companion' }));
        }

        // Load patient ID from storage (for companions)
        const storedPatientId = await AsyncStorage.getItem(PATIENT_ID_KEY);
        if (storedPatientId) {
          setState((s) => ({ ...s, patientId: storedPatientId }));
        }
      } catch (err) {
        console.error('Failed to load onboarding status:', err);
      } finally {
        setIsHydrating(false);
      }
    };

    loadOnboardingStatus();
  }, []);

  const setDisplayName = useCallback((v: string) => {
    setState((s) => ({ ...s, displayName: v }));
  }, []);

  const setAge = useCallback((v: string) => {
    setState((s) => ({ ...s, age: v }));
  }, []);

  const setRole = useCallback((v: 'patient' | 'companion' | null) => {
    setState((s) => ({ ...s, role: v }));
    // Persist role to storage
    if (v) {
      AsyncStorage.setItem(USER_ROLE_KEY, v).catch((err) => {
        console.error('Failed to persist user role:', err);
      });
    } else {
      AsyncStorage.removeItem(USER_ROLE_KEY).catch((err) => {
        console.error('Failed to remove user role:', err);
      });
    }
  }, []);

  const setPatientId = useCallback((v: string) => {
    setState((s) => ({ ...s, patientId: v }));
    // Persist patientId to storage
    if (v) {
      AsyncStorage.setItem(PATIENT_ID_KEY, v).catch((err) => {
        console.error('Failed to persist patient ID:', err);
      });
    } else {
      AsyncStorage.removeItem(PATIENT_ID_KEY).catch((err) => {
        console.error('Failed to remove patient ID:', err);
      });
    }
  }, []);

  const setAddictionTypes = useCallback((v: AddictionType[] | ((prev: AddictionType[]) => AddictionType[])) => {
    setState((s) => ({ ...s, addictionTypes: typeof v === 'function' ? v(s.addictionTypes) : v }));
  }, []);

  const setWhenItHappens = useCallback((v: WhenItHappens[] | ((prev: WhenItHappens[]) => WhenItHappens[])) => {
    setState((s) => ({ ...s, whenItHappens: typeof v === 'function' ? v(s.whenItHappens) : v }));
  }, []);

  const setFeelAfter = useCallback((v: FeelAfter | null) => {
    setState((s) => ({ ...s, feelAfter: v }));
  }, []);

  const setFrequency = useCallback((v: Frequency | null) => {
    setState((s) => ({ ...s, frequency: v }));
  }, []);

  const setFrequencyUnit = useCallback((v: FrequencyUnit) => {
    setState((s) => ({ ...s, frequencyUnit: v }));
  }, []);

  const setFrequencyQuantity = useCallback((v: number) => {
    setState((s) => ({ ...s, frequencyQuantity: Math.round(v) }));
  }, []);

  const setMoneySpent = useCallback((v: string) => {
    setState((s) => ({ ...s, moneySpent: v }));
  }, []);

  const setImpactAreas = useCallback((v: ImpactArea[] | ((prev: ImpactArea[]) => ImpactArea[])) => {
    setState((s) => ({ ...s, impactAreas: typeof v === 'function' ? v(s.impactAreas) : v }));
  }, []);

  const setIntention = useCallback((v: Intention | null) => {
    setState((s) => ({ ...s, intention: v }));
  }, []);

  const setDuration = useCallback((v: Duration | null) => {
    setState((s) => ({ ...s, duration: v }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setIsOnboardingComplete(false);
    AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY).catch((err) => {
      console.error('Failed to reset onboarding status:', err);
    });
    AsyncStorage.removeItem(USER_ROLE_KEY).catch((err) => {
      console.error('Failed to reset user role:', err);
    });
    AsyncStorage.removeItem(PATIENT_ID_KEY).catch((err) => {
      console.error('Failed to reset patient ID:', err);
    });
  }, []);

  const createUser = useCallback(
    async (displayName: string, age?: number, role?: 'patient' | 'companion') => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await OnboardingApi.createUser(displayName, age, role);
        const finalRole = role || 'patient';
        const userId = response.id;
        
        // Update state immediately
        setState((s) => ({
          ...s,
          userId,
          displayName: response.displayName,
          age: response.age ? response.age.toString() : '',
          role: finalRole,
        }));
        
        // Persist role and userId to storage
        await AsyncStorage.setItem(USER_ROLE_KEY, finalRole);
        await AsyncStorage.setItem(USER_ID_KEY, userId);
        
        // Return userId for immediate use (especially important for companions)
        return userId;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create user';
        setError(errorMessage);
        console.error('Create user error:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const saveToBackend = useCallback(async () => {
    if (!state.userId) {
      throw new Error('User ID is not set. Create user first.');
    }
    setIsLoading(true);
    setError(null);
    try {
      const timesPerWeek =
        state.frequencyUnit === 'per_week'
          ? state.frequencyQuantity
          : state.frequencyQuantity * 7;
      const derivedFrequency: Frequency | null =
        timesPerWeek <= 2
          ? 'once_in_a_while'
          : timesPerWeek <= 6
            ? 'few_times_week'
            : timesPerWeek <= 14
              ? 'almost_every_day'
              : 'multiple_times_day';
      const moneySpentUnit =
        state.frequencyUnit === 'per_week' ? ('per_week' as const) : ('per_day' as const);
      await OnboardingApi.updateOnboarding(state.userId, {
        addictionTypes: state.addictionTypes,
        whenItHappens: state.whenItHappens,
        feelAfter: state.feelAfter,
        frequency: derivedFrequency,
        frequencyUnit: state.frequencyUnit,
        frequencyQuantity: state.frequencyQuantity,
        moneySpent: state.moneySpent?.trim() || undefined,
        moneySpentUnit,
        impactAreas: state.impactAreas,
        intention: state.intention,
        duration: state.duration,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save to backend';
      setError(errorMessage);
      console.error('Save to backend error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  const completeOnboarding = useCallback(async (userId?: string) => {
    const userIdToUse = userId || state.userId;
    if (!userIdToUse) {
      throw new Error('User ID is not set.');
    }
    setIsLoading(true);
    setError(null);
    try {
      await OnboardingApi.completeOnboarding(userIdToUse);
      await AsyncStorage.setItem(USER_ID_KEY, userIdToUse);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete onboarding';
      setError(errorMessage);
      console.error('Complete onboarding error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.userId]);

  // const markOnboardingComplete = useCallback(async () => {
  //   setIsOnboardingComplete(true);
  //   try {
  //     await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  //     await AsyncStorage.setItem(USER_ID_KEY, state.userId);
  //   } catch (err) {
  //     console.error('Failed to persist onboarding status:', err);
  //   }
  // }, []);

  const markOnboardingComplete = useCallback(async () => {
    setIsOnboardingComplete(true);

    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      await AsyncStorage.setItem(USER_ID_KEY, state.userId);
    } catch (err) {
      console.error('Failed to persist onboarding status:', err);
    }
  }, [state.userId]);

  const value: OnboardingContextValue = {
    state,
    isLoading,
    isHydrating,
    isOnboardingComplete,
    error,
    setDisplayName,
    setAge,
    setRole,
    setPatientId,
    setAddictionTypes,
    setWhenItHappens,
    setFeelAfter,
    setFrequency,
    setFrequencyUnit,
    setFrequencyQuantity,
    setMoneySpent,
    setImpactAreas,
    setIntention,
    setDuration,
    reset,
    createUser,
    saveToBackend,
    completeOnboarding,
    markOnboardingComplete,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
