import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { profileColors } from './profileColors';
import { spacing, typography, borderRadius } from '../../theme';

interface MoodStats {
  calm: number;
  anxious: number;
  motivated: number;
  low: number;
}

interface MoodChartProps {
  moodStats: MoodStats;
}

const CHART_MAX = 100;
const BAR_HEIGHT = 24;
const LABELS: { key: keyof MoodStats; label: string; color: string }[] = [
  { key: 'calm', label: 'Calm', color: profileColors.success },
  { key: 'anxious', label: 'Anxious', color: profileColors.warning },
  { key: 'motivated', label: 'Motivated', color: profileColors.xp },
  { key: 'low', label: 'Low', color: profileColors.relapse },
];

export function MoodChart({ moodStats }: MoodChartProps) {
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);
  const progress4 = useSharedValue(0);

  useEffect(() => {
    const p1 = moodStats.calm / CHART_MAX;
    const p2 = moodStats.anxious / CHART_MAX;
    const p3 = moodStats.motivated / CHART_MAX;
    const p4 = moodStats.low / CHART_MAX;
    progress1.value = withTiming(p1, { duration: 800 });
    progress2.value = withTiming(p2, { duration: 800 });
    progress3.value = withTiming(p3, { duration: 800 });
    progress4.value = withTiming(p4, { duration: 800 });
  }, [moodStats]);

  const bar1Style = useAnimatedStyle(() => ({ width: `${progress1.value * 100}%` }));
  const bar2Style = useAnimatedStyle(() => ({ width: `${progress2.value * 100}%` }));
  const bar3Style = useAnimatedStyle(() => ({ width: `${progress3.value * 100}%` }));
  const bar4Style = useAnimatedStyle(() => ({ width: `${progress4.value * 100}%` }));

  const progressValues = [progress1, progress2, progress3, progress4];

  const barStyles = [bar1Style, bar2Style, bar3Style, bar4Style];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mood insight</Text>
      <View style={styles.card}>
        {LABELS.map(({ key, label, color }, i) => (
          <View key={key} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <View style={styles.track}>
              <Animated.View
                style={[styles.bar, { backgroundColor: color }, barStyles[i]]}
              />
            </View>
            <Text style={styles.rowValue}>{moodStats[key]}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.titleSmall,
    fontWeight: '700',
    color: profileColors.text,
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: profileColors.cardBorder,
    backgroundColor: profileColors.cardBg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    ...typography.caption,
    color: profileColors.text,
    width: 72,
  },
  track: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: BAR_HEIGHT / 2,
  },
  rowValue: {
    ...typography.caption,
    color: profileColors.text,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
});
