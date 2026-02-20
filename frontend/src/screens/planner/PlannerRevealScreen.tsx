import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlannerStackParamList } from '../../navigation/PlannerStack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { usePlannerAssessment } from '../../context/PlannerAssessmentContext';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = NativeStackNavigationProp<PlannerStackParamList, 'PlannerReveal'>;

export function PlannerRevealScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { recoveryPlan } = usePlannerAssessment();
  const [expandWhy, setExpandWhy] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 500 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!recoveryPlan) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading your plan...</Text>
        </View>
      </View>
    );
  }

  const todayLimit = recoveryPlan.futureDailyLimits[recoveryPlan.currentDayIndex] || 0;
  const formatDailyGoal = () => {
    if (todayLimit === 0) return 'Today is a smoke-free day!';
    return `Reduce to ${todayLimit} cigarette${todayLimit > 1 ? 's' : ''} today`;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={containerStyle}>
          <Text style={styles.headline}>Your AI Recovery Plan is Ready</Text>
          
          {/* Daily Goal Card */}
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>Daily goal</Text>
            <Text style={styles.goalText}>{formatDailyGoal()}</Text>
          </View>

          {/* Plan Overview */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Recovery Duration</Text>
            <Text style={styles.overviewValue}>{recoveryPlan.recoveryDurationDays} days</Text>
            
            <View style={styles.overviewDivider} />
            
            <View style={styles.overviewRow}>
              <View style={styles.overviewCol}>
                <Text style={styles.overviewLabel}>Severity</Text>
                <Text style={[styles.overviewValue, styles.overviewValueSmall]}>
                  {recoveryPlan.addictionSeverity}
                </Text>
              </View>
              <View style={styles.overviewCol}>
                <Text style={styles.overviewLabel}>Relapse Risk</Text>
                <Text style={[styles.overviewValue, styles.overviewValueSmall]}>
                  {recoveryPlan.relapseRisk}
                </Text>
              </View>
            </View>
          </View>

          {/* Behavioral Tips Section */}
          {recoveryPlan.aiRecommendations.behavioralTips.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Daily Tips</Text>
              {recoveryPlan.aiRecommendations.behavioralTips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipIcon}>
                    <Feather name="check-circle" size={16} color={colors.success} />
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </>
          )}

          {/* Trigger Strategies Section */}
          {recoveryPlan.aiRecommendations.triggerStrategies.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Trigger Strategies</Text>
              {recoveryPlan.aiRecommendations.triggerStrategies.map((strategy, i) => (
                <View key={i} style={styles.strategyRow}>
                  <View style={styles.strategyIcon}>
                    <Feather name="shield" size={16} color={colors.accent} />
                  </View>
                  <Text style={styles.strategyText}>{strategy}</Text>
                </View>
              ))}
            </>
          )}

          {/* Exercise Tips Section */}
          {recoveryPlan.aiRecommendations.exerciseTips.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Exercise & Wellness</Text>
              {recoveryPlan.aiRecommendations.exerciseTips.map((exercise, i) => (
                <View key={i} style={styles.exerciseRow}>
                  <View style={styles.exerciseIcon}>
                    <Feather name="activity" size={16} color={colors.milestone} />
                  </View>
                  <Text style={styles.exerciseText}>{exercise}</Text>
                </View>
              ))}
            </>
          )}

          {/* Why This Plan */}
          <Pressable
            style={styles.whyWrap}
            onPress={() => setExpandWhy(!expandWhy)}
          >
            <View style={styles.whyHeader}>
              <Text style={styles.whyTitle}>Why this plan?</Text>
              <Feather
                name={expandWhy ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textMuted}
              />
            </View>
            {expandWhy && (
              <Text style={styles.whyBody}>{recoveryPlan.planSummary}</Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.getParent()?.navigate('HomeDashboard')}
        >
          <Text style={styles.backBtnText}>Go to Dashboard</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  headline: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  goalCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  goalLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xxs,
  },
  goalText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  overviewCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  overviewLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xxs,
  },
  overviewValue: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  overviewValueSmall: {
    fontSize: 16,
  },
  overviewDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewCol: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.successSoft,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  strategyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  strategyIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  strategyText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  exerciseIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  exerciseText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  whyWrap: {
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
  },
  whyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whyTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  whyBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  backBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  backBtnText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
