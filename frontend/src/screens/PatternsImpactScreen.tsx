import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton, ProgressIndicator, MultiSelectPill } from '../components/index';
import { useOnboarding } from '../context/OnboardingContext';
import type { Frequency, ImpactArea } from '../context/OnboardingContext';
import { colors, typography, spacing, borderRadius } from '../theme/index';
import type { OnboardingStackParamList } from '../navigation/OnboardingStack';
import { useNavigation } from '@react-navigation/native';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PatternsImpact'>;


const FREQUENCY_OPTIONS: { id: Frequency; label: string }[] = [
  { id: 'once_in_a_while', label: 'Once in a while' },
  { id: 'few_times_week', label: 'A few times a week' },
  { id: 'almost_every_day', label: 'Almost every day' },
  { id: 'multiple_times_day', label: 'Multiple times a day' },
  { id: 'not_sure', label: "I'm not sure" },
];

const IMPACT_OPTIONS: { id: ImpactArea; label: string }[] = [
  { id: 'sleep', label: 'Sleep' },
  { id: 'focus', label: 'Focus / productivity' },
  { id: 'mood', label: 'Mood' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'health', label: 'Health' },
  { id: 'money', label: 'Money' },
  { id: 'not_really', label: 'Not really' },
  { id: 'not_sure', label: "I'm not sure" },
];

export function PatternsImpactScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { state, setFrequency, setMoneySpent, setImpactAreas } = useOnboarding();

  const toggleImpact = (id: ImpactArea) => {
    setImpactAreas((prev) =>
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
        <ProgressIndicator currentStep={3} />
      </View>

      <Text style={styles.helper}>Estimates are okay. You can skip any part.</Text>

      <Text style={styles.sectionTitle}>How often does this usually happen?</Text>
      <View style={styles.pillRow}>
        {FREQUENCY_OPTIONS.map((opt) => (
          <MultiSelectPill
            key={opt.id}
            label={opt.label}
            selected={state.frequency === opt.id}
            onSelect={() => setFrequency(state.frequency === opt.id ? null : opt.id)}
            singleSelect
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Money spent (optional)</Text>
      <TextInput
        style={styles.input}
        value={state.moneySpent}
        onChangeText={setMoneySpent}
        placeholder="e.g. per week or month — skip if you prefer"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
      />

      <Text style={styles.sectionTitle}>Does it affect any of these?</Text>
      <View style={styles.pillRow}>
        {IMPACT_OPTIONS.map((opt) => (
          <MultiSelectPill
            key={opt.id}
            label={opt.label}
            selected={state.impactAreas.includes(opt.id)}
            onSelect={() => toggleImpact(opt.id)}
          />
        ))}
      </View>

      <View style={styles.ctaWrap}>
        <PrimaryButton label="Next" onPress={() => navigation.navigate('IntentionDuration')} />
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
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
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
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  ctaWrap: {
    marginTop: spacing.md,
  },
});
