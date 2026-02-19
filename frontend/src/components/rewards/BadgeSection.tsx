import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { BadgeCard } from './BadgeCard';
import type { Badge } from './types';

interface BadgeSectionProps {
  title: string;
  badges: Badge[];
  onBadgePress: (badge: Badge) => void;
  scrollY: SharedValue<number>;
}

export function BadgeSection({
  title,
  badges,
  onBadgePress,
  scrollY,
}: BadgeSectionProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    const scrollOpacity = interpolate(
      scrollY.value,
      [200, 400],
      [1, 0.95],
      'clamp'
    );
    return {
      opacity: opacity.value * scrollOpacity,
      transform: [{ translateY: translateY.value }],
    };
  });

  const getCategoryIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'consistency':
        return 'calendar-check';
      case 'resilience':
        return 'shield-check';
      case 'self-control':
        return 'hand-okay';
      case 'growth':
        return 'trending-up';
      default:
        return 'medal';
    }
  };

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(title) as any}
              size={20}
              color={colors.accent}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.count}>{badges.length}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesContainer}
      >
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            onPress={() => onBadgePress(badge)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  badgesContainer: {
    paddingRight: spacing.lg,
  },
});
