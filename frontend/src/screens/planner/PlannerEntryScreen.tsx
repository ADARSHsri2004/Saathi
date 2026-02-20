import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlannerStackParamList } from '../../navigation/PlannerStack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BottomNav } from '../../components/BottomNav';
import type { BottomNavKey } from '../../components/BottomNav';
import { NeuralOrb } from '../../components/planner/NeuralOrb';
import { usePlannerAssessment } from '../../context/PlannerAssessmentContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, typography, spacing } from '../../theme';

type NavProp = NativeStackNavigationProp<PlannerStackParamList, 'PlannerEntry'>;

export function PlannerEntryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const parentNav = navigation.getParent();
  const { recoveryPlan, refreshPlanIfStale, isFetchingPlan, isPlanHydrating, planError } = usePlannerAssessment();
  const { state: onboardingState, isHydrating } = useOnboarding();
  const orbOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    orbOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    subOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isHydrating || !onboardingState.userId) return;
      refreshPlanIfStale(onboardingState.userId);
    }, [isHydrating, onboardingState.userId, refreshPlanIfStale])
  );

  useEffect(() => {
    if (isPlanHydrating || isFetchingPlan) return;
    if (recoveryPlan) {
      navigation.replace('PlannerReveal');
    }
  }, [isFetchingPlan, isPlanHydrating, navigation, recoveryPlan]);

  const orbStyle = useAnimatedStyle(() => ({ opacity: orbOpacity.value }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 12 }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
    transform: [{ translateY: (1 - subOpacity.value) * 12 }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const handleNavSelect = (key: BottomNavKey) => {
    if (key === 'planner') return;
    if (key === 'progress') parentNav?.navigate('HomeDashboard');
    if (key === 'rewards') parentNav?.navigate('Rewards');
    if (key === 'games') parentNav?.navigate('Games');
    if (key === 'Assistant') parentNav?.navigate('Assistant');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#E8F4FC', '#F0F9FF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Animated.View style={[styles.orbWrap, orbStyle]}>
          <NeuralOrb size={88} />
        </Animated.View>
        <Animated.Text style={[styles.title, titleStyle]}>
          Let's build your recovery roadmap.
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, subStyle]}>
          A personalized plan powered by AI, designed around your habits and triggers.
        </Animated.Text>
        <Animated.View style={[styles.ctaWrap, ctaStyle]}>
          {isPlanHydrating || isFetchingPlan ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.loadingText}>Loading your plan...</Text>
            </View>
          ) : (
            <>
              <PrimaryButton
                label="Start Quick Assessment"
                onPress={() => navigation.navigate('Assessment')}
                pulse
                showArrow={true}
              />
              <Text style={styles.xpHint}>+10 XP for taking the first step</Text>
            </>
          )}
          {!!planError && !isPlanHydrating && !isFetchingPlan && (
            <Text style={styles.errorText}>{planError}</Text>
          )}
        </Animated.View>
      </View>
      <BottomNav
        activeKey="planner"
        onSelect={handleNavSelect}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  orbWrap: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  ctaWrap: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: spacing.md,
  },
  xpHint: {
    ...typography.caption,
    color: colors.milestone,
    marginTop: spacing.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
  },
});
