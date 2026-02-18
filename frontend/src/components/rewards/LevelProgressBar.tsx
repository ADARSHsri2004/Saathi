import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { scale as scaleSize, scaleFont, isSmallScreen } from '../../utils/responsive';

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
  const progress = useSharedValue(0);
  const orbPosition = useSharedValue(0);
  const shimmerOffset = useSharedValue(-100);
  const smallScreen = isSmallScreen();

  useEffect(() => {
    const progressValue = xp / xpToNextLevel;
    progress.value = withSpring(progressValue, { damping: 15 });
    orbPosition.value = withSpring(progressValue * 100, { damping: 15 });
    shimmerOffset.value = withRepeat(
      withTiming(400, { duration: 2000 }),
      -1,
      false
    );
  }, [xp, xpToNextLevel]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    left: `${orbPosition.value}%`,
    transform: [{ translateX: -12 }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

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

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          >
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.orb, orbStyle]}>
          <LinearGradient
            colors={['#FFFFFF', '#E0E7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          />
        </Animated.View>
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
  progressTrack: {
    height: 16,
    backgroundColor: colors.progressBackground,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progressGradient: {
    flex: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
  },
  orb: {
    position: 'absolute',
    top: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  orbGradient: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  nextLevelHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
