import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { ProfileApi, type ProfileResponse } from '../services/api';
import { colors, spacing, typography } from '../theme';
import { useOnboarding } from '../context/OnboardingContext';
import {
  HeroCard,
  StreakCircle,
  StatsCard,
  AchievementsList,
  MoodChart,
  ProfileSkeleton,
  profileColors,
} from '../components/profile';

const USER_ID_KEY = 'user_id';

type NavProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

function getDynamicMessage(data: ProfileResponse): string {
  if (data.streakDays > 10) {
    return "You're stronger than your cravings";
  }
  if (data.riskScore >= 60) {
    return "We're here for you. Let's stay strong today.";
  }
  if (data.relapseCount > 0) {
    return "Recovery is a journey. You're still moving forward.";
  }
  return "Every day you choose yourself. Keep going.";
}

function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore <= 33) return 'low';
  if (riskScore <= 66) return 'medium';
  return 'high';
}

const DEFAULT_MOOD_STATS = { calm: 0, anxious: 0, motivated: 0, low: 0 };

function getDominantMood(moodStats: ProfileResponse['moodStats'] | null | undefined): string {
  const stats = moodStats && typeof moodStats === 'object' ? moodStats : DEFAULT_MOOD_STATS;
  const entries = Object.entries(stats) as [keyof typeof stats, number][];
  if (entries.length === 0) return 'Calm';
  const max = entries.reduce((a, b) => (a[1] >= b[1] ? a : b));
  return max[0].charAt(0).toUpperCase() + max[0].slice(1);
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { state: onboardingState } = useOnboarding();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchProfile = useCallback(async (isRefresh = false) => {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      setError('Complete onboarding first');
      setData(null);
      setLoading(false);
      return;
    }
    setUserId(userId);
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await ProfileApi.getProfile(userId);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  if (loading && !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          >
            <Feather name="chevron-left" size={24} color={profileColors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.skeletonContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          >
            <Feather name="chevron-left" size={24} color={profileColors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.backBtn} />
        </View>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => fetchProfile()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!data) return null;

  const moodStats = data.moodStats && typeof data.moodStats === 'object'
    ? data.moodStats
    : DEFAULT_MOOD_STATS;
  const achievements = Array.isArray(data.achievements) ? data.achievements : [];
  const dynamicMessage = getDynamicMessage(data);
  const riskLevel = getRiskLevel(data.riskScore);
  const dominantMood = getDominantMood(moodStats);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        >
          <Feather name="chevron-left" size={24} color={profileColors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={profileColors.text}
          />
        }
      >
        <View style={styles.gradientBg}>
          <HeroCard
            username={(data.displayName && data.displayName.trim()) || (data.username && data.username.trim()) || 'You'}
            userId={onboardingState.userId || userId || undefined}
            level={typeof data.level === 'number' ? data.level : 1}
            xpPoints={typeof data.xpPoints === 'number' ? data.xpPoints : 0}
            xpToNextLevel={typeof data.xpToNextLevel === 'number' ? data.xpToNextLevel : 500}
            dynamicMessage={dynamicMessage}
          />
          <StreakCircle streakDays={typeof data.streakDays === 'number' ? data.streakDays : 0} />

          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statsCell}>
                <StatsCard
                  type="cleanDays"
                  value={typeof data.totalCleanDays === 'number' ? data.totalCleanDays : 0}
                  label="Total Clean Days"
                />
              </View>
              <View style={styles.statsCell}>
                <StatsCard
                  type="relapses"
                  value={typeof data.relapseCount === 'number' ? data.relapseCount : 0}
                  label="Relapse Count"
                />
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statsCell}>
                <StatsCard
                  type="risk"
                  value={typeof data.riskScore === 'number' ? data.riskScore : 0}
                  label="Risk Score"
                  riskLevel={riskLevel}
                />
              </View>
              <View style={styles.statsCell}>
                <StatsCard
                  type="mood"
                  value={dominantMood}
                  label="Dominant Mood"
                />
              </View>
            </View>
          </View>

          <AchievementsList achievements={achievements} />
          <MoodChart moodStats={moodStats} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: profileColors.gradientStart,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: profileColors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    opacity: 0.8,
  },
  headerTitle: {
    ...typography.titleSmall,
    fontWeight: '700',
    color: profileColors.text,
  },
  scroll: {
    flex: 1,
  },
  skeletonContent: {
    padding: spacing.lg,
  },
  content: {
    padding: spacing.lg,
  },
  gradientBg: {
    flex: 1,
  },
  statsGrid: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statsCell: {
    flex: 1,
    minWidth: 0,
  },
  errorText: {
    ...typography.body,
    color: profileColors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: profileColors.cardBg,
    borderRadius: 12,
  },
  retryText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: profileColors.text,
  },
});
