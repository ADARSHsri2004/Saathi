import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

export type BottomNavKey =
  | 'planner'
  | 'rewards'
  | 'progress'
  | 'voice'
  | 'games';

type NavItem = {
  key: BottomNavKey;
  label: string;
  icon: React.ReactNode;
};

type BottomNavProps = {
  activeKey: BottomNavKey;
  onSelect?: (key: BottomNavKey) => void;
  bottomInset?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function NavButton({
  item,
  active,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140 });
      }}
      onPress={onPress}
      style={[styles.navItem, animatedStyle, active && styles.navItemActive]}
    >
      <View style={[styles.iconWrap, active && styles.iconWrapActive]}>{item.icon}</View>
      <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
    </AnimatedPressable>
  );
}

export function BottomNav({ activeKey, onSelect, bottomInset = 0 }: BottomNavProps) {
  const items: NavItem[] = [
    {
      key: 'planner',
      label: 'Planner',
      icon: <Feather name="calendar" size={18} color={colors.textSecondary} />,
    },
    {
      key: 'rewards',
      label: 'Rewards',
      icon: <MaterialCommunityIcons name="medal-outline" size={18} color={colors.textSecondary} />,
    },
    {
      key: 'progress',
      label: 'Progress',
      icon: <Ionicons name="pulse" size={18} color={colors.accent} />,
    },
    {
      key: 'voice',
      label: 'AI Voice',
      icon: <MaterialCommunityIcons name="microphone-outline" size={18} color={colors.textSecondary} />,
    },
    {
      key: 'games',
      label: 'Games',
      icon: <Ionicons name="game-controller-outline" size={18} color={colors.textSecondary} />,
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottomInset, spacing.sm) }]}>
      <View style={styles.row}>
        {items.map((item) => (
          <NavButton
            key={item.key}
            item={{
              ...item,
              icon:
                item.key === 'progress'
                  ? <Ionicons name="pulse" size={20} color={colors.accent} />
                  : item.icon,
            }}
            active={item.key === activeKey}
            onPress={() => onSelect?.(item.key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backgroundElevated,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  navItemActive: {
    transform: [{ translateY: -2 }],
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
