import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../../theme';

const TOGGLE_WIDTH = 52;
const TOGGLE_HEIGHT = 30;
const THUMB_SIZE = 24;
const PADDING = 3;

type PermissionToggleProps = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

export function PermissionToggle({ label, value, onValueChange }: PermissionToggleProps) {
  const translateX = useSharedValue(value ? TOGGLE_WIDTH - THUMB_SIZE - PADDING * 2 : PADDING);
  const trackBg = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    translateX.value = withSpring(value ? TOGGLE_WIDTH - THUMB_SIZE - PADDING * 2 : PADDING, {
      damping: 20,
      stiffness: 300,
    });
    trackBg.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(trackBg.value, [0, 1], [colors.divider, colors.accent]),
  }));

  const handlePress = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(!value);
  };

  return (
    <Pressable onPress={handlePress} style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  track: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: TOGGLE_HEIGHT / 2,
    justifyContent: 'center',
    padding: PADDING,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFF',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
