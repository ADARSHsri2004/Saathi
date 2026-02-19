import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { PLANNER_DURATION } from '../../constants/plannerAnimations';

type SliderInputProps = {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  valueSuffix?: string;
  onValueChange: (value: number) => void;
};

export function SliderInput({
  value,
  min = 0,
  max = 50,
  label,
  valueSuffix = 'years',
  onValueChange,
}: SliderInputProps) {
  const trackWidth = useSharedValue(0);
  const thumbPos = useSharedValue(0);
  const lastReported = useRef(value);
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const updateValue = useCallback((raw: number) => {
    const v = Math.round(Math.max(min, Math.min(max, raw)));
    if (v !== lastReported.current && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    lastReported.current = v;
    onValueChangeRef.current(v);
  }, [min, max]);

  useEffect(() => {
    const w = trackWidth.value;
    if (w > 0) {
      const p = ((value - min) / (max - min)) * w;
      thumbPos.value = withTiming(p, { duration: PLANNER_DURATION });
    }
  }, [value, min, max]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      trackWidth.value = w;
      const p = ((value - min) / (max - min)) * w;
      thumbPos.value = p;
    },
    [value, min, max]
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const w = trackWidth.value;
      if (w <= 0) return;
      const x = clamp(e.x, 0, w);
      thumbPos.value = x;
      const ratio = x / w;
      const v = min + ratio * (max - min);
      runOnJS(updateValue)(Math.round(v));
    })
    .onEnd((e) => {
      const w = trackWidth.value;
      if (w <= 0) return;
      const x = clamp(e.x, 0, w);
      thumbPos.value = withTiming(x, { duration: 100 });
    });

  const tap = Gesture.Tap()
    .onEnd((e) => {
      const w = trackWidth.value;
      if (w <= 0) return;
      const x = clamp(e.x, 0, w);
      thumbPos.value = withTiming(x, { duration: PLANNER_DURATION });
      const ratio = x / w;
      const v = Math.round(min + ratio * (max - min));
      runOnJS(updateValue)(v);
    });

  const composed = Gesture.Race(pan, tap);

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbPos.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPos.value - 12 }],
  }));

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={styles.valueText}>
        {value} {valueSuffix}
      </Text>
      <GestureDetector gesture={composed}>
        <View style={styles.trackWrap} onLayout={onLayout}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fillStyle]} />
          </View>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: spacing.md,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  valueText: {
    ...typography.title,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  trackWrap: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressBackground,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    left: 0,
    top: 8,
    marginTop: -12,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});
