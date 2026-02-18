import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ShieldOrb } from './ShieldOrb';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { Feather } from '@expo/vector-icons';

type PermissionExplainerProps = {
  onAllow: () => void;
  onDenied?: () => void;
};

export function PermissionExplainer({ onAllow, onDenied }: PermissionExplainerProps) {
  const insets = useSafeAreaInsets();
  const orbOpacity = useSharedValue(0);
  const orbScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const bodyOpacity = useSharedValue(0);
  const bulletsOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const auraExpansion = useSharedValue(1);

  useEffect(() => {
    orbOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    orbScale.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    bodyOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    bulletsOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));

    // Expanding aura effect
    auraExpansion.value = withDelay(
      300,
      withTiming(1.5, { duration: 2000 }, () => {
        auraExpansion.value = 1;
      })
    );
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbOpacity.value,
    transform: [{ scale: orbScale.value }],
  }));

  const auraStyle = useAnimatedStyle(() => ({
    opacity: (1 - (auraExpansion.value - 1) * 2) * 0.3,
    transform: [{ scale: auraExpansion.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 20 }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
    transform: [{ translateY: (1 - bodyOpacity.value) * 20 }],
  }));

  const bulletsStyle = useAnimatedStyle(() => ({
    opacity: bulletsOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleAllowPress = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // In a real app, you would request location permission here
    // For now, we'll simulate it
    try {
      // const { status } = await Location.requestForegroundPermissionsAsync();
      // if (status === 'granted') {
      onAllow();
      // } else {
      //   onDenied?.();
      // }
    } catch (error) {
      onDenied?.();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0A1929', '#1A3A5C', '#2D5A7A']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.orbWrapper}>
          <Animated.View style={[styles.auraContainer, auraStyle]}>
            <View style={styles.auraCircle} />
          </Animated.View>
          <Animated.View style={orbStyle}>
            <ShieldOrb size={140} intensity={0.9} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.textContainer, titleStyle]}>
          <Text style={styles.title}>Let Saathi Watch Over You</Text>
        </Animated.View>

        <Animated.View style={[styles.textContainer, bodyStyle]}>
          <Text style={styles.body}>
            We use your location only to protect you during vulnerable moments.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.bulletsContainer, bulletsStyle]}>
          <BulletPoint icon="shield" text="No constant tracking" />
          <BulletPoint icon="lock" text="No selling data" />
          <BulletPoint icon="heart" text="Only risk prevention" />
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <PrimaryButton
            label="Allow Protection"
            onPress={handleAllowPress}
            showArrow={true}
          />
        </Animated.View>
      </View>
    </View>
  );
}

type BulletPointProps = {
  icon: string;
  text: string;
};

function BulletPoint({ icon, text }: BulletPointProps) {
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletIcon}>
        <Feather name={icon as any} size={20} color={colors.accent} />
      </View>
      <Text style={styles.bulletText}>{text}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
  },
  auraContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraCircle: {
    width: '80%',
    height: '80%',
    borderRadius: 9999,
    backgroundColor: 'rgba(45, 156, 219, 0.2)',
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
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  bulletsContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  bulletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(45, 156, 219, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bulletText: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 300,
  },
});
