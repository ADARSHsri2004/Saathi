import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '../theme';

export type AppSliderProps = {
  value: number;
  minimumValue: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
  step?: number;
  label?: string;
  valueSuffix?: string;
  valueFormatter?: (value: number) => string;
  showValue?: boolean;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: ViewStyle;
};

export function AppSlider({
  value,
  minimumValue,
  maximumValue,
  onValueChange,
  step,
  label,
  valueSuffix,
  valueFormatter,
  showValue = true,
  minimumTrackTintColor = colors.progressFill,
  maximumTrackTintColor = colors.progressBackground,
  thumbTintColor = colors.accent,
  style,
}: AppSliderProps) {
  const handleChange = (raw: number) => {
    const v = step != null
      ? Math.round(raw / step) * step
      : raw;
    const clamped = Math.max(minimumValue, Math.min(maximumValue, v));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onValueChange(clamped);
  };

  const displayValue = valueFormatter
    ? valueFormatter(value)
    : valueSuffix
      ? `${value} ${valueSuffix}`
      : String(value);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {showValue ? (
        <Text style={styles.valueText}>{displayValue}</Text>
      ) : null}
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        value={value}
        onValueChange={handleChange}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
        step={step}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  valueText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
