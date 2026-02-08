import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, typography, spacing } from '../theme';

/**
 * Placeholder end of onboarding. No home screen yet — per spec.
 */
export function CompleteScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding, saveToBackend, markOnboardingComplete } = useOnboarding();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Save to backend and complete onboarding when screen mounts
    let isMounted = true;
    let completionTimer: ReturnType<typeof setTimeout> | null = null;

    const handleCompletion = async () => {
      try {
        await saveToBackend();
        await completeOnboarding();
        if (!isMounted) return;
        setShowModal(true);
        completionTimer = setTimeout(() => {
          markOnboardingComplete();
        }, 1400);
      } catch (err) {
        console.error('Failed to complete onboarding:', err);
      }
    };

    handleCompletion();

    return () => {
      isMounted = false;
      if (completionTimer) clearTimeout(completionTimer);
    };
  }, [completeOnboarding, markOnboardingComplete, saveToBackend]);

  useEffect(() => {
    opacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    scale.value = withDelay(200, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.title}>You're all set</Text>
        <Text style={styles.subtext}>
          Your journey with Saathi begins now.{'\n'}
          We're here whenever you need a gentle reminder.
        </Text>
      </Animated.View>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Onboarding complete</Text>
            <Text style={styles.modalText}>All setup done. Welcome aboard.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
