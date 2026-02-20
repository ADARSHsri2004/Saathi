import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CompanionApi, DashboardApi } from '../services/api';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, typography, spacing, borderRadius } from '../theme';
import type { MainStackParamList } from '../navigation/MainStack';
import { scale as scaleSize, scaleFont, isSmallScreen } from '../utils/responsive';
import { CircularProgressRing } from '../components/CircularProgressRing';

type Nav = NativeStackNavigationProp<MainStackParamList, 'HomeDashboard'>;

interface PatientProgressData {
  patient: { id: string; displayName: string };
  onboarding: {
    addictionTypes: string[];
    intention: string;
    duration: string;
    journeyStartDate: string | null;
    completedAt: string | null;
  };
  relapseInfo: {
    totalRelapses: number;
    lastRelapseDate: string | null;
    currentStreakDays: number;
  };
}

interface DashboardMetrics {
  todayProgress?: { percentage: number; timeElapsed?: string; timeRemaining?: string };
  recoveryMetrics?: {
    timeFreeHours?: number;
    lifeRegainedMinutes?: number;
    moneySaved?: number;
    cigarettesNotConsumed?: number;
  };
  pastImpact?: { totalLifeLostMinutes?: number; totalMoneyWasted?: number; totalConsumed?: number };
}

const COMPANION_GRADIENT = ['#1a535c', '#2d7d7d', '#2D9CDB'] as const;
const STREAK_GOLD = '#FFD166';
const CARD_GLASS = 'rgba(255,255,255,0.92)';

export function CompanionDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const [patientData, setPatientData] = useState<PatientProgressData | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientData = useCallback(async () => {
    if (!state.patientId) {
      setError('No patient linked');
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await CompanionApi.getPatientDashboard(state.patientId);
      setPatientData(data);
      try {
        const metrics = await DashboardApi.getDashboardMetrics(state.patientId);
        setDashboardMetrics(metrics);
      } catch {
        setDashboardMetrics(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient progress');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [state.patientId]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  useFocusEffect(
    useCallback(() => {
      if (state.patientId && !isLoading) {
        setIsRefreshing(true);
        fetchPatientData();
      }
    }, [state.patientId])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchPatientData();
  };

  if (isLoading && !patientData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.centered]}>
        <LinearGradient colors={[...COMPANION_GRADIENT]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingLabel}>Loading their journey...</Text>
      </View>
    );
  }

  if (error || !patientData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.centered]}>
        <LinearGradient colors={[...COMPANION_GRADIENT]} style={StyleSheet.absoluteFill} />
        <Animated.View entering={FadeIn.duration(400)} style={styles.errorCard}>
          <MaterialCommunityIcons name="heart-off-outline" size={56} color={colors.textMuted} />
          <Text style={styles.errorTitle}>Unable to load</Text>
          <Text style={styles.errorMessage}>{error || 'Patient data not found'}</Text>
          <Pressable
            onPress={() => {
              if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              fetchPatientData();
            }}
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.retryBtnText}>Try again</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  const addictionType = patientData.onboarding.addictionTypes[0] || 'Recovery';
  const isOnGoing = !patientData.onboarding.completedAt;
  const streak = patientData.relapseInfo.currentStreakDays ?? 0;
  const cravingRisk = streak < 3 ? 'High' : streak < 14 ? 'Medium' : 'Low';
  const todayPct = Math.min(100, Math.max(0, dashboardMetrics?.todayProgress?.percentage ?? 0));
  const moneySaved = dashboardMetrics?.recoveryMetrics?.moneySaved ?? 0;
  const hoursFree = dashboardMetrics?.recoveryMetrics?.timeFreeHours ?? 0;
  const cigsAvoided = dashboardMetrics?.recoveryMetrics?.cigarettesNotConsumed ?? 0;
  const maxMoney = Math.max(moneySaved, 1);
  const maxHours = Math.max(hoursFree, 1);
  const maxCigs = Math.max(cigsAvoided, 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[...COMPANION_GRADIENT]} style={styles.bgGradient} />

      <Animated.View entering={FadeInDown.duration(500).springify()} style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.headerLabel}>Companion Dashboard</Text>
        <Text style={styles.headerSubtitle}>Supporting their journey</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(100).duration(400)}>
          <HeroBlock
            displayName={patientData.patient.displayName}
            addictionType={addictionType}
            intention={patientData.onboarding.intention || 'Not set'}
            isOnGoing={isOnGoing}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <StreakRing days={streak} lastRelapseDate={patientData.relapseInfo.lastRelapseDate} totalRelapses={patientData.relapseInfo.totalRelapses} />
        </Animated.View>

        {dashboardMetrics?.todayProgress != null && (
          <Animated.View entering={FadeIn.delay(280).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s progress</Text>
            <TodayProgressBar percentage={todayPct} />
          </Animated.View>
        )}

        {(moneySaved > 0 || hoursFree > 0 || cigsAvoided > 0) && (
          <Animated.View entering={FadeIn.delay(340).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Recovery impact</Text>
            <MetricsBars moneySaved={moneySaved} hoursFree={hoursFree} cigsAvoided={cigsAvoided} maxMoney={maxMoney} maxHours={maxHours} maxCigs={maxCigs} />
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.delay(400).duration(400)}>
          <RiskCard risk={cravingRisk} lastRelapseDate={patientData.relapseInfo.lastRelapseDate} />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(460).duration(400)}>
          <JourneyCard
            journeyStartDate={patientData.onboarding.journeyStartDate}
            duration={patientData.onboarding.duration}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(520).duration(400)} style={styles.actions}>
          <ActionButton
            icon="chatbubble-ellipses"
            label="Send message"
            onPress={() => Alert.alert('Coming soon', 'Send a supportive message to your companion')}
          />
          <ActionButton
            icon="checkmark-done"
            label="Log update"
            onPress={() => Alert.alert('Coming soon', 'Record observations about their progress')}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function HeroBlock({
  displayName,
  addictionType,
  intention,
  isOnGoing,
}: {
  displayName: string;
  addictionType: string;
  intention: string;
  isOnGoing: boolean;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View style={[styles.heroCard, animatedStyle]}>
        <LinearGradient colors={[CARD_GLASS, 'rgba(255,255,255,0.85)']} style={styles.heroGradient}>
          <View style={styles.heroAvatar}>
            <MaterialCommunityIcons name="account-heart" size={scaleSize(36)} color={colors.accent} />
          </View>
          <Text style={[styles.heroName, { fontSize: scaleFont(22) }]} numberOfLines={1}>{displayName}</Text>
          <View style={styles.heroTags}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>{addictionType}</Text>
            </View>
            <View style={[styles.heroTag, styles.heroTagGoal]}>
              <Text style={styles.heroTagText}>{intention}</Text>
            </View>
          </View>
          <View style={[styles.statusPill, isOnGoing ? styles.statusPillActive : styles.statusPillDone]}>
            <View style={[styles.statusDot, { backgroundColor: isOnGoing ? colors.accent : colors.success }]} />
            <Text style={styles.statusText}>{isOnGoing ? 'In progress' : 'Completed'}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function StreakRing({
  days,
  lastRelapseDate,
  totalRelapses,
}: {
  days: number;
  lastRelapseDate: string | null;
  totalRelapses: number;
}) {
  const radius = isSmallScreen() ? 80 : 90;
  return (
    <View style={[styles.streakWrapper, { marginVertical: spacing.lg }]}>
      <CircularProgressRing
        value={days}
        maxValue={30}
        radius={radius}
        duration={1200}
        title="Days clean"
        titleColor="#fff"
        subtitleColor="rgba(255,255,255,0.85)"
        progressValueColor="#fff"
        activeStrokeColor={STREAK_GOLD}
        inActiveStrokeColor="rgba(255,255,255,0.25)"
        inActiveStrokeOpacity={0.5}
        activeStrokeWidth={10}
        inActiveStrokeWidth={10}
        progressFormatter={(v) => String(Math.round(v))}
      />
      <View style={styles.streakMeta}>
        <Text style={styles.streakMetaText}>{totalRelapses} relapse{totalRelapses !== 1 ? 's' : ''}</Text>
        {lastRelapseDate && (
          <Text style={styles.streakMetaSub}>Last: {new Date(lastRelapseDate).toLocaleDateString()}</Text>
        )}
      </View>
    </View>
  );
}

function TodayProgressBar({ percentage }: { percentage: number }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withDelay(300, withTiming(percentage / 100, { duration: 1000 }));
  }, [percentage]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, fillStyle]} />
      </View>
      <Text style={styles.progressPct}>{percentage}% today</Text>
    </View>
  );
}

function MetricsBars({
  moneySaved,
  hoursFree,
  cigsAvoided,
  maxMoney,
  maxHours,
  maxCigs,
}: {
  moneySaved: number;
  hoursFree: number;
  cigsAvoided: number;
  maxMoney: number;
  maxHours: number;
  maxCigs: number;
}) {
  const w1 = useSharedValue(0);
  const w2 = useSharedValue(0);
  const w3 = useSharedValue(0);
  useEffect(() => {
    w1.value = withDelay(200, withTiming(moneySaved / maxMoney, { duration: 800 }));
    w2.value = withDelay(350, withTiming(hoursFree / maxHours, { duration: 800 }));
    w3.value = withDelay(500, withTiming(cigsAvoided / maxCigs, { duration: 800 }));
  }, [moneySaved, hoursFree, cigsAvoided, maxMoney, maxHours, maxCigs]);

  const bar1 = useAnimatedStyle(() => ({ width: `${Math.min(1, w1.value) * 100}%` }));
  const bar2 = useAnimatedStyle(() => ({ width: `${Math.min(1, w2.value) * 100}%` }));
  const bar3 = useAnimatedStyle(() => ({ width: `${Math.min(1, w3.value) * 100}%` }));

  return (
    <View style={styles.metricsCard}>
      <MetricRow icon="cash" label="Money saved" value={`₹${Math.round(moneySaved)}`} barStyle={bar1} />
      <MetricRow icon="time" label="Hours free" value={Math.round(hoursFree).toString()} barStyle={bar2} />
      <MetricRow icon="ban" label="Cigarettes avoided" value={cigsAvoided.toString()} barStyle={bar3} />
    </View>
  );
}

function MetricRow({ icon, label, value, barStyle }: { icon: string; label: string; value: string; barStyle: any }) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricIconWrap}>
        <Ionicons name={icon as any} size={18} color={colors.accent} />
      </View>
      <View style={styles.metricContent}>
        <View style={styles.metricLabelRow}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={styles.metricValue}>{value}</Text>
        </View>
        <View style={styles.metricBarTrack}>
          <Animated.View style={[styles.metricBarFill, barStyle]} />
        </View>
      </View>
    </View>
  );
}

function RiskCard({ risk, lastRelapseDate }: { risk: string; lastRelapseDate: string | null }) {
  const riskColor = risk === 'High' ? colors.warning : risk === 'Medium' ? '#F59E0B' : colors.success;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View style={[styles.riskCard, animatedStyle]}>
        <View style={styles.riskHeader}>
          <MaterialCommunityIcons name="shield-alert-outline" size={24} color={riskColor} />
          <Text style={styles.riskTitle}>Craving & risk</Text>
        </View>
        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>Risk level</Text>
          <View style={[styles.riskPill, { backgroundColor: riskColor + '22' }]}>
            <Text style={[styles.riskPillText, { color: riskColor }]}>{risk}</Text>
          </View>
        </View>
        {lastRelapseDate && (
          <Text style={styles.riskSub}>Last relapse: {new Date(lastRelapseDate).toLocaleDateString()}</Text>
        )}
        <Text style={styles.riskHint}>If risk is high, consider reaching out with extra support.</Text>
      </Animated.View>
    </Pressable>
  );
}

function JourneyCard({ journeyStartDate, duration }: { journeyStartDate: string | null; duration: string | null }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View style={[styles.journeyCard, animatedStyle]}>
        <View style={styles.journeyHeader}>
          <MaterialCommunityIcons name="map-marker-path" size={24} color={colors.accent} />
          <Text style={styles.journeyTitle}>Journey</Text>
        </View>
        {journeyStartDate && (
          <View style={styles.journeyRow}>
            <Text style={styles.journeyLabel}>Started</Text>
            <Text style={styles.journeyValue}>{new Date(journeyStartDate).toLocaleDateString()}</Text>
          </View>
        )}
        <View style={styles.journeyRow}>
          <Text style={styles.journeyLabel}>Goal duration</Text>
          <Text style={styles.journeyValue}>{duration || 'Not set'}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View style={[styles.actionBtn, animatedStyle]}>
        <LinearGradient colors={[CARD_GLASS, 'rgba(255,255,255,0.9)']} style={styles.actionBtnGradient}>
          <Ionicons name={icon as any} size={24} color={colors.accent} />
          <Text style={styles.actionBtnText}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  bgGradient: { ...StyleSheet.absoluteFillObject },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerLabel: {
    ...typography.title,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xxs,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.85)',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  loadingLabel: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.md,
  },
  errorCard: {
    backgroundColor: CARD_GLASS,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    maxWidth: 340,
  },
  errorTitle: { ...typography.titleSmall, color: colors.textPrimary, marginTop: spacing.md },
  errorMessage: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
  },
  retryBtnText: { ...typography.label, color: '#fff' },

  heroCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroAvatar: {
    width: scaleSize(64),
    height: scaleSize(64),
    borderRadius: scaleSize(32),
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroName: {
    ...typography.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  heroTags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentSoft,
  },
  heroTagGoal: { backgroundColor: colors.secondarySoft },
  heroTagText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusPillActive: { backgroundColor: colors.accentSoft },
  statusPillDone: { backgroundColor: colors.successSoft },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },

  streakWrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakMeta: { marginTop: spacing.sm, alignItems: 'center' },
  streakMetaText: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
  streakMetaSub: { ...typography.caption, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.titleSmall,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  progressCard: {
    backgroundColor: CARD_GLASS,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  progressPct: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },

  metricsCard: {
    backgroundColor: CARD_GLASS,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: spacing.md,
  },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricContent: { flex: 1 },
  metricLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  metricLabel: { ...typography.caption, color: colors.textSecondary },
  metricValue: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  metricBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent,
  },

  riskCard: {
    backgroundColor: CARD_GLASS,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  riskHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  riskTitle: { ...typography.titleSmall, fontWeight: '700', color: colors.textPrimary },
  riskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  riskLabel: { ...typography.bodySmall, color: colors.textSecondary },
  riskPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: borderRadius.full },
  riskPillText: { ...typography.caption, fontWeight: '700' },
  riskSub: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  riskHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: 'italic' },

  journeyCard: {
    backgroundColor: CARD_GLASS,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  journeyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  journeyTitle: { ...typography.titleSmall, fontWeight: '700', color: colors.textPrimary },
  journeyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  journeyLabel: { ...typography.bodySmall, color: colors.textSecondary },
  journeyValue: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },

  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.xxl },
  actionBtn: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.accent },
});
