import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { profileColors } from './profileColors';
import { spacing, typography, borderRadius } from '../../theme';

interface HeroCardProps {
  username: string;
  userId?: string;
  level: number;
  xpPoints: number;
  xpToNextLevel: number;
  dynamicMessage: string;
}

export function HeroCard({
  username,
  userId,
  level,
  xpPoints,
  xpToNextLevel,
  dynamicMessage,
}: HeroCardProps) {
  const slide = useSharedValue(-30);
  const opacity = useSharedValue(0);
  const xpFill = useSharedValue(0);
  const badgeScale = useSharedValue(1);
  const particleY1 = useSharedValue(0);
  const particleY2 = useSharedValue(0);

  const currentLevelXp = Math.max(0, xpPoints - (level - 1) * 500);

  useEffect(() => {
    slide.value = withSpring(0, { damping: 18 });
    opacity.value = withTiming(1, { duration: 600 });
    const ratio = xpToNextLevel > 0 ? currentLevelXp / xpToNextLevel : 0;
    xpFill.value = withTiming(Math.min(1, Math.max(0, ratio)), { duration: 1200 });
    badgeScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
    particleY1.value = withRepeat(
      withSequence(withTiming(-8, { duration: 2 }), withTiming(0, { duration: 2 })),
      -1,
      true
    );
    particleY2.value = withRepeat(
      withSequence(withTiming(-12, { duration: 2.5 }), withTiming(0, { duration: 2.5 })),
      -1,
      true
    );
  }, [currentLevelXp, xpToNextLevel]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: slide.value }],
  }));

  const xpBarStyle = useAnimatedStyle(() => ({
    width: `${xpFill.value * 100}%`,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const p1Style = useAnimatedStyle(() => ({ transform: [{ translateY: particleY1.value }] }));
  const p2Style = useAnimatedStyle(() => ({ transform: [{ translateY: particleY2.value }] }));

  return (
    <Animated.View style={[styles.wrapper, containerStyle]}>
      <LinearGradient
        colors={[profileColors.gradientStart, profileColors.gradientMid, profileColors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.particle, styles.p1, p1Style]} />
        <Animated.View style={[styles.particle, styles.p2, p2Style]} />
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <MaterialCommunityIcons name="account" size={40} color={profileColors.text} />
          </View>
        </View>
        <Text style={styles.username}>{username?.trim() || 'You'}</Text>
        {userId ? <Text style={styles.userId}>ID: {userId}</Text> : null}
        <Animated.View style={[styles.levelBadge, badgeStyle]}>
          <Text style={styles.levelText}>Level {level}</Text>
        </Animated.View>
        <Text style={styles.message}>{dynamicMessage}</Text>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>XP</Text>
          <View style={styles.xpTrack}>
            <Animated.View style={[styles.xpFill, xpBarStyle]} />
          </View>
          <Text style={styles.xpValue}>{currentLevelXp} / {xpToNextLevel}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  gradient: {
    padding: spacing.xl,
    position: 'relative',
    minHeight: 160,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  p1: { left: '15%', top: '20%' },
  p2: { right: '20%', top: '35%' },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  avatarInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    ...typography.title,
    fontWeight: '700',
    color: profileColors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  userId: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  levelBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    backgroundColor: profileColors.xp,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  levelText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: profileColors.text,
  },
  message: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    width: 24,
  },
  xpTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: profileColors.xp,
  },
  xpValue: {
    ...typography.caption,
    color: profileColors.text,
    fontWeight: '600',
  },
});
