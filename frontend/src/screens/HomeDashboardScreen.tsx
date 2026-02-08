import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 86;

export function HomeDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [headerElevated, setHeaderElevated] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const progressValue = 0.68;

  const progressFill = useSharedValue(0);
  const dailyOpacity = useSharedValue(0);
  const dailyTranslate = useSharedValue(12);
  const metricsOpacity = useSharedValue(0);
  const metricsTranslate = useSharedValue(12);
  const impactOpacity = useSharedValue(0);
  const impactTranslate = useSharedValue(12);
  const chartOpacity = useSharedValue(0);
  const chartTranslate = useSharedValue(12);

  useEffect(() => {
    dailyOpacity.value = withDelay(120, withTiming(1, { duration: 500 }));
    dailyTranslate.value = withDelay(120, withTiming(0, { duration: 500 }));
    metricsOpacity.value = withDelay(260, withTiming(1, { duration: 500 }));
    metricsTranslate.value = withDelay(260, withTiming(0, { duration: 500 }));
    impactOpacity.value = withDelay(420, withTiming(1, { duration: 500 }));
    impactTranslate.value = withDelay(420, withTiming(0, { duration: 500 }));
    chartOpacity.value = withDelay(560, withTiming(1, { duration: 500 }));
    chartTranslate.value = withDelay(560, withTiming(0, { duration: 500 }));
  }, []);

  useEffect(() => {
    if (progressWidth > 0) {
      progressFill.value = withTiming(progressWidth * progressValue, { duration: 1200 });
    }
  }, [progressWidth]);

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

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressFill.value,
  }));

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
            <Text style={styles.cardTitle}>Todays progress</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Day 12</Text>
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
            <Text style={styles.progressLabel}>68% of today complete</Text>
            <Text style={styles.progressLabel}>7h 40m left</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, metricsStyle]}>
          <Text style={styles.sectionTitle}>Recovery metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardAccent]}>
              <View style={styles.metricIconWrap}>
                <Feather name="clock" size={18} color={colors.accent} />
              </View>
              <Text style={styles.metricLabel}>Time free</Text>
              <Text style={styles.metricValue}>12 days</Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardGreen]}>
              <View style={styles.metricIconWrapGreen}>
                <MaterialCommunityIcons name="heart-outline" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.metricLabel}>Life regained</Text>
              <Text style={styles.metricValue}>4.6 hrs</Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardGold]}>
              <View style={styles.metricIconWrapGold}>
                <MaterialCommunityIcons name="cash-multiple" size={18} color={colors.milestone} />
              </View>
              <Text style={styles.metricLabel}>Money saved</Text>
              <Text style={styles.metricValue}>$92</Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <View style={styles.metricIconWrapBlue}>
                <MaterialCommunityIcons name="smoking-off" size={18} color={colors.info} />
              </View>
              <Text style={styles.metricLabel}>Not consumed</Text>
              <Text style={styles.metricValue}>36 sticks</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, impactStyle]}>
          <Text style={styles.sectionTitle}>Past impact</Text>
          <View style={styles.pastImpactCard}>
            <View style={styles.pastStatRow}>
              <Text style={styles.pastLabel}>Total consumed</Text>
              <Text style={styles.pastValue}>1,420 sticks</Text>
            </View>
            <View style={styles.pastStatRow}>
              <Text style={styles.pastLabel}>Money wasted</Text>
              <Text style={styles.pastValue}>$2,180</Text>
            </View>
            <View style={styles.pastStatRow}>
              <Text style={styles.pastLabel}>Life lost</Text>
              <Text style={styles.pastValue}>9.3 days</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, chartStyle]}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Money & life expectancy</Text>
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

      <BottomNav activeKey="progress" bottomInset={insets.bottom} />
      <PanicButton bottomOffset={FOOTER_HEIGHT + insets.bottom} onPress={() => {}} />
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
