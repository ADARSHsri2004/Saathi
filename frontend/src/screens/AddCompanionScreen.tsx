import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompanionApi, type CompanionPermission } from '../services/api';
import { PermissionToggle } from '../components/companion/PermissionToggle';
import { PrimaryButton } from '../components/PrimaryButton';
import { COUNTRIES } from '../constants/countries';
import { colors, spacing, typography, borderRadius } from '../theme';

const USER_ID_KEY = 'user_id';
const CARD_RADIUS = 24;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.5;

const PERMISSIONS: { key: CompanionPermission; label: string }[] = [
  { key: 'view_streak', label: 'View my streak' },
  { key: 'relapse_alerts', label: 'Receive relapse alerts' },
  { key: 'emergency_contact', label: 'Emergency contact' },
  { key: 'weekly_summary', label: 'Weekly summary' },
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
}

function getDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function AddCompanionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [permissions, setPermissions] = useState<Record<CompanionPermission, boolean>>({
    view_streak: false,
    relapse_alerts: false,
    emergency_contact: false,
    weekly_summary: false,
  });
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const sheetTranslate = useSharedValue(SCREEN_HEIGHT);
  const sheetBackdrop = useSharedValue(0);
  const successCheckScale = useSharedValue(0);
  const successCheckOpacity = useSharedValue(0);
  const successGlowOpacity = useSharedValue(0);
  const successTextOpacity = useSharedValue(0);

  const atLeastOnePermission = PERMISSIONS.some((p) => permissions[p.key]);
  const phoneDigits = getDigits(phone);
  const isValid =
    name.trim().length >= 2 &&
    phoneDigits.length >= 8 &&
    phoneDigits.length <= 15 &&
    atLeastOnePermission;

  useEffect(() => {
    if (countrySheetVisible) {
      sheetTranslate.value = withSpring(0, { damping: 24 });
      sheetBackdrop.value = withTiming(1, { duration: 280 });
    } else {
      sheetTranslate.value = withTiming(SCREEN_HEIGHT, { duration: 280 });
      sheetBackdrop.value = withTiming(0, { duration: 280 });
    }
  }, [countrySheetVisible]);

  useEffect(() => {
    if (!showSuccess) return;
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    successCheckOpacity.value = withTiming(1, { duration: 300 });
    successCheckScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    successGlowOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    successTextOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, [showSuccess]);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => {
      navigation.goBack();
    }, 2000);
    return () => clearTimeout(t);
  }, [showSuccess, navigation]);

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 10) setPhone(formatPhone(digits));
    setPhoneError('');
  };

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;
    setNameError('');
    setPhoneError('');
    if (name.trim().length < 2) {
      setNameError('Enter at least 2 characters');
      return;
    }
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      setPhoneError('Enter a valid phone number');
      return;
    }
    if (!atLeastOnePermission) {
      return;
    }
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      Alert.alert('Error', 'Please sign in again.');
      return;
    }
    setSubmitting(true);
    try {
      await CompanionApi.add(userId, {
        name: name.trim(),
        phone: phoneDigits,
        countryCode: country.dial,
        permissions: PERMISSIONS.filter((p) => permissions[p.key]).map((p) => p.key),
      });
      setShowSuccess(true);
    } catch (err) {
      setSubmitting(false);
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not invite companion. Try again.');
    }
  }, [isValid, submitting, name, phoneDigits, country.dial, permissions, atLeastOnePermission]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslate.value }],
  }));
  const sheetBackdropStyle = useAnimatedStyle(() => ({ opacity: sheetBackdrop.value }));
  const successCheckStyle = useAnimatedStyle(() => ({
    opacity: successCheckOpacity.value,
    transform: [{ scale: successCheckScale.value }],
  }));
  const successGlowStyle = useAnimatedStyle(() => ({ opacity: successGlowOpacity.value }));
  const successTextStyle = useAnimatedStyle(() => ({ opacity: successTextOpacity.value }));

  if (showSuccess) {
    return (
      <View style={styles.successOverlay}>
        <LinearGradient
          colors={['#E8F4FC', '#D4EDFA', '#E8E4F0']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.successContent, successTextStyle]}>
          <View style={styles.successCheckContainer}>
            <Animated.View style={[styles.successCheckWrap, successGlowStyle]}>
              <LinearGradient
                colors={[colors.accent, colors.secondary]}
                style={styles.successCheckGlow}
              />
            </Animated.View>
            <Animated.View style={[styles.successCheckCircle, successCheckStyle]}>
              <Feather name="check" size={48} color={colors.textOnAccent} />
            </Animated.View>
          </View>
          <Text style={styles.successTitle}>Companion Added</Text>
          <Text style={styles.successSubtitle}>We've notified them via SMS.</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#E8F4FC', '#F0F8FF', '#F5F0FA']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => {
            if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Companion</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 60}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={styles.fieldLabel}>Companion name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="e.g. Priya or Mom"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setNameError('');
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Phone number</Text>
            <View style={styles.phoneRow}>
              <Pressable
                onPress={() => {
                  if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCountrySheetVisible(true);
                }}
                style={({ pressed }) => [styles.countryButton, pressed && styles.countryButtonPressed]}
              >
                <Text style={styles.countryCode}>+{country.dial}</Text>
                <Feather name="chevron-down" size={18} color={colors.textSecondary} />
              </Pressable>
              <TextInput
                style={[styles.input, styles.phoneInput, phoneError ? styles.inputError : null]}
                placeholder="Phone number"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={16}
              />
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Permissions</Text>
            <Text style={styles.sectionHint}>Choose at least one. You can change these later.</Text>
            {PERMISSIONS.map((p) => (
              <PermissionToggle
                key={p.key}
                label={p.label}
                value={permissions[p.key]}
                onValueChange={(v) => setPermissions((prev) => ({ ...prev, [p.key]: v }))}
              />
            ))}
            {!atLeastOnePermission && (
              <Text style={styles.errorText}>Select at least one permission</Text>
            )}

            <View style={styles.submitWrap}>
              <PrimaryButton
                label="Invite Companion"
                onPress={handleSubmit}
                disabled={!isValid}
                loading={submitting}
                showArrow={false}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={countrySheetVisible}
        transparent
        animationType="none"
        onRequestClose={() => setCountrySheetVisible(false)}
      >
        <Animated.View style={[styles.sheetBackdrop, sheetBackdropStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setCountrySheetVisible(false)}
          />
        </Animated.View>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.sheetHandle} />
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {COUNTRIES.map((c) => (
              <Pressable
                key={c.code}
                onPress={() => {
                  setCountry(c);
                  setCountrySheetVisible(false);
                  if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [
                  styles.sheetRow,
                  pressed && styles.sheetRowPressed,
                  country.code === c.code && styles.sheetRowSelected,
                ]}
              >
                <Text style={styles.sheetRowText}>{c.name}</Text>
                <Text style={styles.sheetRowDial}>+{c.dial}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.9,
  },
  headerTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xxs,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: 90,
  },
  countryButtonPressed: {
    opacity: 0.9,
  },
  countryCode: {
    ...typography.body,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
  },
  sectionLabel: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  submitWrap: {
    marginTop: spacing.xl,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: SHEET_MAX_HEIGHT,
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sheetScroll: {
    maxHeight: SHEET_MAX_HEIGHT - 60,
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sheetRowPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  sheetRowSelected: {
    backgroundColor: colors.accentSoft,
  },
  sheetRowText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  sheetRowDial: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  successCheckContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheckWrap: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
  },
  successCheckGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    borderRadius: 70,
  },
  successCheckCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    ...typography.hero,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
