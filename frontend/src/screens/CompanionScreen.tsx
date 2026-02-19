import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppHeader } from '../components/AppHeader';
import { CompanionApi, type CompanionResponse, type CompanionPermission } from '../services/api';
import { colors, spacing, typography, borderRadius } from '../theme';

const USER_ID_KEY = 'user_id';
const CARD_RADIUS = 24;

const PERMISSION_LABELS: Record<CompanionPermission, string> = {
  view_streak: 'View my streak',
  relapse_alerts: 'Relapse alerts',
  emergency_contact: 'Emergency contact',
  weekly_summary: 'Weekly summary',
};

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return '****' + phone.slice(-4);
}

function EmptyStateIllustration() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withDelay(
      600,
      withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.ease) }, () => {
        pulse.value = withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) });
      })
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <Animated.View style={[styles.illustrationWrap, pulseStyle]}>
      <LinearGradient
        colors={[colors.accentSoft, colors.secondarySoft]}
        style={styles.illustrationCircle}
      >
        <View style={styles.illustrationInner}>
          <MaterialCommunityIcons name="account-group" size={56} color={colors.accent} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

type NavProp = NativeStackNavigationProp<MainStackParamList, 'Companion'>;

export function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [companion, setCompanion] = useState<CompanionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  const screenOpacity = useSharedValue(0);
  const screenTranslate = useSharedValue(20);
  const cardScale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);
  const breathingScale = useSharedValue(1);

  const fetchCompanion = useCallback(async () => {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      setCompanion(null);
      setLoading(false);
      return;
    }
    try {
      const data = await CompanionApi.get(userId);
      setCompanion(data);
    } catch {
      setCompanion(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCompanion();
    }, [fetchCompanion])
  );

  useEffect(() => {
    screenOpacity.value = withTiming(1, { duration: 400 });
    screenTranslate.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    if (companion) {
      cardScale.value = withDelay(200, withSpring(1, { damping: 18, stiffness: 100 }));
      cardOpacity.value = withDelay(200, withTiming(1, { duration: 350 }));
    }
  }, [!!companion]);

  useEffect(() => {
    if (!companion) return;
    breathingScale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [companion?.id]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: screenTranslate.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value * breathingScale.value }],
  }));

  const handleAddCompanion = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AddCompanion');
  };

  const handleRemovePress = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRemoveModalVisible(true);
  };

  const handleConfirmRemove = async () => {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) return;
    setRemoving(true);
    try {
      await CompanionApi.remove(userId);
      setRemoveModalVisible(false);
      setCompanion(null);
      if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Error', 'Could not remove companion. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#E8F4FC', '#F0F8FF', '#F5F0FA']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.headerWrapper, { paddingTop: insets.top + spacing.sm }]}>
        <AppHeader
          title="Companion"
          elevated={false}
          onMenuPress={() => {}}
          onNotificationsPress={() => {}}
          onHelpPress={() => {}}
          onCompanionPress={() => {}}
        />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: 56 + insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <Animated.View style={[styles.inner, screenStyle]}>
            {companion ? (
              <>
                <Text style={styles.sectionTitle}>Your recovery companion</Text>
                <Animated.View style={[styles.companionCard, cardStyle]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.78)']}
                    style={styles.companionCardGradient}
                  >
                    <View style={styles.companionCardHeader}>
                      <View style={styles.companionAvatar}>
                        <Feather name="user" size={28} color={colors.accent} />
                      </View>
                      <View style={styles.companionCardMeta}>
                        <Text style={styles.companionName}>{companion.name}</Text>
                        <Text style={styles.companionPhone}>
                          +{companion.countryCode} {maskPhone(companion.phone)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.badgesRow}>
                      {companion.permissions.slice(0, 4).map((p) => (
                        <View key={p} style={styles.badge}>
                          <Text style={styles.badgeText} numberOfLines={1}>
                            {PERMISSION_LABELS[p]}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Pressable
                      onPress={handleRemovePress}
                      style={({ pressed }) => [
                        styles.removeButton,
                        pressed && styles.removeButtonPressed,
                      ]}
                    >
                      <Feather name="user-minus" size={18} color={colors.error} />
                      <Text style={styles.removeButtonText}>Remove companion</Text>
                    </Pressable>
                  </LinearGradient>
                </Animated.View>
              </>
            ) : (
              <>
                <EmptyStateIllustration />
                <Text style={styles.emptyTitle}>
                  Recovery is stronger when someone stands beside you.
                </Text>
                <Text style={styles.emptySubtext}>
                  Invite someone you trust to support your journey.
                </Text>
                <Pressable
                  onPress={handleAddCompanion}
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.addButtonPressed,
                  ]}
                >
                  <Feather name="user-plus" size={20} color={colors.textOnAccent} />
                  <Text style={styles.addButtonText}>Add Companion</Text>
                </Pressable>
              </>
            )}

            {companion && (
              <Pressable
                onPress={handleAddCompanion}
                style={({ pressed }) => [
                  styles.addButtonSecondary,
                  pressed && styles.addButtonPressed,
                ]}
              >
                <Feather name="plus" size={18} color={colors.accent} />
                <Text style={styles.addButtonSecondaryText}>Invite another</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </Animated.View>

      <Modal
        visible={removeModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setRemoveModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setRemoveModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove companion?</Text>
            <Text style={styles.modalMessage}>
              They will no longer receive updates or alerts. You can invite them again later.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setRemoveModalVisible(false)}
                style={({ pressed }) => [styles.modalButton, styles.modalButtonCancel, pressed && styles.modalButtonPressed]}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmRemove}
                disabled={removing}
                style={({ pressed }) => [styles.modalButton, styles.modalButtonRemove, pressed && styles.modalButtonPressed]}
              >
                {removing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonRemoveText}>Remove</Text>
                )}
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  illustrationCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    alignSelf: 'center',
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addButtonText: {
    ...typography.button,
    color: colors.textOnAccent,
  },
  addButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    alignSelf: 'center',
    marginTop: spacing.xl,
  },
  addButtonSecondaryText: {
    ...typography.bodyMedium,
    color: colors.accent,
  },
  companionCard: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  companionCardGradient: {
    padding: spacing.lg,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  companionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  companionAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  companionCardMeta: {
    flex: 1,
  },
  companionName: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  companionPhone: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  badge: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondarySoft,
  },
  badgeText: {
    ...typography.caption,
    color: colors.secondary,
    maxWidth: 100,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  removeButtonPressed: {
    opacity: 0.8,
  },
  removeButtonText: {
    ...typography.bodySmall,
    color: colors.error,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.backgroundCard,
    borderRadius: CARD_RADIUS,
    padding: spacing.xl,
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPressed: {
    opacity: 0.9,
  },
  modalButtonCancel: {
    backgroundColor: colors.backgroundSecondary,
  },
  modalButtonCancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  modalButtonRemove: {
    backgroundColor: colors.error,
  },
  modalButtonRemoveText: {
    ...typography.button,
    color: colors.textOnAccent,
  },
});
