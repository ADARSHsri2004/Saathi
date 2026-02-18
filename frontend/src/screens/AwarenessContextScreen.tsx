import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton, ProgressIndicator, SelectCard, MultiSelectPill } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import type { AddictionType, WhenItHappens, FeelAfter } from '../context/OnboardingContext';
import { colors, typography, spacing } from '../theme';
import type { OnboardingStackParamList } from '../navigation/OnboardingStack';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'AwarenessContext'>;

const ADDICTION_OPTIONS: { id: AddictionType; label: string }[] = [
  { id: 'smoking', label: 'Smoking' },
  { id: 'alcohol', label: 'Alcohol' },
];

const WHEN_OPTIONS: { id: WhenItHappens; label: string }[] = [
  { id: 'stressed', label: "When I'm stressed" },
  { id: 'bored', label: "When I'm bored" },
  { id: 'late_night', label: 'Late at night' },
  { id: 'after_bad_day', label: 'After a bad day' },
  { id: 'habit_autopilot', label: 'Habit / autopilot' },
  { id: 'not_sure', label: "I'm not sure" },
];

const FEEL_OPTIONS: { id: FeelAfter; label: string }[] = [
  { id: 'guilty', label: 'Guilty' },
  { id: 'empty', label: 'Empty' },
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'numb', label: 'Numb' },
  { id: 'regretful', label: 'Regretful' },
  { id: 'no_strong_feeling', label: 'No strong feeling' },
];

export function AwarenessContextScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const {
    state,
    setAddictionTypes,
    setWhenItHappens,
    setFeelAfter,
  } = useOnboarding();

  const toggleAddiction = (id: AddictionType) => {
    setAddictionTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleWhen = (id: WhenItHappens) => {
    setWhenItHappens((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.progress}>
        <ProgressIndicator currentStep={2} />
      </View>

      <Text style={styles.sectionTitle}>Type of addiction</Text>
      <Text style={styles.hint}>You can choose more than one. No right or wrong answers.</Text>
      <View style={styles.cardGrid}>
        {ADDICTION_OPTIONS.map((opt) => (
          <SelectCard
            key={opt.id}
            label={opt.label}
            selected={state.addictionTypes.includes(opt.id)}
            onSelect={() => toggleAddiction(opt.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>When does it usually happen?</Text>
      <View style={styles.pillRow}>
        {WHEN_OPTIONS.map((opt) => (
          <MultiSelectPill
            key={opt.id}
            label={opt.label}
            selected={state.whenItHappens.includes(opt.id)}
            onSelect={() => toggleWhen(opt.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>How does it usually make you feel afterward?</Text>
      <View style={styles.pillRow}>
        {FEEL_OPTIONS.map((opt) => (
          <MultiSelectPill
            key={opt.id}
            label={opt.label}
            selected={state.feelAfter === opt.id}
            onSelect={() => setFeelAfter(state.feelAfter === opt.id ? null : opt.id)}
            singleSelect
          />
        ))}
      </View>

      <View style={styles.ctaWrap}>
        <PrimaryButton label="Next" onPress={() => navigation.navigate('PatternsImpact')} />
      </View>
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
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  ctaWrap: {
    marginTop: spacing.md,
  },
});
