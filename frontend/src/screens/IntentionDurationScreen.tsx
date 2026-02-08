import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PrimaryButton, ProgressIndicator, MultiSelectPill } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import type { Intention, Duration } from '../context/OnboardingContext';
import { colors, typography, spacing } from '../theme';
import type { OnboardingStackParamList } from '../navigation/OnboardingStack';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'IntentionDuration'>;

const INTENTION_OPTIONS: { id: Intention; label: string }[] = [
  { id: 'reduce', label: 'Reduce' },
  { id: 'pause', label: 'Pause' },
  { id: 'just_understand', label: 'Just understand' },
];

const DURATION_OPTIONS: { id: Duration; label: string }[] = [
  { id: '7_days', label: '7 days' },
  { id: '14_days', label: '14 days' },
  { id: '30_days', label: '30 days' },
  { id: 'not_sure', label: 'Not sure' },
];

export function IntentionDurationScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { state, setIntention, setDuration } = useOnboarding();
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const canFinish = state.intention != null && state.duration != null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.progress}>
        <ProgressIndicator currentStep={4} />
      </View>

      <Text style={styles.sectionTitle}>What would you like to work on right now?</Text>
      <View style={styles.pillRow}>
        {INTENTION_OPTIONS.map((opt) => (
          <MultiSelectPill
            key={opt.id}
            label={opt.label}
            selected={state.intention === opt.id}
            onSelect={() => setIntention(state.intention === opt.id ? null : opt.id)}
            singleSelect
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>How long do you want to try?</Text>
      <View style={styles.pillRow}>
        {DURATION_OPTIONS.map((opt) => (
          <MultiSelectPill
            key={opt.id}
            label={opt.label}
            selected={state.duration === opt.id}
            onSelect={() => setDuration(state.duration === opt.id ? null : opt.id)}
            singleSelect
          />
        ))}
      </View>

      <Text style={styles.hint}>You can change this anytime.</Text>

      <Animated.View style={[styles.ctaWrap, ctaAnimatedStyle]}>
        <PrimaryButton
          label="Start my journey"
          onPress={() => navigation.navigate('Complete')}
          disabled={!canFinish}
          pulse={false}
          showArrow={false}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  progress: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  ctaWrap: {
    marginTop: spacing.md,
  },
});
