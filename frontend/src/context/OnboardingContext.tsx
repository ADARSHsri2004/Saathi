import React, { createContext, useContext, useState, useCallback } from 'react';

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

export interface OnboardingState {
  displayName: string;
  age: string;
  addictionTypes: AddictionType[];
  whenItHappens: WhenItHappens[];
  feelAfter: FeelAfter | null;
  frequency: Frequency | null;
  moneySpent: string;
  impactAreas: ImpactArea[];
  intention: Intention | null;
  duration: Duration | null;
}

const initialState: OnboardingState = {
  displayName: '',
  age: '',
  addictionTypes: [],
  whenItHappens: [],
  feelAfter: null,
  frequency: null,
  moneySpent: '',
  impactAreas: [],
  intention: null,
  duration: null,
};

type OnboardingContextValue = {
  state: OnboardingState;
  setDisplayName: (v: string) => void;
  setAge: (v: string) => void;
  setAddictionTypes: (v: AddictionType[] | ((prev: AddictionType[]) => AddictionType[])) => void;
  setWhenItHappens: (v: WhenItHappens[] | ((prev: WhenItHappens[]) => WhenItHappens[])) => void;
  setFeelAfter: (v: FeelAfter | null) => void;
  setFrequency: (v: Frequency | null) => void;
  setMoneySpent: (v: string) => void;
  setImpactAreas: (v: ImpactArea[] | ((prev: ImpactArea[]) => ImpactArea[])) => void;
  setIntention: (v: Intention | null) => void;
  setDuration: (v: Duration | null) => void;
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setDisplayName = useCallback((v: string) => {
    setState((s) => ({ ...s, displayName: v }));
  }, []);
  const setAge = useCallback((v: string) => {
    setState((s) => ({ ...s, age: v }));
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
  }, []);

  const value: OnboardingContextValue = {
    state,
    setDisplayName,
    setAge,
    setAddictionTypes,
    setWhenItHappens,
    setFeelAfter,
    setFrequency,
    setMoneySpent,
    setImpactAreas,
    setIntention,
    setDuration,
    reset,
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
