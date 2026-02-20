import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlanApi, RecoveryPlanResponse } from '../services/api';

export type AssessmentAnswers = {
  ftnd: Record<number, number>;
  yearsAddicted: number;
  triggers: string[];
  dailyConsumption?: number; // How many cigarettes per day
};

const defaultAnswers: AssessmentAnswers = {
  ftnd: {},
  yearsAddicted: 1,
  triggers: [],
  dailyConsumption: undefined,
};

type PlannerAssessmentContextValue = {
  answers: AssessmentAnswers;
  setFtndAnswer: (step: number, value: number) => void;
  setYearsAddicted: (value: number) => void;
  setTriggers: (triggers: string[]) => void;
  addTrigger: (trigger: string) => void;
  removeTrigger: (trigger: string) => void;
  setDailyConsumption: (value: number) => void;
  completedAt: number | null;
  markCompleted: () => void;
  reset: () => void;
  
  // Recovery plan state
  recoveryPlan: RecoveryPlanResponse | null;
  isGeneratingPlan: boolean;
  isFetchingPlan: boolean;
  isPlanHydrating: boolean;
  planError: string | null;
  planFetchedAt: number | null;
  
  // Recovery plan actions
  generatePlan: (userId: string, dailyConsumption: number) => Promise<void>;
  fetchPlan: (userId: string) => Promise<void>;
  refreshPlanIfStale: (userId: string) => Promise<void>;
  clearPlan: () => void;
};

const PlannerAssessmentContext = createContext<PlannerAssessmentContextValue | null>(null);

export function PlannerAssessmentProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<AssessmentAnswers>(defaultAnswers);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  
  // Recovery plan state
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlanResponse | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isFetchingPlan, setIsFetchingPlan] = useState(false);
  const [isPlanHydrating, setIsPlanHydrating] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planFetchedAt, setPlanFetchedAt] = useState<number | null>(null);

  const PLAN_CACHE_KEY = 'recovery_plan_cache';
  const PLAN_FETCHED_AT_KEY = 'recovery_plan_fetched_at';
  const PLAN_REFRESH_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const hydratePlan = async () => {
      try {
        const [storedPlan, storedAt] = await Promise.all([
          AsyncStorage.getItem(PLAN_CACHE_KEY),
          AsyncStorage.getItem(PLAN_FETCHED_AT_KEY),
        ]);

        if (storedPlan) {
          setRecoveryPlan(JSON.parse(storedPlan) as RecoveryPlanResponse);
        }

        if (storedAt) {
          const parsed = Number(storedAt);
          setPlanFetchedAt(Number.isFinite(parsed) ? parsed : null);
        }
      } catch (err) {
        console.error('Failed to hydrate plan cache:', err);
      } finally {
        setIsPlanHydrating(false);
      }
    };

    hydratePlan();
  }, []);

  const setFtndAnswer = useCallback((step: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      ftnd: { ...prev.ftnd, [step]: value },
    }));
  }, []);

  const setYearsAddicted = useCallback((value: number) => {
    setAnswers((prev) => ({ ...prev, yearsAddicted: value }));
  }, []);

  const setTriggers = useCallback((triggers: string[]) => {
    setAnswers((prev) => ({ ...prev, triggers }));
  }, []);

  const addTrigger = useCallback((trigger: string) => {
    const t = trigger.trim();
    if (!t) return;
    setAnswers((prev) =>
      prev.triggers.includes(t) ? prev : { ...prev, triggers: [...prev.triggers, t] }
    );
  }, []);

  const removeTrigger = useCallback((trigger: string) => {
    setAnswers((prev) => ({
      ...prev,
      triggers: prev.triggers.filter((x) => x !== trigger),
    }));
  }, []);

  const setDailyConsumption = useCallback((value: number) => {
    setAnswers((prev) => ({ ...prev, dailyConsumption: Math.max(0, Math.round(value)) }));
  }, []);

  const markCompleted = useCallback(() => {
    setCompletedAt(Date.now());
  }, []);

  const reset = useCallback(() => {
    setAnswers(defaultAnswers);
    setCompletedAt(null);
  }, []);

  const persistPlan = useCallback(async (plan: RecoveryPlanResponse | null) => {
    try {
      if (!plan) {
        await Promise.all([
          AsyncStorage.removeItem(PLAN_CACHE_KEY),
          AsyncStorage.removeItem(PLAN_FETCHED_AT_KEY),
        ]);
        setPlanFetchedAt(null);
        return;
      }

      const now = Date.now();
      await Promise.all([
        AsyncStorage.setItem(PLAN_CACHE_KEY, JSON.stringify(plan)),
        AsyncStorage.setItem(PLAN_FETCHED_AT_KEY, now.toString()),
      ]);
      setPlanFetchedAt(now);
    } catch (err) {
      console.error('Failed to persist plan cache:', err);
    }
  }, []);

  const generatePlan = useCallback(async (userId: string, dailyConsumption: number) => {
    setIsGeneratingPlan(true);
    setPlanError(null);
    
    try {
      const plan = await PlanApi.generatePlan(userId, {
        dailyConsumption,
        yearsOfAddiction: answers.yearsAddicted,
        ftndAnswers: answers.ftnd,
        triggers: answers.triggers,
      });
      
      setRecoveryPlan(plan);
      await persistPlan(plan);
    } catch (error: any) {
      setPlanError(error.message || 'Failed to generate plan');
      throw error;
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [answers, persistPlan]);

  const fetchPlan = useCallback(async (userId: string) => {
    setIsFetchingPlan(true);
    setPlanError(null);
    try {
      const plan = await PlanApi.getPlan(userId);
      setRecoveryPlan(plan);
      await persistPlan(plan);
    } catch (error: any) {
      console.error('Error fetching plan:', error);
      setPlanError(error.message || 'Failed to fetch plan');
    } finally {
      setIsFetchingPlan(false);
    }
  }, [persistPlan]);

  const refreshPlanIfStale = useCallback(async (userId: string) => {
    if (planFetchedAt && Date.now() - planFetchedAt < PLAN_REFRESH_MS) {
      return;
    }

    await fetchPlan(userId);
  }, [fetchPlan, planFetchedAt]);

  const clearPlan = useCallback(() => {
    setRecoveryPlan(null);
    setPlanError(null);
    persistPlan(null);
  }, [persistPlan]);

  const value: PlannerAssessmentContextValue = {
    answers,
    setFtndAnswer,
    setYearsAddicted,
    setTriggers,
    addTrigger,
    removeTrigger,
    setDailyConsumption,
    completedAt,
    markCompleted,
    reset,
    recoveryPlan,
    isGeneratingPlan,
    isFetchingPlan,
    isPlanHydrating,
    planError,
    planFetchedAt,
    generatePlan,
    fetchPlan,
    refreshPlanIfStale,
    clearPlan,
  };

  return (
    <PlannerAssessmentContext.Provider value={value}>
      {children}
    </PlannerAssessmentContext.Provider>
  );
}

export function usePlannerAssessment() {
  const ctx = useContext(PlannerAssessmentContext);
  if (!ctx) throw new Error('usePlannerAssessment must be used within PlannerAssessmentProvider');
  return ctx;
}
