import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { scale as scaleSize, scaleFont, isSmallScreen } from '../../utils/responsive';

interface WeeklyGrowthCardProps {
  improvementPercent: number;
  message: string;
  scrollY: SharedValue<number>;
}

export function WeeklyGrowthCard({
  improvementPercent,
  message,
  scrollY,
}: WeeklyGrowthCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const chartHeight = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 600 });
    chartHeight.value = withTiming(1, { duration: 1200 });
    if (improvementPercent > 0) {
      sparkleOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    const scrollOpacity = interpolate(
      scrollY.value,
      [400, 600],
      [1, 0.95],
      'clamp'
    );
    return {
      opacity: opacity.value * scrollOpacity,
      transform: [{ translateY: translateY.value }],
    };
  });

  const chartBar1Style = useAnimatedStyle(() => ({
    height: interpolate(chartHeight.value, [0, 1], [0, 40]),
  }));

  const chartBar2Style = useAnimatedStyle(() => ({
    height: interpolate(chartHeight.value, [0, 1], [0, 50]),
  }));

  const chartBar3Style = useAnimatedStyle(() => ({
    height: interpolate(chartHeight.value, [0, 1], [0, 60]),
  }));

  const chartBar4Style = useAnimatedStyle(() => ({
    height: interpolate(chartHeight.value, [0, 1], [0, 70]),
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={['#10B981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { padding: isSmallScreen() ? spacing.lg : spacing.xl }]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.title}>Weekly Growth</Text>
          </View>
          {improvementPercent > 0 && (
            <Animated.View style={[styles.sparkle, sparkleStyle]}>
              <MaterialCommunityIcons
                name="star"
                size={20}
                color="#FFD700"
              />
            </Animated.View>
          )}
        </View>

        <View style={[styles.content, isSmallScreen() && { flexDirection: 'column' }]}>
          <View style={styles.statsContainer}>
            <Text style={styles.percentLabel}>Improvement</Text>
            <Text style={[styles.percentValue, { fontSize: isSmallScreen() ? scaleFont(28) : scaleFont(32) }]}>+{improvementPercent}%</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={[styles.chartContainer, isSmallScreen() && { marginTop: spacing.md }]}>
            <View style={styles.chart}>
              <Animated.View style={[styles.chartBar, chartBar1Style]} />
              <Animated.View style={[styles.chartBar, chartBar2Style]} />
              <Animated.View style={[styles.chartBar, chartBar3Style]} />
              <Animated.View style={[styles.chartBar, chartBar4Style]} />
            </View>
            <Text style={styles.chartLabel}>Last 4 weeks</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  gradient: {
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sparkle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statsContainer: {
    flex: 1,
  },
  percentLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  percentValue: {
    ...typography.hero,
    fontSize: scaleFont(32),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    height: 80,
    marginBottom: spacing.sm,
  },
  chartBar: {
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  chartLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
});
