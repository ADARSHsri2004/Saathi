import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStack';
import type { BottomNavKey } from '../components/BottomNav';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { PanicButton } from '../components/PanicButton';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useDashboard } from '../context/DashboardContext';
import { getRandomTips } from '../constants/smokingTips';

const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 86;

type NavProp = NativeStackNavigationProp<MainStackParamList, 'HomeDashboard'>;

export function HomeDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { metrics, projections, isLoading, recordRelapse, refreshDashboard } = useDashboard();
  const [headerElevated, setHeaderElevated] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [tipsModalVisible, setTipsModalVisible] = useState(false);
  const [currentTips, setCurrentTips] = useState(() => getRandomTips(3));
  const [relapseModalVisible, setRelapseModalVisible] = useState(false);
  const [isSubmittingRelapse, setIsSubmittingRelapse] = useState(false);
  
  const relapseOpacity = useSharedValue(0);
  const relapseScale = useSharedValue(0.9);

  const progressFill = useSharedValue(0);
  const dailyOpacity = useSharedValue(0);
  const dailyTranslate = useSharedValue(12);
  const metricsOpacity = useSharedValue(0);
  const metricsTranslate = useSharedValue(12);
  const impactOpacity = useSharedValue(0);
  const impactTranslate = useSharedValue(12);
  const chartOpacity = useSharedValue(0);
  const chartTranslate = useSharedValue(12);
  const moneyVsLifeOpacity = useSharedValue(0);
  const moneyVsLifeTranslate = useSharedValue(12);
  const tipsOpacity = useSharedValue(0);
  const tipsTranslate = useSharedValue(12);

  useEffect(() => {
    dailyOpacity.value = withDelay(120, withTiming(1, { duration: 500 }));
    dailyTranslate.value = withDelay(120, withTiming(0, { duration: 500 }));
    metricsOpacity.value = withDelay(260, withTiming(1, { duration: 500 }));
    metricsTranslate.value = withDelay(260, withTiming(0, { duration: 500 }));
    impactOpacity.value = withDelay(420, withTiming(1, { duration: 500 }));
    impactTranslate.value = withDelay(420, withTiming(0, { duration: 500 }));
    moneyVsLifeOpacity.value = withDelay(560, withTiming(1, { duration: 500 }));
    moneyVsLifeTranslate.value = withDelay(560, withTiming(0, { duration: 500 }));
    tipsOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    tipsTranslate.value = withDelay(700, withTiming(0, { duration: 500 }));
    chartOpacity.value = withDelay(840, withTiming(1, { duration: 500 }));
    chartTranslate.value = withDelay(840, withTiming(0, { duration: 500 }));
  }, []);

  useEffect(() => {
    if (progressWidth > 0 && metrics) {
      const progressValue = metrics.todayProgress.percentage / 100;
      progressFill.value = withTiming(progressWidth * progressValue, { duration: 1200 });
    }
  }, [progressWidth, metrics]);

  const handleResetClick = () => {
    relapseOpacity.value = withTiming(1, { duration: 300 });
    relapseScale.value = withTiming(1, { duration: 300 });
    setRelapseModalVisible(true);
  };

  const closeRelapseModal = () => {
    relapseOpacity.value = withTiming(0, { duration: 200 });
    relapseScale.value = withTiming(0.9, { duration: 200 });
    setTimeout(() => setRelapseModalVisible(false), 200);
  };

  const handleConfirmRelapse = async () => {
    setIsSubmittingRelapse(true);
    try {
      await recordRelapse();
      closeRelapseModal();
      setTimeout(() => {
        Alert.alert('Reset Complete', 'Your progress has been reset. Remember, every attempt teaches you something. Keep going, you can do this!');
      }, 300);
    } catch (error) {
      Alert.alert('Error', 'Failed to record relapse. Please try again.');
    } finally {
      setIsSubmittingRelapse(false);
    }
  };

  const formatLifeTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = minutes / 60;
    if (hours < 24) {
      return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
    }
    const days = hours / 24;
    if (days < 30) {
      return `${Math.floor(days)}d ${Math.floor((days % 1) * 24)}h`;
    }
    const months = Math.floor(days / 30);
    const remainingDays = Math.floor(days % 30);
    if (months < 12) {
      return `${months}M ${remainingDays}d`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years}Y ${remainingMonths}M`;
  };

// here to place animated style



  const dailyStyle = useAnimatedStyle(() => ({
    opacity: dailyOpacity.value,
    transform: [{ translateY: dailyTranslate.value }],
  }));

  const metricsStyle = useAnimatedStyle(() => ({
    opacity: metricsOpacity.value,
    transform: [{ translateY: metricsTranslate.value }],
  }));

  const impactStyle = useAnimatedStyle(() => ({
    opacity: impactOpacity.value,
    transform: [{ translateY: impactTranslate.value }],
  }));

  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [{ translateY: chartTranslate.value }],
  }));

  const moneyVsLifeStyle = useAnimatedStyle(() => ({
    opacity: moneyVsLifeOpacity.value,
    transform: [{ translateY: moneyVsLifeTranslate.value }],
  }));

  const tipsStyle = useAnimatedStyle(() => ({
    opacity: tipsOpacity.value,
    transform: [{ translateY: tipsTranslate.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressFill.value,
  }));

  const relapseModalStyle = useAnimatedStyle(() => ({
    opacity: relapseOpacity.value,
  }));

  const relapseContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: relapseScale.value }],
  }));





  if (isLoading && !metrics) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.motivationalText, { marginTop: spacing.md }]}>Loading your progress...</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
        <Text style={styles.cardTitle}>No Data Available</Text>
        <Text style={[styles.motivationalText, { textAlign: 'center', marginTop: spacing.md }]}>
          Please complete onboarding first to start tracking your progress.
        </Text>
      </View>
    );
  }



  return (
    <View style={styles.screen}>
      <View style={styles.backgroundArt}>
        <View style={styles.glowTop} />
        <View style={styles.glowMid} />
      </View>

      <View style={styles.headerWrapper}>
        <AppHeader
          title="Welcome back"
          elevated={headerElevated}
          onMenuPress={() => {}}
          onNotificationsPress={() => {}}
          onHelpPress={() => {}}
          onSettingsPress={() => navigation.navigate('Settings')}
          onCompanionPress={() => navigation.navigate('Companion')}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top + spacing.lg,
          paddingBottom: FOOTER_HEIGHT + insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          setHeaderElevated(event.nativeEvent.contentOffset.y > 4);
        }}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.card, dailyStyle]}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Today's progress</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Day {metrics.currentStreakDays}</Text>
            </View>
          </View>
          <Text style={styles.motivationalText}>
            You are steady and resilient. Keep breathing through the urges.
          </Text>
          <View
            style={styles.progressTrack}
            onLayout={(event) => setProgressWidth(event.nativeEvent.layout.width)}
          >
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{metrics.todayProgress.percentage}% of today complete</Text>
            <Text style={styles.progressLabel}>{metrics.todayProgress.timeRemaining} left</Text>
          </View>
          
          {/* Reset Button */}
          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
            onPress={handleResetClick}
          >
            <MaterialCommunityIcons name="restart" size={16} color={colors.error} />
            <Text style={styles.resetButtonText}>Reset Progress (Relapse)</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.section, metricsStyle]}>
          <Text style={styles.sectionTitle}>Recovery metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardAccent]}>
              <View style={styles.metricIconWrap}>
                <Feather name="clock" size={18} color={colors.accent} />
              </View>
              <Text style={styles.metricLabel}>Time free</Text>
              <Text style={styles.metricValue}>
                {metrics.recoveryMetrics.timeFreeHours < 24 
                  ? `${metrics.recoveryMetrics.timeFreeHours.toFixed(1)} hrs`
                  : `${Math.floor(metrics.recoveryMetrics.timeFreeHours / 24)} days`}
              </Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardGreen]}>
              <View style={styles.metricIconWrapGreen}>
                <MaterialCommunityIcons name="heart-outline" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.metricLabel}>Life regained</Text>
              <Text style={styles.metricValue}>
                {formatLifeTime(metrics.recoveryMetrics.lifeRegainedMinutes)}
              </Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardGold]}>
              <View style={styles.metricIconWrapGold}>
                <MaterialCommunityIcons name="cash-multiple" size={18} color={colors.milestone} />
              </View>
              <Text style={styles.metricLabel}>Money saved</Text>
              <Text style={styles.metricValue}>₹{metrics.recoveryMetrics.moneySaved.toFixed(0)}</Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <View style={styles.metricIconWrapBlue}>
                <MaterialCommunityIcons name="smoking-off" size={18} color={colors.info} />
              </View>
              <Text style={styles.metricLabel}>Not consumed</Text>
              <Text style={styles.metricValue}>{Math.round(metrics.recoveryMetrics.cigarettesNotConsumed)} sticks</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, impactStyle]}>
          <Text style={styles.sectionTitle}>Past impact</Text>
          <View style={styles.pastImpactCard}>
            <View style={styles.pastStatRow}>
              <Text style={styles.pastLabel}>Total consumed</Text>
              <Text style={styles.pastValue}>{metrics.pastImpact.totalConsumed} sticks</Text>
            </View>
            <View style={styles.pastStatRow}>
              <Text style={styles.pastLabel}>Money wasted</Text>
              <Text style={styles.pastValue}>₹{metrics.pastImpact.totalMoneyWasted.toFixed(0)}</Text>
            </View>
            <View style={styles.pastStatRow}>
              <Text style={styles.pastLabel}>Life lost</Text>
              <Text style={styles.pastValue}>{formatLifeTime(metrics.pastImpact.totalLifeLostMinutes)}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, moneyVsLifeStyle]}>
          <View style={styles.moneyVsLifeCard}>
            <View style={styles.moneyVsLifeHeader}>
              <MaterialCommunityIcons name="chart-line-variant" size={22} color={colors.accent} />
              <Text style={styles.moneyVsLifeTitle}>What will you get in return?</Text>
            </View>
            <Text style={styles.moneyVsLifeSubtitle}>Money and life expectancy</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableColPeriod]}>Period</Text>
              <Text style={[styles.tableHeaderText, styles.tableColMoney]}>Money saved</Text>
              <Text style={[styles.tableHeaderText, styles.tableColLife]}>Life gained</Text>
            </View>
            {projections.map((row, index) => (
              <View
                key={row.period}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt,
                ]}
              >
                <Text style={[styles.tableCell, styles.tableColPeriod]}>{row.period}</Text>
                <View style={styles.tableCellMoney}>
                  <Feather name="dollar-sign" size={12} color={colors.secondary} />
                  <Text style={[styles.tableCell, styles.tableCellValue]}>{row.money}</Text>
                </View>
                <View style={styles.tableCellLife}>
                  <Feather name="clock" size={12} color={colors.accent} />
                  <Text style={[styles.tableCell, styles.tableCellValue]}>{row.life}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, tipsStyle]}>
          <Pressable
            style={({ pressed }) => [styles.tipsCard, pressed && styles.tipsCardPressed]}
            onPress={() => {
              setCurrentTips(getRandomTips(3));
              setTipsModalVisible(true);
            }}
          >
            <View style={styles.tipsCardContent}>
              <View style={styles.tipsCardLeft}>
                <Text style={styles.tipsCardTitle}>Quit smoking tips</Text>
                <Text style={styles.tipsCardHint}>Motivation and strategies that work</Text>
                <View style={styles.tipsCta}>
                  <Text style={styles.tipsCtaText}>EXPLORE</Text>
                  <Feather name="arrow-right" size={14} color={colors.accent} />
                </View>
              </View>
              <View style={styles.tipsCardIconWrap}>
                <MaterialCommunityIcons name="sign-direction" size={48} color={colors.divider} />
              </View>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.section, chartStyle]}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Recovery trend</Text>
            <Pressable style={styles.inlineCta}>
              <Text style={styles.inlineCtaText}>View trend</Text>
            </Pressable>
          </View>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              <View style={[styles.chartBar, styles.chartBarSoft, { height: 56 }]} />
              <View style={[styles.chartBar, styles.chartBarSoft, { height: 72 }]} />
              <View style={[styles.chartBar, styles.chartBarAccent, { height: 98 }]} />
              <View style={[styles.chartBar, styles.chartBarAccent, { height: 112 }]} />
            </View>
            <Text style={styles.chartCaption}>Recovery impact keeps compounding each week.</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Relapse Confirmation Modal */}
      <Modal
        visible={relapseModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeRelapseModal}
      >
        <Animated.View style={[styles.modalBackdrop, relapseModalStyle]}>
          <Animated.View style={[styles.modalContent, relapseContentStyle]}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalBody}>
              Did you relapse? Remember, setbacks are part of the journey. Every attempt teaches you something valuable. You're stronger than you think.
            </Text>
            <View style={styles.relapseWarning}>
              <MaterialCommunityIcons name="information-outline" size={16} color={colors.warning} style={{ marginRight: spacing.sm }} />
              <Text style={styles.relapseWarningText}>This will reset your current progress.</Text>
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonSecondary,
                  pressed && styles.modalButtonPressed,
                ]}
                onPress={closeRelapseModal}
                disabled={isSubmittingRelapse}
              >
                <Text style={styles.modalButtonSecondaryText}>Not yet</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonPrimary,
                  pressed && styles.modalButtonPressed,
                  isSubmittingRelapse && styles.modalButtonDisabled,
                ]}
                onPress={handleConfirmRelapse}
                disabled={isSubmittingRelapse}
              >
                {isSubmittingRelapse ? (
                  <ActivityIndicator size="small" color={colors.textOnAccent} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Yes, Reset</Text>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Tips Modal */}
      <Modal
        visible={tipsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTipsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setTipsModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={40} color={colors.milestone} />
            </View>
            <Text style={styles.modalTitle}>You're doing great</Text>
            <Text style={styles.modalBody}>
              Every craving you ride out makes you stronger. Small wins add up—each hour, each day you choose yourself over the habit is a victory worth celebrating.
            </Text>
            <View style={styles.modalBullets}>
              {currentTips.map((tip, index) => (
                <View key={index} style={styles.modalBulletRow}>
                  <Feather name="check-circle" size={18} color={colors.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalBulletTitle}>{tip.title}</Text>
                    <Text style={styles.modalBulletText}>{tip.message}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setTipsModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </TouchableOpacity>
      </Modal>

      <BottomNav
        activeKey="progress"
        onSelect={(key: BottomNavKey) => {
          if (key === 'planner') navigation.navigate('PlannerStack');
          if (key === 'games') navigation.navigate('Games');
          if (key === 'rewards') navigation.navigate('Rewards');
          if (key === 'Assistant') navigation.navigate('Assistant');
        }}
        bottomInset={insets.bottom}
      />
      <PanicButton bottomOffset={FOOTER_HEIGHT + insets.bottom} onPress={() => { }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accentSoft,
  },
  glowMid: {
    position: 'absolute',
    top: 220,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.secondarySoft,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  card: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontFamily: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'serif' }),
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentSoft,
  },
  badgeText: {
    ...typography.caption,
    color: colors.accentPressed,
    fontWeight: '600',
  },
  motivationalText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressBackground,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressFill,
  },
  progressRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  resetButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  resetButtonPressed: {
    opacity: 0.7,
  },
  resetButtonText: {
    ...typography.label,
    color: colors.error,
    fontSize: 12,
  },
  section: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: "47%",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  },
  metricCardAccent: {
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  metricCardGreen: {
    borderWidth: 1,
    borderColor: colors.secondarySoft,
  },
  metricCardGold: {
    borderWidth: 1,
    borderColor: colors.milestoneSoft,
  },
  metricCardBlue: {
    borderWidth: 1,
    borderColor: colors.infoSoft,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.sm,
  },
  metricIconWrapGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondarySoft,
    marginBottom: spacing.sm,
  },
  metricIconWrapGold: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.milestoneSoft,
    marginBottom: spacing.sm,
  },
  metricIconWrapBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.infoSoft,
    marginBottom: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xxs,
  },
  metricValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  pastImpactCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  pastStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  pastLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  pastValue: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  moneyVsLifeCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  moneyVsLifeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  moneyVsLifeTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    flex: 1,
  },
  moneyVsLifeSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.divider,
    marginBottom: spacing.xs,
  },
  tableHeaderText: {
    ...typography.label,
    color: colors.textMuted,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tableRowAlt: {
    backgroundColor: colors.backgroundSecondary,
  },
  tableColPeriod: {
    width: '28%',
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tableColMoney: {
    width: '36%',
  },
  tableColLife: {
    width: '36%',
  },
  tableCell: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  tableCellValue: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tableCellMoney: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    width: '36%',
  },
  tableCellLife: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    width: '36%',
  },
  tipsCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  tipsCardPressed: {
    opacity: 0.92,
  },
  tipsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  tipsCardLeft: {
    flex: 1,
  },
  tipsCardTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  tipsCardHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  tipsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tipsCtaText: {
    ...typography.label,
    color: colors.accent,
    letterSpacing: 0.8,
  },
  tipsCardIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.milestoneSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalBullets: {
    marginBottom: spacing.lg,
  },
  modalBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalBulletTitle: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  modalBulletText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  relapseWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  relapseWarningText: {
    ...typography.bodySmall,
    color: colors.warning,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.error,
  },
  modalButtonSecondaryText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  modalButtonPrimaryText: {
    ...typography.button,
    color: colors.textOnAccent,
  },
  modalButtonPressed: {
    opacity: 0.7,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalCloseButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCloseText: {
    ...typography.button,
    color: colors.textOnAccent,
  },
  chartCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    marginBottom: spacing.md,
  },
  chartBar: {
    width: '22%',
    borderRadius: borderRadius.md,
  },
  chartBarSoft: {
    backgroundColor: colors.secondarySoft,
  },
  chartBarAccent: {
    backgroundColor: colors.accent,
  },
  chartCaption: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  inlineCta: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  inlineCtaText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
});
