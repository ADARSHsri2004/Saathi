import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { PLANNER_DURATION } from '../../constants/plannerAnimations';

type QuestionCardProps = {
  step: number;
  totalSteps: number;
  question: string;
  encouragement?: string;
  children: React.ReactNode;
};

export function QuestionCard({
  step,
  totalSteps,
  question,
  encouragement,
  children,
}: QuestionCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(PLANNER_DURATION).springify()}
      style={styles.card}
    >
      <Text style={styles.stepLabel}>
        Step {step} of {totalSteps}
      </Text>
      <Text style={styles.question}>{question}</Text>
      {encouragement ? (
        <Text style={styles.encouragement}>{encouragement}</Text>
      ) : null}
      <View style={styles.options}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  question: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  encouragement: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  options: {
    marginTop: spacing.sm,
  },
});
