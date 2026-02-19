import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type ShieldOrbProps = {
  size?: number;
  intensity?: number; // 0-1, controls glow intensity
  pulseSpeed?: number; // milliseconds
};

export function ShieldOrb({
  size = 120,
  intensity = 0.6,
  pulseSpeed = 3000,
}: ShieldOrbProps) {
  const breathingScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const auraScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Breathing animation
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: pulseSpeed,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: pulseSpeed,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: pulseSpeed * 0.8 }),
        withTiming(0.4, { duration: pulseSpeed * 0.8 })
      ),
      -1,
      false
    );

    // Outer aura expansion
    auraScale.value = withRepeat(
      withSequence(
        withTiming(1.3, {
          duration: pulseSpeed * 1.2,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(1, {
          duration: pulseSpeed * 0.8,
          easing: Easing.in(Easing.ease),
        })
      ),
      -1,
      false
    );

    // Slow rotation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [pulseSpeed]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathingScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * intensity,
    transform: [{ scale: breathingScale.value }],
  }));

  const auraStyle = useAnimatedStyle(() => ({
    opacity: interpolate(auraScale.value, [1, 1.3], [0.2, 0]),
    transform: [{ scale: auraScale.value }],
  }));

  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
      {/* Outer aura */}
      <Animated.View style={[styles.aura, { width: size * 1.5, height: size * 1.5 }, auraStyle]}>
        <LinearGradient
          colors={['rgba(45, 156, 219, 0.3)', 'rgba(82, 183, 136, 0.2)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Glow layer */}
      <Animated.View style={[styles.glow, { width: size, height: size }, glowStyle]}>
        <LinearGradient
          colors={[
            'rgba(45, 156, 219, 0.6)',
            'rgba(82, 183, 136, 0.4)',
            'rgba(138, 43, 226, 0.3)',
          ]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Main orb */}
      <Animated.View style={[styles.orb, { width: size, height: size }, orbStyle]}>
        <LinearGradient
          colors={['#2D9CDB', '#52B788', '#8A2BE2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.orbInner}>
          <View style={styles.orbCore} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb: {
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: '#2D9CDB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  orbInner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCore: {
    width: '40%',
    height: '40%',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
