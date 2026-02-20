import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ProfileSkeleton() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.heroBlock, shimmerStyle]} />
      <Animated.View style={[styles.streakCircle, shimmerStyle]} />
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <Animated.View key={i} style={[styles.gridCard, shimmerStyle]} />
        ))}
      </View>
      <Animated.View style={[styles.achievementsStrip, shimmerStyle]} />
      <Animated.View style={[styles.moodBlock, shimmerStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  heroBlock: {
    height: 160,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  streakCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (SCREEN_WIDTH - 52) / 2 - 6,
    height: 88,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  achievementsStrip: {
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  moodBlock: {
    height: 140,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
