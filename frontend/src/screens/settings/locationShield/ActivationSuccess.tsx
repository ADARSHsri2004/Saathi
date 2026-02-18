import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ShieldOrb } from './ShieldOrb';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, typography, borderRadius } from '../../../theme';

type ActivationSuccessProps = {
  onFinish: () => void;
};

export function ActivationSuccess({ onFinish }: ActivationSuccessProps) {
  const insets = useSafeAreaInsets();
  const orbScale = useSharedValue(0.8);
  const orbOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const energyWaveScale = useSharedValue(0);
  const energyWaveOpacity = useSharedValue(0);
  const particles = Array.from({ length: 30 }, () => ({
    x: useSharedValue(Math.random() * 400 - 200),
    y: useSharedValue(Math.random() * 400 - 200),
    opacity: useSharedValue(0),
    scale: useSharedValue(0),
  }));

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Orb entrance
    orbOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    orbScale.value = withDelay(200, withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) }));

    // Energy wave expansion
    energyWaveOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
    energyWaveScale.value = withDelay(
      400,
      withSequence(
        withTiming(3, { duration: 1500, easing: Easing.out(Easing.ease) }, () => {
          energyWaveOpacity.value = withTiming(0, { duration: 300 });
        }),
        withTiming(0, { duration: 0 })
      )
    );

    // Particles explosion
    particles.forEach((particle, index) => {
      particle.opacity.value = withDelay(
        600 + index * 20,
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 800 })
        )
      );
      particle.scale.value = withDelay(
        600 + index * 20,
        withTiming(1, { duration: 200 })
      );
      particle.x.value = withDelay(
        600 + index * 20,
        withTiming(particle.x.value * 2, { duration: 1000, easing: Easing.out(Easing.ease) })
      );
      particle.y.value = withDelay(
        600 + index * 20,
        withTiming(particle.y.value * 2, { duration: 1000, easing: Easing.out(Easing.ease) })
      );
    });

    // Text animations
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    subtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbOpacity.value,
    transform: [{ scale: orbScale.value }],
  }));

  const energyWaveStyle = useAnimatedStyle(() => {
    const opacity = interpolate(energyWaveScale.value, [0, 1, 3], [0, 0.6, 0]);
    return {
      opacity: energyWaveOpacity.value * opacity,
      transform: [{ scale: energyWaveScale.value }],
    };
  });

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 20 }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: (1 - subtitleOpacity.value) * 20 }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleFinish = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onFinish();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0A1929', '#1A3A5C', '#2D5A7A']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.orbWrapper}>
          {/* Energy wave */}
          <Animated.View style={[styles.energyWave, energyWaveStyle]}>
            <LinearGradient
              colors={['rgba(45, 156, 219, 0.4)', 'rgba(82, 183, 136, 0.3)', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Particles */}
          {particles.map((particle, index) => {
            const particleStyle = useAnimatedStyle(() => ({
              opacity: particle.opacity.value,
              transform: [
                { translateX: particle.x.value },
                { translateY: particle.y.value },
                { scale: particle.scale.value },
              ],
            }));

            return (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    left: '50%',
                    top: '50%',
                  },
                  particleStyle,
                ]}
              />
            );
          })}

          {/* Shield orb */}
          <Animated.View style={orbStyle}>
            <ShieldOrb size={160} intensity={1} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.textContainer, titleStyle]}>
          <Text style={styles.title}>Your Shield is Active</Text>
        </Animated.View>

        <Animated.View style={[styles.textContainer, subtitleStyle]}>
          <Text style={styles.subtitle}>
            We'll quietly protect you.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <PrimaryButton
            label="Finish"
            onPress={handleFinish}
            showArrow={false}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  orbWrapper: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  energyWave: {
    position: 'absolute',
    width: '65%',
    height: '65%',
    borderRadius: 9999,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.hero,
    color: colors.textOnAccent,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 300,
  },
});
