import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ShieldOrb } from './ShieldOrb';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import type { AlertStyle } from './AlertStyleSelector';

type NotificationPreviewProps = {
  alertStyle: AlertStyle;
  onContinue: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable) as any;

export function NotificationPreview({ alertStyle, onContinue }: NotificationPreviewProps) {
  const insets = useSafeAreaInsets();
  const [notificationVisible, setNotificationVisible] = useState(false);
  const notificationScale = useSharedValue(0);
  const notificationOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Show notification after a delay
    setTimeout(() => {
      setNotificationVisible(true);
      notificationScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      notificationOpacity.value = withTiming(1, { duration: 400 });
    }, 1000);
  }, []);

  const handleNotificationPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );
  };

  const notificationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: notificationScale.value }],
    opacity: notificationOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const getNotificationContent = () => {
    switch (alertStyle) {
      case 'gentle':
        return {
          title: 'You\'re near a place you marked as risky',
          message: 'Remember your strength. You\'ve got this.',
          actions: ['Open Coping Exercise', 'I\'m Okay'],
        };
      case 'strong':
        return {
          title: 'Risk Zone Detected',
          message: 'Take a deep breath. Try a quick coping exercise.',
          actions: ['Open Coping Exercise', 'Call Support', 'I\'m Okay'],
        };
      case 'guardian':
        return {
          title: 'Guardian Alert',
          message: 'You\'re near a risky area. Immediate support available.',
          actions: ['Open Coping Exercise', 'Call Support', 'Emergency Help'],
        };
      default:
        return {
          title: 'Location Alert',
          message: 'You\'re near a place you marked as risky.',
          actions: ['Open Coping Exercise', 'I\'m Okay'],
        };
    }
  };

  const content = getNotificationContent();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0A1929', '#1A3A5C', '#2D5A7A']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>See How It Works</Text>
          <Text style={styles.subtitle}>
            This is what you'll see when approaching a risk zone
          </Text>
        </View>

        <View style={styles.orbContainer}>
          <ShieldOrb size={100} intensity={0.7} />
        </View>

        <View style={styles.previewContainer}>
          {notificationVisible && (
            <AnimatedPressable
              onPress={handleNotificationPress}
              style={[styles.notification, notificationStyle]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
                style={styles.notificationGradient}
              >
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    <Feather name="shield" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.notificationHeaderText}>
                    <Text style={styles.notificationAppName}>Saathi</Text>
                    <Text style={styles.notificationTime}>Now</Text>
                  </View>
                </View>

                <Text style={styles.notificationTitle}>{content.title}</Text>
                <Text style={styles.notificationMessage}>{content.message}</Text>

                <View style={styles.notificationActions}>
                  {content.actions.map((action, index) => (
                    <AnimatedPressable
                      key={index}
                      onPress={() => {
                        if (Platform.OS === 'ios') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                      style={[styles.notificationButton, buttonStyle]}
                    >
                      <Text style={styles.notificationButtonText}>{action}</Text>
                    </AnimatedPressable>
                  ))}
                </View>
              </LinearGradient>
            </AnimatedPressable>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Continue"
            onPress={onContinue}
            showArrow={true}
          />
        </View>
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
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.hero,
    color: colors.textOnAccent,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    fontSize: 15,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginBottom: spacing.lg,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  notification: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  notificationGradient: {
    padding: spacing.lg,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  notificationHeaderText: {
    flex: 1,
  },
  notificationAppName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  notificationTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  notificationTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontSize: 18,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  notificationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  notificationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentSoft,
  },
  notificationButtonText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
});
