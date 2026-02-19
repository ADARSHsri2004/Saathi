import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../../theme';
import { PLANNER_DURATION } from '../../constants/plannerAnimations';

type AssessmentProgressBarProps = {
  progress: number;
  total: number;
  glow?: boolean;
};

export function AssessmentProgressBar({ progress, total, glow }: AssessmentProgressBarProps) {
  const fillWidth = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const trackWidth = useSharedValue(0);

  useEffect(() => {
    const p = total > 0 ? progress / total : 0;
    fillWidth.value = withTiming(p, { duration: PLANNER_DURATION });
    glowOpacity.value = withTiming(glow ? 1 : 0, { duration: 200 });
  }, [progress, total, glow]);

  const fillStyle = useAnimatedStyle(() => ({
    width: fillWidth.value * trackWidth.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.3,
  }));

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => {
        trackWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      {glow && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.glowTrack, glowStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  track: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressBackground,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressFill,
  },
  glowTrack: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
  },
});
