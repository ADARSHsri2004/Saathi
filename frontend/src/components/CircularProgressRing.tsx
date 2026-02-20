import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import CircularProgress, { CircularProgressBase } from 'react-native-circular-progress-indicator';

export interface CircularProgressRingProps {
  value: number;
  maxValue?: number;
  radius?: number;
  duration?: number;
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  progressValueColor?: string;
  activeStrokeColor?: string;
  inActiveStrokeColor?: string;
  inActiveStrokeOpacity?: number;
  activeStrokeWidth?: number;
  inActiveStrokeWidth?: number;
  valueSuffix?: string;
  valuePrefix?: string;
  showProgressValue?: boolean;
  progressFormatter?: (value: number) => string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const defaultTextColor = '#ecf0f1';
const defaultActive = '#2ecc71';
const defaultInactive = 'rgba(255,255,255,0.25)';

export function CircularProgressRing({
  value,
  maxValue = 100,
  radius = 90,
  duration = 1200,
  title,
  subtitle,
  titleColor = defaultTextColor,
  subtitleColor = defaultTextColor,
  progressValueColor = defaultTextColor,
  activeStrokeColor = defaultActive,
  inActiveStrokeColor = defaultInactive,
  inActiveStrokeOpacity = 0.5,
  activeStrokeWidth = 10,
  inActiveStrokeWidth = 10,
  valueSuffix = '',
  valuePrefix = '',
  showProgressValue = true,
  progressFormatter,
  children,
  style,
}: CircularProgressRingProps) {
  const baseProps = {
    value,
    maxValue,
    radius,
    duration,
    activeStrokeColor,
    inActiveStrokeColor,
    inActiveStrokeOpacity,
    activeStrokeWidth,
    inActiveStrokeWidth,
    progressValueColor,
    valueSuffix,
    valuePrefix,
    showProgressValue,
    progressFormatter,
  };

  if (children != null) {
    return (
      <View style={[styles.wrapper, style]}>
        <CircularProgressBase {...baseProps}>
          {children}
        </CircularProgressBase>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <CircularProgress
        {...baseProps}
        title={title ?? ''}
        subtitle={subtitle ?? ''}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
