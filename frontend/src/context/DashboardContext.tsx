import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardApi } from '../services/api';

const USER_ID_KEY = 'user_id';

export interface TodayProgress {
  percentage: number;
  timeElapsed: string;
  timeRemaining: string;
}

export interface RecoveryMetrics {
  timeFreeHours: number;
  lifeRegainedMinutes: number;
  moneySaved: number;
  cigarettesNotConsumed: number;
}

export interface PastImpact {
  totalLifeLostMinutes: number;
  totalMoneyWasted: number;
  totalConsumed: number;
}

export interface DashboardMetrics {
  todayProgress: TodayProgress;
  recoveryMetrics: RecoveryMetrics;
  pastImpact: PastImpact;
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

type DashboardContextValue = {
  metrics: DashboardMetrics | null;
  projections: FutureProjection[];
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  recordRelapse: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const initialMetrics: DashboardMetrics = {
  todayProgress: {
    percentage: 0,
    timeElapsed: '0h 0m',
    timeRemaining: '24h 0m',
  },
  recoveryMetrics: {
    timeFreeHours: 0,
    lifeRegainedMinutes: 0,
    moneySaved: 0,
    cigarettesNotConsumed: 0,
  },
  pastImpact: {
    totalLifeLostMinutes: 0,
    totalMoneyWasted: 0,
    totalConsumed: 0,
  },
  journeyStartDate: null,
  lastRelapseDate: null,
  totalRelapses: 0,
  currentStreakDays: 0,
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projections, setProjections] = useState<FutureProjection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      
      if (!userId) {
        throw new Error('User ID not found. Please complete onboarding first.');
      }

      // Fetch metrics and projections in parallel
      const [metricsData, projectionsData] = await Promise.all([
        DashboardApi.getDashboardMetrics(userId),
        DashboardApi.getFutureProjections(userId),
      ]);

      setMetrics(metricsData);
      setProjections(projectionsData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
      
      // Set default values on error
      setMetrics(initialMetrics);
      setProjections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordRelapse = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      await DashboardApi.recordRelapse(userId);
      
      // Refresh dashboard after recording relapse
      await fetchDashboardData();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to record relapse';
      setError(errorMessage);
      console.error('Record relapse error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDashboardData]);

  const refreshDashboard = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh dashboard data periodically (every hour)
  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60 * 60 * 1000); // Refresh every hour
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const value: DashboardContextValue = {
    metrics,
    projections,
    isLoading,
    error,
    fetchDashboardData,
    recordRelapse,
    refreshDashboard,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
