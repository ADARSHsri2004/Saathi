import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {Ionicons } from '@expo/vector-icons';
import { CompanionApi, DashboardApi } from '../services/api';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, typography, spacing, borderRadius } from '../theme/index';
import type { MainStackParamList } from '../navigation/MainStack';

type Nav = NativeStackNavigationProp<MainStackParamList, 'HomeDashboard'>;

interface PatientProgressData {
  patient: {
    id: string;
    displayName: string;
  };
  onboarding: {
    addictionTypes: string[];
    intention: string;
    duration: string;
    journeyStartDate: string | null;
    completedAt: string | null;
  };
  relapseInfo: {
    totalRelapses: number;
    lastRelapseDate: string | null;
    currentStreakDays: number;
  };
}

interface DashboardMetrics {
  todayProgress?: {
    percentage: number;
    timeElapsed?: string;
    timeRemaining?: string;
  };
  recoveryMetrics?: {
    timeFreeHours?: number;
    lifeRegainedMinutes?: number;
    moneySaved?: number;
    cigarettesNotConsumed?: number;
  };
  pastImpact?: {
    totalLifeLostMinutes?: number;
    totalMoneyWasted?: number;
    totalConsumed?: number;
  };
}

export function CompanionDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const [patientData, setPatientData] = useState<PatientProgressData | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientData = async () => {
    if (!state.patientId) {
      setError('No patient linked');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await CompanionApi.getPatientDashboard(state.patientId);
      setPatientData(data);
      // fetch dashboard metrics (money saved, today progress etc.)
      try {
        const metrics = await DashboardApi.getDashboardMetrics(state.patientId);
        setDashboardMetrics(metrics);
      } catch (mErr) {
        console.warn('Could not fetch dashboard metrics for patient:', mErr);
        setDashboardMetrics(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load patient progress';
      setError(message);
      console.error('Error fetching patient data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [state.patientId]);

  useFocusEffect(
    React.useCallback(() => {
      if (state.patientId && !isLoading) {
        setIsRefreshing(true);
        fetchPatientData();
      }
    }, [state.patientId])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchPatientData();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !patientData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.centerContent]}>
        <Ionicons name="alert-circle" size={64} color={colors.textMuted} />
        <Text style={styles.errorTitle}>Unable to Load</Text>
        <Text style={styles.errorMessage}>{error || 'Patient data not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPatientData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const addictionType = patientData.onboarding.addictionTypes[0] || 'Addiction';
  const isOnGoing = !patientData.onboarding.completedAt;

  const cravingRisk = (() => {
    if (!patientData) return 'Unknown';
    const days = patientData.relapseInfo.currentStreakDays ?? 0;
    if (days < 3) return 'High';
    if (days < 14) return 'Medium';
    return 'Low';
  })();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Companion Dashboard</Text>
        <Text style={styles.headerSubtitle}>Supporting {patientData.patient.displayName}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Patient Info</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{patientData.patient.displayName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Addiction</Text>
            <Text style={styles.value}>{addictionType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Goal</Text>
            <Text style={styles.value}>{patientData.onboarding.intention || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.value, { color: isOnGoing ? colors.accent : colors.success }]}>
              {isOnGoing ? 'In Progress' : 'Completed'}
            </Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recovery Progress</Text>
          </View>

          {/* Current Streak */}
          <View style={styles.streakBox}>
            <Text style={styles.streakNumber}>{patientData.relapseInfo.currentStreakDays}</Text>
            <Text style={styles.streakLabel}>Days Clean</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{patientData.relapseInfo.totalRelapses}</Text>
              <Text style={styles.metricLabel}>Total Relapses</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons
                name={patientData.relapseInfo.lastRelapseDate ? 'alert-circle' : 'checkmark-circle'}
                size={32}
                color={patientData.relapseInfo.lastRelapseDate ? colors.warning : colors.success}
              />
              <Text style={styles.metricLabel}>
                {patientData.relapseInfo.lastRelapseDate ? 'Recently Relapsed' : 'No Recent Relapse'}
              </Text>
            </View>
          </View>

          {patientData.relapseInfo.lastRelapseDate && (
            <Text style={styles.lastRelapseText}>
              Last relapse: {new Date(patientData.relapseInfo.lastRelapseDate).toLocaleDateString()}
            </Text>
          )}

          {/* Today progress from metrics API */}
          {dashboardMetrics?.todayProgress && (
            <View style={[styles.progressRow, { marginTop: 12 }]}> 
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, Math.max(0, dashboardMetrics.todayProgress.percentage))}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{dashboardMetrics.todayProgress.percentage}% today</Text>
            </View>
          )}
        </View>

        {/* Recovery Metrics Card */}
        {dashboardMetrics?.recoveryMetrics && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recovery Metrics</Text>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{dashboardMetrics.recoveryMetrics.moneySaved ?? 0}</Text>
                <Text style={styles.metricLabel}>Money Saved</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{dashboardMetrics.recoveryMetrics.timeFreeHours ?? 0}</Text>
                <Text style={styles.metricLabel}>Hours Free</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{dashboardMetrics.recoveryMetrics.cigarettesNotConsumed ?? 0}</Text>
                <Text style={styles.metricLabel}>Cigarettes Avoided</Text>
              </View>
            </View>
          </View>
        )}

        {/* Craving / Risk Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Craving & Risk</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Craving Risk</Text>
            <Text style={[styles.value, { color: cravingRisk === 'High' ? colors.warning : colors.accent }]}>{cravingRisk}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Relapse</Text>
            <Text style={styles.value}>{patientData.relapseInfo.lastRelapseDate ? new Date(patientData.relapseInfo.lastRelapseDate).toLocaleDateString() : '—'}</Text>
          </View>
          <Text style={[styles.caption, { marginTop: spacing.sm }]}>If risk is high, consider reaching out and offering extra support.</Text>
        </View>

        {/* Journey Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Journey Details</Text>
          </View>
          {patientData.onboarding.journeyStartDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Started On</Text>
              <Text style={styles.value}>
                {new Date(patientData.onboarding.journeyStartDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Goal Duration</Text>
            <Text style={styles.value}>{patientData.onboarding.duration || 'Not specified'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Feature Coming Soon', 'Send a supportive message to your companion');
            }}
          >
            <Ionicons name="chatbubble" size={24} color={colors.accent} />
            <Text style={styles.actionButtonText}>Send Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Feature Coming Soon', 'Record observations about their progress');
            }}
          >
            <Ionicons name="checkmark-done" size={24} color={colors.accent} />
            <Text style={styles.actionButtonText}>Log Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  cardTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  streakBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  streakNumber: {
    ...typography.heading,
    color: colors.accent,
    fontSize: 48,
  },
  streakLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  lastRelapseText: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  errorTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  retryButtonText: {
    ...typography.label,
    color: colors.background,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});
