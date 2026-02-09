import React, { useCallback, useRef } from 'react';
import { Text, StyleSheet, View, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../theme/index';

const AnimatedView = Animated.createAnimatedComponent(View);
const SPRING_CONFIG = { damping: 15, stiffness: 150 };

type MultiSelectPillProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
  singleSelect?: boolean;
};

export function MultiSelectPill({
  label,
  selected,
  onSelect,
  singleSelect = false,
}: MultiSelectPillProps) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(selected ? 1 : 0);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  React.useEffect(() => {
    bgOpacity.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const handleTap = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectRef.current();
  }, []);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.96, SPRING_CONFIG);
    })
    .onFinalize((_, success) => {
      scale.value = withSpring(1, SPRING_CONFIG);
      if (success) {
        runOnJS(handleTap)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: `rgba(90, 154, 122, ${bgOpacity.value * 0.25})`,
    borderColor: `rgba(90, 154, 122, ${bgOpacity.value * 0.6})`,
  }));

  return (
    <GestureDetector gesture={tap}>
      <AnimatedView style={[styles.pill, animatedStyle]}>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
      </AnimatedView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '500',
  },
});
