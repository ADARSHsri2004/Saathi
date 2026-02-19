import React, { createContext, useContext, useCallback, useState } from 'react';

export type AssessmentAnswers = {
  ftnd: Record<number, number>;
  yearsAddicted: number;
  triggers: string[];
};

const defaultAnswers: AssessmentAnswers = {
  ftnd: {},
  yearsAddicted: 1,
  triggers: [],
};

type PlannerAssessmentContextValue = {
  answers: AssessmentAnswers;
  setFtndAnswer: (step: number, value: number) => void;
  setYearsAddicted: (value: number) => void;
  setTriggers: (triggers: string[]) => void;
  addTrigger: (trigger: string) => void;
  removeTrigger: (trigger: string) => void;
  completedAt: number | null;
  markCompleted: () => void;
  reset: () => void;
};

const PlannerAssessmentContext = createContext<PlannerAssessmentContextValue | null>(null);

export function PlannerAssessmentProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<AssessmentAnswers>(defaultAnswers);
  const [completedAt, setCompletedAt] = useState<number | null>(null);

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

  const markCompleted = useCallback(() => {
    setCompletedAt(Date.now());
  }, []);

  const reset = useCallback(() => {
    setAnswers(defaultAnswers);
    setCompletedAt(null);
  }, []);

  const value: PlannerAssessmentContextValue = {
    answers,
    setFtndAnswer,
    setYearsAddicted,
    setTriggers,
    addTrigger,
    removeTrigger,
    completedAt,
    markCompleted,
    reset,
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
