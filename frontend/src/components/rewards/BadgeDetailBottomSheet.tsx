import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { CircularProgressRing } from '../CircularProgressRing';
import type { Badge } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

interface BadgeDetailBottomSheetProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
}

export function BadgeDetailBottomSheet({
  visible,
  badge,
  onClose,
}: BadgeDetailBottomSheetProps) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible && badge) {
      translateY.value = withSpring(0, { damping: 20 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 20 });
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.9, { duration: 300 });
    }
  }, [visible, badge]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SHEET_HEIGHT * 0.3 || event.velocityY > 500) {
        translateY.value = withTiming(SHEET_HEIGHT, { duration: 300 });
        backdropOpacity.value = withTiming(0, { duration: 300 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />

          <Animated.View style={[styles.content, contentStyle]}>
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.badgeIconContainer,
                  !badge.unlocked && styles.badgeIconContainerLocked,
                ]}
              >
                <LinearGradient
                  colors={
                    badge.unlocked
                      ? ['#FFD700', '#FFA500', '#FF6B35']
                      : ['#E5E7EB', '#D1D5DB']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badgeGradient}
                >
                  <MaterialCommunityIcons
                    name={badge.icon as any}
                    size={64}
                    color={badge.unlocked ? '#FFFFFF' : colors.textMuted}
                  />
                </LinearGradient>
              </View>

              <Text style={styles.badgeTitle}>{badge.title}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={colors.accent}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Unlock Condition</Text>
                  <Text style={styles.detailValue}>
                    {badge.unlockCondition}
                  </Text>
                </View>
              </View>

              {!badge.unlocked && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <View style={styles.progressRingWrap}>
                    <CircularProgressRing
                      value={badge.progress * 100}
                      maxValue={100}
                      radius={48}
                      duration={800}
                      progressValueColor={colors.accent}
                      activeStrokeColor={colors.accent}
                      inActiveStrokeColor={colors.progressBackground}
                      progressFormatter={(v) => `${Math.round(v)}%`}
                      showProgressValue={true}
                    />
                  </View>
                </View>
              )}

              <View style={styles.motivationalContainer}>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={24}
                  color="#FFD700"
                />
                <Text style={styles.motivationalText}>
                  {badge.motivationalLine}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badgeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeIconContainerLocked: {
    opacity: 0.6,
  },
  badgeGradient: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTitle: {
    ...typography.title,
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  badgeDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xxs,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  progressContainer: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  progressLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  progressRingWrap: {
    alignItems: 'center',
  },
  motivationalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.milestoneSoft,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  motivationalText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  closeButtonPressed: {
    opacity: 0.8,
  },
  closeButtonText: {
    ...typography.button,
    color: colors.textOnAccent,
  },
});
