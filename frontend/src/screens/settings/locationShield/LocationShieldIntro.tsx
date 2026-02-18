import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ShieldOrb } from './ShieldOrb';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const { width, height } = Dimensions.get('window');

type LocationShieldIntroProps = {
  onNext: () => void;
};

export function LocationShieldIntro({ onNext }: LocationShieldIntroProps) {
  const insets = useSafeAreaInsets();
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: useSharedValue(Math.random() * width),
    y: useSharedValue(Math.random() * height),
    opacity: useSharedValue(0),
    scale: useSharedValue(0),
  }));

  useEffect(() => {
    // Animate particles
    particles.forEach((particle, index) => {
      particle.opacity.value = withDelay(
        index * 100,
        withTiming(0.6, { duration: 800 })
      );
      particle.scale.value = withDelay(
        index * 100,
        withTiming(1, { duration: 800 })
      );

      // Floating animation
      particle.y.value = withRepeat(
        withSequence(
          withTiming(particle.y.value - 30, {
            duration: 2000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(particle.y.value, {
            duration: 2000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    });

    // Animate content
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
  }, []);

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

  const handleBeginPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onNext();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0A1929', '#1A3A5C', '#2D5A7A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating particles */}
      {particles.map((particle) => {
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
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x.value,
                top: particle.y.value,
              },
              particleStyle,
            ]}
          />
        );
      })}

      <View style={styles.content}>
        <View style={styles.orbContainer}>
          <ShieldOrb size={140} intensity={0.8} />
        </View>

        <Animated.View style={[styles.textContainer, titleStyle]}>
          <Text style={styles.title}>Activate Your Location Shield</Text>
        </Animated.View>

        <Animated.View style={[styles.textContainer, subtitleStyle]}>
          <Text style={styles.subtitle}>
            Saathi can gently guide you away from risky places.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <PrimaryButton
            label="Begin Setup"
            onPress={handleBeginPress}
            pulse={true}
            showArrow={true}
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
  orbContainer: {
    marginBottom: spacing.xxl,
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
    marginBottom: spacing.md,
    fontSize: 32,
    fontWeight: '700',
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
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(45, 156, 219, 0.6)',
    shadowColor: '#2D9CDB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});
