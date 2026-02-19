import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStack';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../theme';
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
import { RewardsApi, type RewardsResponse } from '../services/api';
import { isSmallScreen } from '../utils/responsive';

const USER_ID_KEY = 'user_id';

type NavProp = NativeStackNavigationProp<MainStackParamList, 'Rewards'>;

const BADGE_SECTIONS: { title: string; category: Badge['category'] }[] = [
  { title: 'Consistency', category: 'consistency' },
  { title: 'Resilience', category: 'resilience' },
  { title: 'Self-Control', category: 'self-control' },
  { title: 'Growth', category: 'growth' },
];

export function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const scrollY = useSharedValue(0);
  const [data, setData] = useState<RewardsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [badgeSheetVisible, setBadgeSheetVisible] = useState(false);

  const fetchRewards = useCallback(async () => {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      setError('User ID not found. Please complete onboarding first.');
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const rewardsData = await RewardsApi.getRewards(userId);
      setData(rewardsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRewards();
    }, [fetchRewards])
  );

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

  if (isLoading && !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
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

  if (error && !data) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryHint} onPress={fetchRewards}>
            Tap to retry
          </Text>
        </View>
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

  if (!data) {
    return null;
  }

  const { moneySaved, badges, rewards, weeklyGrowth } = data;

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
            streak={data.streak}
            level={data.level}
            xp={data.xp}
            xpToNextLevel={data.xpToNextLevel}
            identityTitle={data.identityTitle}
          />
        </Animated.View>

        <View style={styles.content}>
          <LevelProgressBar
            level={data.level}
            xp={data.xp}
            xpToNextLevel={data.xpToNextLevel}
            scrollY={scrollY}
          />

          <MoneySavedCard
            amount={moneySaved.amount}
            goal={moneySaved.goal}
            goalReward={moneySaved.goalReward}
            scrollY={scrollY}
          />

          {BADGE_SECTIONS.map(({ title, category }) => (
            <BadgeSection
              key={category}
              title={title}
              badges={badges.filter((b) => b.category === category)}
              onBadgePress={handleBadgePress}
              scrollY={scrollY}
            />
          ))}

          <RewardCarousel rewards={rewards} scrollY={scrollY} />

          <WeeklyGrowthCard
            improvementPercent={weeklyGrowth.improvementPercent}
            message={weeklyGrowth.message}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryHint: {
    ...typography.bodySmall,
    color: colors.accent,
    marginTop: spacing.sm,
  },
});
