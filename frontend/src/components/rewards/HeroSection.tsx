import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { SCREEN_WIDTH, scale as scaleSize, scaleFont, isSmallScreen } from '../../utils/responsive';
import { CircularProgressRing } from '../CircularProgressRing';

interface HeroSectionProps {
  streak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  identityTitle: string;
}

export function HeroSection({
  streak,
  level,
  xp,
  xpToNextLevel,
  identityTitle,
}: HeroSectionProps) {
  const streakValue = useSharedValue(0);
  const titleGlow = useSharedValue(0);
  const particleY1 = useSharedValue(0);
  const particleY2 = useSharedValue(0);
  const particleY3 = useSharedValue(0);

  useEffect(() => {
    streakValue.value = withTiming(streak, { duration: 1500 });
    titleGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      false
    );
    particleY1.value = withRepeat(
      withTiming(-20, { duration: 3000 }),
      -1,
      true
    );
    particleY2.value = withRepeat(
      withTiming(-15, { duration: 2500 }),
      -1,
      true
    );
    particleY3.value = withRepeat(
      withTiming(-25, { duration: 3500 }),
      -1,
      true
    );
  }, []);

  const streakStyle = useAnimatedStyle(() => ({
    opacity: interpolate(streakValue.value, [0, streak], [0, 1]),
  }));

  const titleGlowStyle = useAnimatedStyle(() => ({
    opacity: titleGlow.value,
  }));

  const particle1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particleY1.value }],
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particleY2.value }],
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particleY3.value }],
  }));

  const smallScreen = isSmallScreen();
  
  return (
    <View style={[styles.container, { height: smallScreen ? 280 : 320 }]}>
      <LinearGradient
        colors={['#4A148C', '#7B1FA2', '#9C27B0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.particle, styles.particle1, particle1Style]} />
        <Animated.View style={[styles.particle, styles.particle2, particle2Style]} />
        <Animated.View style={[styles.particle, styles.particle3, particle3Style]} />

        <View style={styles.content}>
          <View style={styles.streakContainer}>
            <Animated.Text style={[styles.streakNumber, streakStyle, { fontSize: smallScreen ? scaleFont(56) : scaleFont(64) }]}>
              {Math.round(streakValue.value)}
            </Animated.Text>
            <Text style={[styles.streakLabel, { fontSize: smallScreen ? scaleFont(14) : scaleFont(16) }]}>Day Streak</Text>
          </View>

          <View style={styles.identityContainer}>
            <Animated.View style={[
              styles.glowCircle, 
              titleGlowStyle,
              {
                width: smallScreen ? scaleSize(180) : scaleSize(200),
                height: smallScreen ? scaleSize(180) : scaleSize(200),
                borderRadius: smallScreen ? scaleSize(90) : scaleSize(100),
                top: smallScreen ? scaleSize(-45) : scaleSize(-50),
              }
            ]} />
            <Text style={[styles.identityTitle, { fontSize: smallScreen ? scaleFont(28) : scaleFont(32) }]}>{identityTitle}</Text>
          </View>

          <View style={styles.xpContainer}>
            <CircularProgressRing
              value={xpToNextLevel > 0 ? xp : 0}
              maxValue={xpToNextLevel > 0 ? xpToNextLevel : 1}
              radius={smallScreen ? 42 : 50}
              duration={1200}
              titleColor="rgba(255,255,255,0.9)"
              subtitleColor="rgba(255,255,255,0.8)"
              progressValueColor="#FFFFFF"
              activeStrokeColor="#FFD700"
              inActiveStrokeColor="rgba(255,255,255,0.2)"
              inActiveStrokeOpacity={0.5}
              showProgressValue={false}
            >
              <View style={[styles.xpRingInner, {
                width: smallScreen ? scaleSize(84) : scaleSize(100),
                height: smallScreen ? scaleSize(84) : scaleSize(100),
                borderRadius: smallScreen ? scaleSize(42) : scaleSize(50),
              }]}>
                <Text style={[styles.levelText, { fontSize: smallScreen ? scaleFont(11) : scaleFont(12) }]}>Level</Text>
                <Text style={[styles.levelNumber, { fontSize: smallScreen ? scaleFont(20) : scaleFont(24) }]}>{level}</Text>
              </View>
            </CircularProgressRing>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  particle1: {
    left: '20%',
    top: '30%',
  },
  particle2: {
    left: '70%',
    top: '50%',
  },
  particle3: {
    left: '50%',
    top: '20%',
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakNumber: {
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  streakLabel: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  identityContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  identityTitle: {
    ...typography.hero,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  xpContainer: {
    alignItems: 'center',
  },
  xpRingInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  levelNumber: {
    ...typography.title,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
