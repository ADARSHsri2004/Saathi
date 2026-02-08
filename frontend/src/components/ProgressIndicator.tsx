import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../theme/index'

const TOTAL_STEPS = 5; // Intro + 4 onboarding screens

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps?: number;
};

export function ProgressIndicator({
  currentStep,
  totalSteps = TOTAL_STEPS,
}: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <StepDot
          key={index}
          index={index}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      ))}
    </View>
  );
}

function StepDot({
  index,
  currentStep,
  totalSteps,
}: {
  index: number;
  currentStep: number;
  totalSteps: number;
}) {
  const isActive = index === currentStep;
  const isPast = index < currentStep;

  const progress = useDerivedValue(() => {
    if (index < currentStep) return 1;
    if (index === currentStep) return 1;
    return 0;
  }, [currentStep, index]);

  const animatedStyle = useAnimatedStyle(() => {
    const width = isPast || isActive ? 24 : 8;
    return {
      width: withTiming(width, { duration: 300 }),
      backgroundColor: isPast || isActive ? colors.accent : colors.backgroundCardHover,
      opacity: withTiming(isPast || isActive ? 1 : 0.5, { duration: 200 }),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
  },
});
