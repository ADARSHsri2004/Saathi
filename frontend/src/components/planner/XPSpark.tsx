import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography } from '../../theme';

type XPSparkProps = {
  value: number;
  visible: boolean;
};

export function XPSpark({ value, visible }: XPSparkProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(400, withTiming(0, { duration: 250 }))
      );
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      translateY.value = withDelay(200, withTiming(-12, { duration: 300 }));
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = 0.6;
      translateY.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.text, animatedStyle]}>
      +{value} XP
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.caption,
    color: colors.milestone,
    fontWeight: '600',
  },
});
