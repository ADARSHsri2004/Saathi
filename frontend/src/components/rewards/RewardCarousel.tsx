import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { Reward } from './types';
import { SCREEN_WIDTH, getCardWidth, scale as scaleSize, scaleFont, isSmallScreen } from '../../utils/responsive';

const CARD_WIDTH = getCardWidth(75, 280, 400);
const CARD_SPACING = spacing.md;

interface RewardCarouselProps {
  rewards: Reward[];
  scrollY: SharedValue<number>;
}

export function RewardCarousel({ rewards, scrollY }: RewardCarouselProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const smallScreen = isSmallScreen();

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    const scrollOpacity = interpolate(
      scrollY.value,
      [300, 500],
      [1, 0.95],
      'clamp'
    );
    return {
      opacity: opacity.value * scrollOpacity,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.header}>
        <Text style={styles.title}>Unlockable Rewards</Text>
        <Text style={styles.subtitle}>Redeem your progress</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
      >
        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function RewardCard({ reward }: { reward: Reward }) {
  const cardScale = useSharedValue(1);
  const rotateY = useSharedValue(0);
  const smallScreen = isSmallScreen();

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <LinearGradient
        colors={
          reward.unlocked
            ? ['#6366F1', '#8B5CF6', '#A855F7']
            : ['#E5E7EB', '#D1D5DB', '#9CA3AF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardGradient, { 
          padding: smallScreen ? spacing.lg : spacing.xl,
          minHeight: smallScreen ? scaleSize(180) : scaleSize(200),
        }]}
      >
        {!reward.unlocked && (
          <View style={styles.lockOverlay}>
            <MaterialCommunityIcons
              name="lock"
              size={24}
              color={colors.textMuted}
            />
          </View>
        )}

        <View style={styles.cardContent}>
          <View
            style={[
              styles.iconContainer,
              !reward.unlocked && styles.iconContainerLocked,
              {
                width: smallScreen ? scaleSize(56) : scaleSize(64),
                height: smallScreen ? scaleSize(56) : scaleSize(64),
                borderRadius: smallScreen ? scaleSize(28) : scaleSize(32),
              }
            ]}
          >
            <MaterialCommunityIcons
              name={reward.icon as any}
              size={smallScreen ? scaleSize(28) : scaleSize(32)}
              color={reward.unlocked ? '#FFFFFF' : colors.textMuted}
            />
          </View>

          <Text
            style={[
              styles.cardTitle,
              !reward.unlocked && styles.cardTitleLocked,
            ]}
          >
            {reward.title}
          </Text>
          <Text
            style={[
              styles.cardDescription,
              !reward.unlocked && styles.cardDescriptionLocked,
            ]}
          >
            {reward.description}
          </Text>

          <View style={styles.costContainer}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={16}
              color={reward.unlocked ? '#FFD700' : colors.textMuted}
            />
            <Text
              style={[
                styles.cost,
                !reward.unlocked && styles.costLocked,
              ]}
            >
              {reward.cost.toLocaleString()} XP
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  carousel: {
    paddingRight: spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  cardGradient: {
    padding: spacing.xl,
    minHeight: 200,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
  },
  cardContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  cardTitleLocked: {
    color: colors.textMuted,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  cardDescriptionLocked: {
    color: colors.textMuted,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  cost: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  costLocked: {
    color: colors.textMuted,
  },
});
