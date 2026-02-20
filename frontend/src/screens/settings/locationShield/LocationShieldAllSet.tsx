import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { ShieldOrb } from './ShieldOrb';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, typography } from '../../../theme';

export const LOCATION_SHIELD_SETUP_KEY = 'location_shield_setup_complete';

type LocationShieldAllSetProps = {
  onContinue: () => void;
};

export function LocationShieldAllSet({ onContinue }: LocationShieldAllSetProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
  }, []);

  useEffect(() => {
    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return;
      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 16 }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: (1 - subtitleOpacity.value) * 16 }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleDone = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await AsyncStorage.setItem(LOCATION_SHIELD_SETUP_KEY, 'true');
    onContinue();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0A1929', '#1A3A5C', '#2D5A7A']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.content, { maxWidth: width }]}>
          <View style={styles.orbContainer}>
            <ShieldOrb size={140} intensity={0.9} />
          </View>
          <Animated.View style={[styles.textContainer, titleStyle]}>
            <Text style={styles.title}>All set</Text>
          </Animated.View>
          <Animated.View style={[styles.textContainer, subtitleStyle]}>
            <Text style={styles.subtitle}>
              You'll get an alert on your phone when you're near a risk zone.
            </Text>
          </Animated.View>
          <Animated.View style={[styles.buttonContainer, buttonStyle, { maxWidth: width - spacing.xl * 2 }]}>
            <PrimaryButton label="Done" onPress={handleDone} showArrow={true} />
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
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
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.md,
    flexShrink: 1,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
    flexShrink: 1,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    width: '100%',
    alignSelf: 'stretch',
  },
});
