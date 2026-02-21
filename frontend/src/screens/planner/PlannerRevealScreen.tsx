import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlannerStackParamList } from '../../navigation/PlannerStack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  Easing,
  Layout,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePlannerAssessment } from '../../context/PlannerAssessmentContext';
import { colors, typography, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = spacing.lg;
const CARD_MAX = SCREEN_WIDTH - CARD_PADDING * 2;

type NavProp = NativeStackNavigationProp<PlannerStackParamList, 'PlannerReveal'>;

const GOAL_GRADIENT: readonly [string, string, ...string[]] = [colors.accent, '#1E88E5', colors.secondary];
const OVERVIEW_GRADIENT: readonly [string, string, ...string[]] = ['rgba(45, 156, 219, 0.15)', 'rgba(82, 183, 136, 0.08)'];
const TIP_GRADIENT: readonly [string, string, ...string[]] = ['rgba(72, 187, 120, 0.2)', 'rgba(72, 187, 120, 0.06)'];
const SHIELD_GRADIENT: readonly [string, string, ...string[]] = ['rgba(45, 156, 219, 0.25)', 'rgba(45, 156, 219, 0.06)'];
const EXERCISE_GRADIENT: readonly [string, string, ...string[]] = ['rgba(255, 209, 102, 0.25)', 'rgba(255, 209, 102, 0.06)'];

export function PlannerRevealScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { recoveryPlan } = usePlannerAssessment();
  const [expandWhy, setExpandWhy] = useState(false);
  const whyChevronRotate = useSharedValue(0);

  const headlineOpacity = useSharedValue(0);
  const headlineScale = useSharedValue(0.9);
  const headlineTranslateY = useSharedValue(24);
  const goalOpacity = useSharedValue(0);
  const goalScale = useSharedValue(0.92);
  const goalRotateY = useSharedValue(12);
  const overviewOpacity = useSharedValue(0);
  const overviewTranslateY = useSharedValue(20);
  const tipsOpacity = useSharedValue(0);
  const tipsTranslateY = useSharedValue(16);
  const shieldOpacity = useSharedValue(0);
  const shieldTranslateY = useSharedValue(16);
  const exerciseOpacity = useSharedValue(0);
  const exerciseTranslateY = useSharedValue(16);
  const whyOpacity = useSharedValue(0);
  const whyTranslateY = useSharedValue(16);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    headlineOpacity.value = withDelay(80, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    headlineScale.value = withDelay(80, withSpring(1, { damping: 14, stiffness: 120 }));
    headlineTranslateY.value = withDelay(80, withSpring(0, { damping: 16, stiffness: 140 }));

    goalOpacity.value = withDelay(220, withTiming(1, { duration: 480 }));
    goalScale.value = withDelay(220, withSpring(1, { damping: 12, stiffness: 100 }));
    goalRotateY.value = withDelay(220, withSpring(0, { damping: 18, stiffness: 120 }));

    overviewOpacity.value = withDelay(420, withTiming(1, { duration: 450 }));
    overviewTranslateY.value = withDelay(420, withSpring(0, { damping: 16, stiffness: 130 }));

    tipsOpacity.value = withDelay(620, withTiming(1, { duration: 400 }));
    tipsTranslateY.value = withDelay(620, withSpring(0, { damping: 15, stiffness: 130 }));

    shieldOpacity.value = withDelay(820, withTiming(1, { duration: 400 }));
    shieldTranslateY.value = withDelay(820, withSpring(0, { damping: 15, stiffness: 130 }));

    exerciseOpacity.value = withDelay(1020, withTiming(1, { duration: 400 }));
    exerciseTranslateY.value = withDelay(1020, withSpring(0, { damping: 15, stiffness: 130 }));

    whyOpacity.value = withDelay(1220, withTiming(1, { duration: 400 }));
    whyTranslateY.value = withDelay(1220, withSpring(0, { damping: 15, stiffness: 130 }));
  }, []);

  useEffect(() => {
    whyChevronRotate.value = withSpring(expandWhy ? 180 : 0, { damping: 14, stiffness: 150 });
  }, [expandWhy]);

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [
      { scale: headlineScale.value },
      { translateY: headlineTranslateY.value },
    ],
  }));

  const goalStyle = useAnimatedStyle(() => ({
    opacity: goalOpacity.value,
    transform: [
      { perspective: 600 },
      { rotateY: `${goalRotateY.value}deg` },
      { scale: goalScale.value },
    ],
  }));

  const overviewStyle = useAnimatedStyle(() => ({
    opacity: overviewOpacity.value,
    transform: [{ translateY: overviewTranslateY.value }],
  }));

  const tipsStyle = useAnimatedStyle(() => ({
    opacity: tipsOpacity.value,
    transform: [{ translateY: tipsTranslateY.value }],
  }));

  const shieldStyle = useAnimatedStyle(() => ({
    opacity: shieldOpacity.value,
    transform: [{ translateY: shieldTranslateY.value }],
  }));

  const exerciseStyle = useAnimatedStyle(() => ({
    opacity: exerciseOpacity.value,
    transform: [{ translateY: exerciseTranslateY.value }],
  }));

  const whyStyle = useAnimatedStyle(() => ({
    opacity: whyOpacity.value,
    transform: [{ translateY: whyTranslateY.value }],
  }));

  const backBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const whyChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${whyChevronRotate.value}deg` }],
  }));

  if (!recoveryPlan) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={[colors.background, colors.backgroundSecondary]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading your plan...</Text>
        </View>
      </View>
    );
  }

  const todayLimit = recoveryPlan.futureDailyLimits[recoveryPlan.currentDayIndex] ?? 0;
  const formatDailyGoal = () => {
    if (todayLimit === 0) return 'Today is a smoke-free day!';
    return `Reduce to ${todayLimit} cigarette${todayLimit > 1 ? 's' : ''} today`;
  };

  const handleBackPress = () => {
    btnScale.value = withSpring(0.96, { damping: 12 }, () => {
      btnScale.value = withSpring(1);
    });
    setTimeout(() => navigation.getParent()?.navigate('HomeDashboard'), 120);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary, colors.background]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.headlineWrap, headlineStyle]}>
          <View style={styles.headlineIconWrap}>
            <MaterialCommunityIcons name="brain" size={28} color={colors.accent} />
          </View>
          <Text style={styles.headline}>Your AI Recovery Plan</Text>
          <Text style={styles.headlineSub}>Personalized for you</Text>
        </Animated.View>

        <Animated.View style={goalStyle}>
          <LinearGradient
            colors={GOAL_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goalCard}
          >
            <View style={styles.goalGlow} />
            <View style={styles.goalContent}>
              <View style={styles.goalBadge}>
                <Feather name="target" size={18} color="#fff" />
                <Text style={styles.goalBadgeText}>Daily goal</Text>
              </View>
              <Text style={styles.goalText}>{formatDailyGoal()}</Text>
              <View style={styles.goalDayRow}>
                <Text style={styles.goalDayLabel}>Day</Text>
                <Text style={styles.goalDayValue}>{recoveryPlan.currentDayIndex + 1}</Text>
                <Text style={styles.goalDayLabel}>of {recoveryPlan.recoveryDurationDays}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={overviewStyle}>
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={OVERVIEW_GRADIENT}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.overviewInner}>
              <View style={styles.overviewMain}>
                <Text style={styles.overviewLabel}>Recovery duration</Text>
                <Text style={styles.overviewValue}>{recoveryPlan.recoveryDurationDays} days</Text>
              </View>
              <View style={styles.overviewPills}>
                <View style={styles.pill}>
                  <MaterialCommunityIcons name="gauge" size={16} color={colors.accent} />
                  <Text style={styles.pillText}>{recoveryPlan.addictionSeverity}</Text>
                </View>
                <View style={[styles.pill, styles.pillRisk]}>
                  <Feather name="shield" size={14} color={colors.secondary} />
                  <Text style={styles.pillText}>{recoveryPlan.relapseRisk}</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {recoveryPlan.aiRecommendations.behavioralTips.length > 0 && (
          <Animated.View style={tipsStyle}>
            <View style={styles.sectionHeader}>
<LinearGradient
              colors={[colors.success, colors.secondary] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionHeaderLine}
              />
              <Text style={styles.sectionTitle}>Daily tips</Text>
            </View>
            {recoveryPlan.aiRecommendations.behavioralTips.map((tip, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 60).duration(400).springify().damping(14)}
                style={styles.tipCard}
              >
                <LinearGradient colors={TIP_GRADIENT} style={styles.tipGradient} />
                <View style={styles.tipIconWrap}>
                  <Feather name="check-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {recoveryPlan.aiRecommendations.triggerStrategies.length > 0 && (
          <Animated.View style={shieldStyle}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[colors.accent, colors.info] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionHeaderLine}
              />
              <Text style={styles.sectionTitle}>Trigger strategies</Text>
            </View>
            {recoveryPlan.aiRecommendations.triggerStrategies.map((strategy, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 60).duration(400).springify().damping(14)}
                style={styles.strategyCard}
              >
                <LinearGradient colors={SHIELD_GRADIENT} style={styles.tipGradient} />
                <View style={styles.strategyIconWrap}>
                  <Feather name="shield" size={20} color={colors.accent} />
                </View>
                <Text style={styles.strategyText}>{strategy}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {recoveryPlan.aiRecommendations.exerciseTips.length > 0 && (
          <Animated.View style={exerciseStyle}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[colors.milestone, colors.tertiary] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionHeaderLine}
              />
              <Text style={styles.sectionTitle}>Exercise & wellness</Text>
            </View>
            {recoveryPlan.aiRecommendations.exerciseTips.map((exercise, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 60).duration(400).springify().damping(14)}
                style={styles.exerciseCard}
              >
                <LinearGradient colors={EXERCISE_GRADIENT} style={styles.tipGradient} />
                <View style={styles.exerciseIconWrap}>
                  <Feather name="activity" size={20} color={colors.milestone} />
                </View>
                <Text style={styles.exerciseText}>{exercise}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        <Animated.View style={whyStyle}>
          <Pressable
            style={styles.whyCard}
            onPress={() => setExpandWhy(!expandWhy)}
          >
            <LinearGradient
              colors={[colors.backgroundCard, colors.backgroundSecondary] as const}
              style={styles.whyGradient}
            />
            <View style={styles.whyHeader}>
              <Text style={styles.whyTitle}>Why this plan?</Text>
              <Animated.View
                style={[
                  styles.whyChevron,
                  { transform: [{ rotate: expandWhy ? '180deg' : '0deg' }] },
                ]}
              >
                <Feather name="chevron-down" size={22} color={colors.textMuted} />
              </Animated.View>
            </View>
            {expandWhy && (
              <Animated.View
                layout={Layout.springify().damping(16).stiffness(120)}
                style={styles.whyBodyWrap}
              >
                <Text style={styles.whyBody}>{recoveryPlan.planSummary}</Text>
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Animated.View style={backBtnStyle}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={handleBackPress}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentPressed] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.backBtnGradient}
            >
              <Text style={styles.backBtnText}>Go to Dashboard</Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
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
    paddingHorizontal: CARD_PADDING,
    paddingTop: spacing.xl,
  },
  headlineWrap: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  headlineIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headline: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 24,
  },
  headlineSub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  goalCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  goalGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.xl,
  },
  goalContent: {
    zIndex: 1,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  goalBadgeText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  goalText: {
    ...typography.titleMedium,
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  goalDayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  goalDayLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  goalDayValue: {
    ...typography.titleSmall,
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  overviewCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  overviewInner: {
    padding: spacing.lg,
  },
  overviewMain: {
    marginBottom: spacing.md,
  },
  overviewLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xxs,
  },
  overviewValue: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 20,
  },
  overviewPills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  pillRisk: {
    borderColor: colors.secondarySoft,
  },
  pillText: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionHeaderLine: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontSize: 17,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.successSoft,
  },
  tipGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  strategyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  strategyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  strategyText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.milestoneSoft,
  },
  exerciseIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.milestoneSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exerciseText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  whyCard: {
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  whyGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  whyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 1,
  },
  whyTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  whyChevron: {
    marginLeft: spacing.sm,
  },
  whyBodyWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    zIndex: 1,
  },
  whyBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: CARD_PADDING,
    paddingTop: spacing.md,
    backgroundColor: 'transparent',
  },
  backBtn: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backBtnPressed: {
    opacity: 0.9,
  },
  backBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backBtnText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
