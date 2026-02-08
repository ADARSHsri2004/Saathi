import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { PrimaryButton } from '../components/index';
import { colors, typography, spacing } from '../theme/index';
import type { OnboardingStackParamList } from '../navigation/OnboardingStack';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Intro'>;

export function IntroScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtextOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    subtextOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    ctaOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const subtextStyle = useAnimatedStyle(() => ({ opacity: subtextOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.logoPlaceholder, logoStyle]}>
        <Text style={styles.logoText}>S</Text>
      </Animated.View>
      <Animated.Text style={[styles.title, titleStyle]}>Saathi</Animated.Text>
      <Animated.Text style={[styles.subtext, subtextStyle]}>
        A gentle companion for awareness and recovery.{'\n'}
        No judgment — just reflection and support.
      </Animated.Text>
      <Animated.View style={[styles.ctaWrap, ctaStyle]}>
        <PrimaryButton label="Setup" onPress={() => navigation.navigate('BasicDetails')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accentSoft,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '300',
    color: colors.accent,
  },
  title: {
    ...typography.hero,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  ctaWrap: {
    width: '100%',
    maxWidth: 280,
  },
});
