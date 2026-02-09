import React, { useCallback, useEffect, useRef } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { PrimaryButton, ProgressIndicator } from '../components/index';
import { useOnboarding } from '../context/OnboardingContext';
import type { FrequencyUnit, ImpactArea } from '../context/OnboardingContext';
import { colors, typography, spacing, borderRadius } from '../theme/index';
import type { OnboardingStackParamList } from '../navigation/OnboardingStack';
import { useNavigation } from '@react-navigation/native';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PatternsImpact'>;

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

const SPRING_CONFIG = { damping: 20, stiffness: 200 };

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

function FrequencySlider({
  unit,
  value,
  onValueChange,
}: {
  unit: FrequencyUnit;
  value: number;
  onValueChange: (v: number) => void;
}) {
  const { min, max } = SLIDER_CONFIG[unit];
  const trackWidth = useSharedValue(280);
  const rawValue = useSharedValue((value - min) / (max - min));

  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  useEffect(() => {
    const norm = (value - min) / (max - min);
    rawValue.value = withSpring(norm, SPRING_CONFIG);
  }, [value, min, max]);

  const updateValue = useCallback(
    (norm: number) => {
      const v = Math.round(min + norm * (max - min));
      onValueChangeRef.current(Math.max(min, Math.min(max, v)));
    },
    [min, max]
  );

  const PAD = 12;
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (trackWidth.value <= 0) return;
      const norm = Math.max(0, Math.min(1, (e.x - PAD) / trackWidth.value));
      rawValue.value = norm;
      runOnJS(updateValue)(norm);
    })
    .onEnd(() => {
      if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });

  const tap = Gesture.Tap()
    .onEnd((e) => {
      if (trackWidth.value <= 0) return;
      const norm = Math.max(0, Math.min(1, (e.x - PAD) / trackWidth.value));
      rawValue.value = withSpring(norm, SPRING_CONFIG);
      runOnJS(updateValue)(norm);
      if (Platform.OS === 'ios') runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: rawValue.value * trackWidth.value + 12,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rawValue.value * trackWidth.value }],
  }));

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderLabelRow}>
        <Text style={styles.sliderValue}>
          {value} {unit === 'per_week' ? 'times per week' : 'times per day'}
        </Text>
      </View>
      <GestureDetector gesture={Gesture.Race(pan, tap)}>
        <View
          style={styles.sliderTrackWrap}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width - 24;
            if (w > 0) trackWidth.value = w;
          }}
        >
          <View style={styles.sliderTrack} />
          <Animated.View style={[styles.sliderFill, fillStyle]} />
          <Animated.View style={[styles.sliderThumb, thumbStyle]}>
            <View style={styles.sliderThumbInner} />
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={styles.sliderMinMax}>
        <Text style={styles.sliderMinMaxText}>{min}</Text>
        <Text style={styles.sliderMinMaxText}>{max}</Text>
      </View>
    </View>
  );
}

export function PatternsImpactScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const {
    state,
    setFrequencyUnit,
    setFrequencyQuantity,
    setMoneySpent,
    setImpactAreas,
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

      <FrequencySlider
        unit={state.frequencyUnit}
        value={quantity}
        onValueChange={setFrequencyQuantity}
      />

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
          label="Next"
          onPress={() => {
            const trimmed = state.moneySpent?.trim() ?? '';
            if (!trimmed) {
              setMoneySpentError('Please enter how much you spend');
              return;
            }
            setMoneySpentError('');
            navigation.navigate('IntentionDuration');
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
  sliderLabelRow: {
    marginBottom: spacing.xs,
  },
  sliderValue: {
    ...typography.titleSmall,
    color: colors.accent,
  },
  sliderTrackWrap: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sliderTrack: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  sliderFill: {
    position: 'absolute',
    left: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentSoft,
  },
  sliderThumb: {
    position: 'absolute',
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderThumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  sliderMinMax: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  sliderMinMaxText: {
    ...typography.caption,
    color: colors.textMuted,
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
