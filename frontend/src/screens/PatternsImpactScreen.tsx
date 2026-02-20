import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { PrimaryButton, ProgressIndicator } from '../components/index';
import { AppSlider } from '../components/AppSlider';
import { useOnboarding } from '../context/OnboardingContext';
import type { FrequencyUnit, ImpactArea } from '../context/OnboardingContext';
import { colors, typography, spacing, borderRadius } from '../theme/index';

const FREQUENCY_UNIT_OPTIONS: { id: FrequencyUnit; label: string }[] = [
  { id: 'per_week', label: 'Per week' },
  { id: 'per_day', label: 'Per day' },
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

const SLIDER_CONFIG = {
  per_week: { min: 1, max: 50 },
  per_day: { min: 1, max: 20 },
};

function FrequencySegment({
  unit,
  selected,
  onSelect,
}: {
  unit: FrequencyUnit;
  selected: boolean;
  onSelect: () => void;
}) {
  const opt = FREQUENCY_UNIT_OPTIONS.find((o) => o.id === unit)!;
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? colors.accent : colors.backgroundSecondary,
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: progress.value > 0.5 ? colors.textOnAccent : colors.textSecondary,
  }));

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
      style={styles.segmentOption}
    >
      <Animated.View style={[styles.segmentPill, animatedStyle]}>
        <Animated.Text style={[styles.segmentLabel, textStyle]}>{opt.label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export function PatternsImpactScreen() {
  const insets = useSafeAreaInsets();
  const {
    state,
    setFrequencyUnit,
    setFrequencyQuantity,
    setMoneySpent,
    setImpactAreas,
    saveToBackend,
    completeOnboarding,
    markOnboardingComplete,
  } = useOnboarding();
  const [moneySpentError, setMoneySpentError] = React.useState('');

  const { min, max } = SLIDER_CONFIG[state.frequencyUnit];
  const quantity = Math.max(min, Math.min(max, state.frequencyQuantity));

  useEffect(() => {
    const clamped = Math.max(min, Math.min(max, state.frequencyQuantity));
    if (state.frequencyQuantity !== clamped) setFrequencyQuantity(clamped);
  }, [state.frequencyUnit]);

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

      <Text style={styles.helper}>Estimates are okay.</Text>

      <Text style={styles.sectionTitle}>Frequency</Text>
      <View style={styles.segmentRow}>
        {FREQUENCY_UNIT_OPTIONS.map((opt) => (
          <FrequencySegment
            key={opt.id}
            unit={opt.id}
            selected={state.frequencyUnit === opt.id}
            onSelect={() => setFrequencyUnit(opt.id)}
          />
        ))}
      </View>

      <View style={styles.sliderContainer}>
        <AppSlider
          value={quantity}
          minimumValue={SLIDER_CONFIG[state.frequencyUnit].min}
          maximumValue={SLIDER_CONFIG[state.frequencyUnit].max}
          onValueChange={setFrequencyQuantity}
          step={1}
          valueFormatter={(v) =>
            `${v} ${state.frequencyUnit === 'per_week' ? 'times per week' : 'times per day'}`
          }
        />
      </View>

      <Text style={styles.sectionTitle}>
        Money spent ({state.frequencyUnit === 'per_week' ? 'per week' : 'per day'})
      </Text>
      <TextInput
        style={[
          styles.input,
          !!moneySpentError && styles.inputError,
          !moneySpentError && styles.inputMargin,
        ]}
        value={state.moneySpent}
        onChangeText={(t) => {
          setMoneySpent(t);
          if (moneySpentError) setMoneySpentError('');
        }}
        placeholder={
          state.frequencyUnit === 'per_week'
            ? 'e.g. 500 (in ₹)'
            : 'e.g. 100 (in ₹)'
        }
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
      />
      {moneySpentError ? <Text style={styles.errorText}>{moneySpentError}</Text> : null}

      <Text style={styles.sectionTitle}>Does it affect any of these?</Text>
      <View style={styles.pillRow}>
        {IMPACT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            onPress={() => toggleImpact(opt.id)}
            style={[
              styles.impactPill,
              state.impactAreas.includes(opt.id) && styles.impactPillSelected,
            ]}
          >
            <Text
              style={[
                styles.impactPillLabel,
                state.impactAreas.includes(opt.id) && styles.impactPillLabelSelected,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.ctaWrap}>
        <PrimaryButton
          label="Get Started"
          onPress={async () => {
            const trimmed = state.moneySpent?.trim() ?? '';
            if (!trimmed) {
              setMoneySpentError('Please enter how much you spend');
              return;
            }
            setMoneySpentError('');
            try {
              await saveToBackend();
              await completeOnboarding();
              await markOnboardingComplete();
            } catch (err) {
              console.error('Failed to complete onboarding from PatternsImpactScreen:', err);
            }
          }}
        />
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
    marginBottom: spacing.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  segmentOption: {},
  segmentPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  sliderContainer: {
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
    marginBottom: spacing.xs,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputMargin: {
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.xl,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  impactPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  impactPillSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  impactPillLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  impactPillLabelSelected: {
    color: colors.accent,
    fontWeight: '500',
  },
  ctaWrap: {
    marginTop: spacing.md,
  },
});
