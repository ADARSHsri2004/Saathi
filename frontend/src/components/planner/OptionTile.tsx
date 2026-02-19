import React, { useCallback, useRef, useEffect } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { PLANNER_SPRING } from '../../constants/plannerAnimations';

type OptionTileProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function OptionTile({ label, selected, onSelect }: OptionTileProps) {
  const scale = useSharedValue(1);
  const activeValue = useSharedValue(selected ? 1 : 0);
  const checkOpacity = useSharedValue(selected ? 1 : 0);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    activeValue.value = withTiming(selected ? 1 : 0, { duration: 200 });
    checkOpacity.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const handleTap = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectRef.current();
  }, []);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, PLANNER_SPRING);
    })
    .onFinalize((_, success) => {
      scale.value = withSpring(1, PLANNER_SPRING);
      if (success) runOnJS(handleTap)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      activeValue.value,
      [0, 1],
      [colors.backgroundCard, colors.accentSoft]
    ),
    borderColor: interpolateColor(
      activeValue.value,
      [0, 1],
      [colors.borderLight, colors.accent]
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.tile, animatedStyle]}>
        <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={2}>
          {label}
        </Text>
        <Animated.View style={[styles.checkWrap, checkStyle]}>
          <Feather name="check-circle" size={22} color={colors.accent} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  checkWrap: {
    marginLeft: spacing.sm,
  },
});
