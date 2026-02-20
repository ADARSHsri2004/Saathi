import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { scale as scaleSize, scaleFont, isSmallScreen } from '../../utils/responsive';
import { CircularProgressRing } from '../CircularProgressRing';

interface LevelProgressBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  scrollY: SharedValue<number>;
}

export function LevelProgressBar({
  level,
  xp,
  xpToNextLevel,
  scrollY,
}: LevelProgressBarProps) {
  const smallScreen = isSmallScreen();
  const containerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.8], 'clamp');
    return { opacity };
  });

  return (
    <Animated.View style={[styles.container, containerStyle, { padding: smallScreen ? spacing.md : spacing.lg }]}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.xpText}>
          {xp} / {xpToNextLevel} XP
        </Text>
      </View>
      <View style={styles.ringWrap}>
        <CircularProgressRing
          value={xpToNextLevel > 0 ? xp : 0}
          maxValue={xpToNextLevel > 0 ? xpToNextLevel : 1}
          radius={smallScreen ? 44 : 52}
          duration={1200}
          title="XP"
          titleColor={colors.textPrimary}
          subtitleColor={colors.textSecondary}
          progressValueColor={colors.accent}
          activeStrokeColor="#6366F1"
          inActiveStrokeColor={colors.progressBackground}
          progressFormatter={(v) => `${Math.round(v)}`}
          showProgressValue={true}
        />
      </View>
      <Text style={styles.nextLevelHint}>
        {xpToNextLevel - xp} XP to Level {level + 1}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelText: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  xpText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  ringWrap: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  nextLevelHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
