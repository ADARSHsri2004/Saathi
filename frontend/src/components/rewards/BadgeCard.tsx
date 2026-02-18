import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { Badge } from './types';
import { scale as scaleSize, scaleFont, isSmallScreen } from '../../utils/responsive';

interface BadgeCardProps {
  badge: Badge;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BadgeCard({ badge, onPress }: BadgeCardProps) {
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const progress = useSharedValue(badge.progress);
  const glowOpacity = useSharedValue(badge.unlocked ? 0.6 : 0);
  const smallScreen = isSmallScreen();

  useEffect(() => {
    progress.value = withTiming(badge.progress, { duration: 1000 });
    if (badge.unlocked) {
      glowOpacity.value = withTiming(0.6, { duration: 500 });
    }
  }, [badge.progress, badge.unlocked]);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const progressRingStyle = useAnimatedStyle(() => {
    const rotation = progress.value * 360;
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const tap = Gesture.Tap().onFinalize(() => {
    runOnJS(handlePress)();
  });

  return (
    <GestureDetector gesture={tap}>
      <AnimatedPressable style={[styles.container, cardStyle, { width: smallScreen ? scaleSize(120) : scaleSize(140) }]}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <View style={styles.card}>
          {!badge.unlocked && (
            <View style={styles.lockOverlay} />
          )}

          <View style={[styles.badgeContainer, {
            width: smallScreen ? scaleSize(70) : scaleSize(80),
            height: smallScreen ? scaleSize(70) : scaleSize(80),
          }]}>
            <View style={[styles.progressRing, {
              width: smallScreen ? scaleSize(70) : scaleSize(80),
              height: smallScreen ? scaleSize(70) : scaleSize(80),
              borderRadius: smallScreen ? scaleSize(35) : scaleSize(40),
              borderWidth: smallScreen ? 2.5 : 3,
            }]}>
              <Animated.View
                style={[
                  styles.progressRingFill,
                  progressRingStyle,
                  {
                    width: smallScreen ? scaleSize(70) : scaleSize(80),
                    height: smallScreen ? scaleSize(70) : scaleSize(80),
                    borderRadius: smallScreen ? scaleSize(35) : scaleSize(40),
                    borderWidth: smallScreen ? 2.5 : 3,
                  }
                ]}
              />
            </View>

            <View
              style={[
                styles.badgeIcon,
                !badge.unlocked && styles.badgeIconLocked,
                {
                  width: smallScreen ? scaleSize(56) : scaleSize(64),
                  height: smallScreen ? scaleSize(56) : scaleSize(64),
                  borderRadius: smallScreen ? scaleSize(28) : scaleSize(32),
                }
              ]}
            >
              <MaterialCommunityIcons
                name={badge.icon as any}
                size={smallScreen ? scaleSize(28) : scaleSize(32)}
                color={badge.unlocked ? '#FFD700' : colors.textMuted}
              />
            </View>
          </View>

          <Text
            style={[
              styles.title,
              !badge.unlocked && styles.titleLocked,
            ]}
            numberOfLines={1}
          >
            {badge.title}
          </Text>
          <Text
            style={[
              styles.description,
              !badge.unlocked && styles.descriptionLocked,
              { fontSize: smallScreen ? scaleFont(10) : scaleFont(11) }
            ]}
            numberOfLines={2}
          >
            {badge.description}
          </Text>

          {!badge.unlocked && (
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: `${progress.value * 100}%` },
                ]}
              />
            </View>
          )}
        </View>
      </AnimatedPressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: borderRadius.lg + 4,
    backgroundColor: '#FFD700',
    opacity: 0.6,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    borderColor: colors.progressBackground,
  },
  progressRingFill: {
    position: 'absolute',
    borderColor: 'transparent',
    borderTopColor: colors.accent,
    borderRightColor: colors.accent,
    transform: [{ rotate: '-90deg' }],
  },
  badgeIcon: {
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconLocked: {
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  titleLocked: {
    color: colors.textMuted,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  descriptionLocked: {
    color: colors.textMuted,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.progressBackground,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
});
