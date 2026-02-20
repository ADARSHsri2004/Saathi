import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { profileColors } from './profileColors';
import { spacing, typography, borderRadius } from '../../theme';

interface StreakCircleProps {
  streakDays: number;
}

export function StreakCircle({ streakDays }: StreakCircleProps) {
  const ringRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    const progress = Math.min(1, streakDays / 30);
    ringRotation.value = withTiming(progress, { duration: 1000 });
    if (streakDays > 7) {
      glowOpacity.value = withTiming(0.5, { duration: 800 });
    }
  }, [streakDays]);

  const ringStyle = useAnimatedStyle(() => {
    const rotation = -90 + ringRotation.value * 360;
    return { transform: [{ rotate: `${rotation}deg` }] };
  });

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  return (
    <View style={styles.wrapper}>
      {streakDays > 7 && (
        <Animated.View style={[styles.glow, glowStyle]} />
      )}
      <View style={styles.ringTrack}>
        <Animated.View
          style={[
            styles.ringFill,
            ringStyle,
          ]}
        />
      </View>
      <View style={styles.inner}>
        <Text style={styles.number}>{streakDays}</Text>
        <Text style={styles.unit}>Days</Text>
        <Text style={styles.label}>Current Streak</Text>
      </View>
    </View>
  );
}

const SIZE = 180;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZE / 2,
    backgroundColor: profileColors.streak,
    shadowColor: profileColors.streak,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  ringTrack: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: STROKE,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringFill: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: STROKE,
    borderColor: 'transparent',
    borderTopColor: profileColors.streak,
    borderRightColor: profileColors.streak,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 42,
    fontWeight: '700',
    color: profileColors.text,
    letterSpacing: -1,
  },
  unit: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  label: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
});
