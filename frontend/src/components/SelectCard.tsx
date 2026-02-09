import React, { useCallback, useRef, useEffect } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../theme';

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

type SelectCardProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function SelectCard({ label, selected, onSelect }: SelectCardProps) {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(selected ? 1 : 0);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    borderOpacity.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const handleTap = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectRef.current();
  }, []);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, SPRING_CONFIG);
    })
    .onFinalize((_, success) => {
      scale.value = withSpring(1, SPRING_CONFIG);
      if (success) {
        runOnJS(handleTap)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: `rgba(90, 154, 122, ${borderOpacity.value})`,
    backgroundColor: interpolateColor(
      borderOpacity.value,
      [0, 1],
      [colors.backgroundCard, colors.accentSoft]
    ),
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '500',
  },
});
