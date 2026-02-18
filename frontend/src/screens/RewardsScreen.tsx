import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStack';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  HeroSection,
  LevelProgressBar,
  MoneySavedCard,
  BadgeSection,
  RewardCarousel,
  WeeklyGrowthCard,
  BadgeDetailBottomSheet,
  type Badge,
} from '../components/rewards';
import { BottomNav } from '../components/BottomNav';
import type { BottomNavKey } from '../components/BottomNav';
import { getResponsiveSpacing, isSmallScreen } from '../utils/responsive';

const MOCK_BADGES: Badge[] = [
  {
    id: 'consistency-7',
    category: 'consistency',
    title: 'Week Warrior',
    description: '7 days of consistent progress',
    icon: 'calendar-check',
    unlocked: true,
    progress: 1,
    unlockCondition: 'Complete 7 consecutive days',
    motivationalLine: 'Consistency is your superpower',
  },
  {
    id: 'resilience-1',
    category: 'resilience',
    title: 'First Step',
    description: 'Overcame your first urge',
    icon: 'shield-check',
    unlocked: true,
    progress: 1,
    unlockCondition: 'Resist your first strong urge',
    motivationalLine: 'Every journey begins with one step',
  },
  {
    id: 'self-control-30',
    category: 'self-control',
    title: 'Month Master',
    description: '30 days of self-control',
    icon: 'hand-okay',
    unlocked: false,
    progress: 0.75,
    unlockCondition: 'Complete 30 days without relapse',
    motivationalLine: 'You are stronger than your urges',
  },
  {
    id: 'growth-100',
    category: 'growth',
    title: 'Century Champion',
    description: '100 days of growth',
    icon: 'trending-up',
    unlocked: false,
    progress: 0.45,
    unlockCondition: 'Reach 100 days of recovery',
    motivationalLine: 'Growth happens one day at a time',
  },
];

const MOCK_REWARDS = [
  {
    id: 'theme-dark',
    title: 'Dark Theme',
    description: 'Unlock premium dark mode',
    icon: 'moon',
    unlocked: true,
    cost: 500,
  },
  {
    id: 'theme-nature',
    title: 'Nature Theme',
    description: 'Calming nature backgrounds',
    icon: 'leaf',
    unlocked: false,
    cost: 1000,
  },
  {
    id: 'avatar-premium',
    title: 'Premium Avatar',
    description: 'Exclusive avatar frames',
    icon: 'account-star',
    unlocked: false,
    cost: 2000,
  },
];

type NavProp = NativeStackNavigationProp<MainStackParamList, 'Rewards'>;

export function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const scrollY = useSharedValue(0);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [badgeSheetVisible, setBadgeSheetVisible] = useState(false);
  const bottomSheetRef = useRef<any>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setBadgeSheetVisible(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCloseBadgeSheet = () => {
    setBadgeSheetVisible(false);
    setTimeout(() => setSelectedBadge(null), 300);
  };

  const heroOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 200], [1, 0.3], 'clamp');
    return { opacity };
  });

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100 + insets.bottom,
        }}
        bounces
      >
        <Animated.View style={heroOpacity}>
          <HeroSection
            streak={42}
            level={5}
            xp={1250}
            xpToNextLevel={1500}
            identityTitle="Warrior"
          />
        </Animated.View>

        <View style={styles.content}>
          <LevelProgressBar
            level={5}
            xp={1250}
            xpToNextLevel={1500}
            scrollY={scrollY}
          />

          <MoneySavedCard
            amount={8500}
            goal={10000}
            goalReward="New Headphones"
            scrollY={scrollY}
          />

          <BadgeSection
            title="Consistency"
            badges={MOCK_BADGES.filter((b) => b.category === 'consistency')}
            onBadgePress={handleBadgePress}
            scrollY={scrollY}
          />

          <BadgeSection
            title="Resilience"
            badges={MOCK_BADGES.filter((b) => b.category === 'resilience')}
            onBadgePress={handleBadgePress}
            scrollY={scrollY}
          />

          <BadgeSection
            title="Self-Control"
            badges={MOCK_BADGES.filter((b) => b.category === 'self-control')}
            onBadgePress={handleBadgePress}
            scrollY={scrollY}
          />

          <BadgeSection
            title="Growth"
            badges={MOCK_BADGES.filter((b) => b.category === 'growth')}
            onBadgePress={handleBadgePress}
            scrollY={scrollY}
          />

          <RewardCarousel rewards={MOCK_REWARDS} scrollY={scrollY} />

          <WeeklyGrowthCard
            improvementPercent={23}
            message="You're building stronger habits each week"
            scrollY={scrollY}
          />
        </View>
      </Animated.ScrollView>

      <BadgeDetailBottomSheet
        visible={badgeSheetVisible}
        badge={selectedBadge}
        onClose={handleCloseBadgeSheet}
      />

      <BottomNav
        activeKey="rewards"
        onSelect={(key: BottomNavKey) => {
          if (key === 'progress') navigation.navigate('HomeDashboard');
          if (key === 'games') navigation.navigate('Games');
        }}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: isSmallScreen() ? spacing.md : spacing.lg,
    paddingTop: spacing.xl,
    gap: isSmallScreen() ? spacing.lg : spacing.xl,
  },
});
