import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = NativeStackNavigationProp<PlannerStackParamList, 'PlannerReveal'>;

const MOCK_PLAN = {
  dailyGoal: 'Reduce to 5 cigarettes today',
  riskWindows: [
    { time: 'Morning (6–9am)', note: 'High urge after waking' },
    { time: 'Evening (6–9pm)', note: 'After work stress' },
  ],
  replacementHabits: [
    { time: 'Morning', habit: '5 min breathwork + glass of water', xp: 5 },
    { time: 'Afternoon', habit: 'Short walk instead of break cigarette', xp: 10 },
    { time: 'Evening', habit: 'Call a friend or journal', xp: 10 },
    { time: 'Night', habit: 'No screens 30 min before bed', xp: 5 },
  ],
  whyExplanation:
    'Your plan is built around your morning and evening triggers and your goal to cut down gradually. We\'ve added small replacement habits that fit into your existing routine so they\'re easier to stick to.',
};

export function PlannerRevealScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={containerStyle}>
          <Text style={styles.headline}>Your AI Recovery Plan is Ready</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>Daily goal</Text>
            <Text style={styles.goalText}>{MOCK_PLAN.dailyGoal}</Text>
          </View>
          <Text style={styles.sectionTitle}>Risk windows</Text>
          {MOCK_PLAN.riskWindows.map((w, i) => (
            <View key={i} style={styles.riskRow}>
              <View style={styles.riskTimeWrap}>
                <Text style={styles.riskTime}>{w.time}</Text>
              </View>
              <Text style={styles.riskNote}>{w.note}</Text>
            </View>
          ))}
          <Text style={styles.sectionTitle}>Replacement habits</Text>
          {MOCK_PLAN.replacementHabits.map((h, i) => (
            <View key={i} style={styles.habitRow}>
              <View style={styles.habitLeft}>
                <View style={styles.habitRing} />
                <View>
                  <Text style={styles.habitTime}>{h.time}</Text>
                  <Text style={styles.habitText}>{h.habit}</Text>
                </View>
              </View>
              <Text style={styles.habitXp}>+{h.xp} XP</Text>
            </View>
          ))}
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
              <Text style={styles.whyBody}>{MOCK_PLAN.whyExplanation}</Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.backBtnText}>Back to Planner</Text>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
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
    marginBottom: spacing.xl,
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
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.errorSoft,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  riskTimeWrap: {
    marginRight: spacing.sm,
  },
  riskTime: {
    ...typography.label,
    color: colors.error,
  },
  riskNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.successSoft,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.success,
    marginRight: spacing.sm,
  },
  habitTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  habitText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  habitXp: {
    ...typography.label,
    color: colors.milestone,
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
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  backBtnText: {
    ...typography.button,
    color: colors.accent,
  },
});
