import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

type NeuralOrbProps = {
  size?: number;
};

export function NeuralOrb({ size = 100 }: NeuralOrbProps) {
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);
  const particleOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    rotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
    particleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1200 }),
        withTiming(0.5, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { rotate: `${rotate.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [1, 1.08], [0.3, 0.5]),
    transform: [{ scale: pulse.value * 1.2 }],
  }));

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
      <Animated.View style={[styles.glow, { width: size * 1.4, height: size * 1.4 }, glowStyle]}>
        <LinearGradient
          colors={[
            'rgba(45, 156, 219, 0.4)',
            'rgba(82, 183, 136, 0.25)',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.orb, { width: size, height: size }, orbStyle]}>
        <LinearGradient
          colors={[colors.accent, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.orbInner} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb: {
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  orbInner: {
    position: 'absolute',
    width: '35%',
    height: '35%',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.35)',
    top: '50%',
    left: '50%',
    marginTop: '-17.5%',
    marginLeft: '-17.5%',
  },
});
