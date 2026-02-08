import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PanicButtonProps = {
  onPress?: () => void;
  bottomOffset?: number;
};

export function PanicButton({ onPress, bottomOffset = 0 }: PanicButtonProps) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1400 }),
        withTiming(1, { duration: 1400 })
      ),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 1400 }),
        withTiming(0.5, { duration: 1400 })
      ),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset + spacing.lg }]}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <AnimatedPressable
        onPressIn={() => {
          pressScale.value = withTiming(0.96, { duration: 80 });
        }}
        onPressOut={() => {
          pressScale.value = withTiming(1, { duration: 160 });
        }}
        onPress={onPress}
        style={[styles.button, pressStyle]}
      >
        <MaterialCommunityIcons name="lifebuoy" size={26} color={colors.textOnAccent} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tertiarySoft,
  },
  button: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.tertiary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
});
