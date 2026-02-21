import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import { PrimaryButton, ProgressIndicator } from '../components/index';
import { CompanionApi } from '../services/api';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, typography, spacing, borderRadius } from '../theme/index';
import type { OnboardingStackParamList } from '../navigation/OnboardingStack';

  type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BasicDetails'>;

  export function BasicDetailsScreen() {
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();
    const { state, setDisplayName, setAge, setRole, setPatientId, createUser, isLoading, error, saveToBackend, completeOnboarding, markOnboardingComplete } = useOnboarding();
    const photoOpacity = useSharedValue(0);
    const roleOpacity = useSharedValue(0);
    const nameOpacity = useSharedValue(0);
    const ageOpacity = useSharedValue(0);
    const patientIdOpacity = useSharedValue(0);
    const ctaOpacity = useSharedValue(0);

    useEffect(() => {
      photoOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
      roleOpacity.value = withDelay(150, withTiming(1, { duration: 400 }));
      nameOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
      ageOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
      patientIdOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
      ctaOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));
    }, []);

    const photoStyle = useAnimatedStyle(() => ({ opacity: photoOpacity.value }));
    const roleStyle = useAnimatedStyle(() => ({ opacity: roleOpacity.value }));
    const nameStyle = useAnimatedStyle(() => ({ opacity: nameOpacity.value }));
    const ageStyle = useAnimatedStyle(() => ({ opacity: ageOpacity.value }));
    const patientIdStyle = useAnimatedStyle(() => ({ opacity: patientIdOpacity.value }));
    const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

    const canProceed = state.displayName.trim().length > 0 && 
                       (state.role === 'patient' || (state.role === 'companion' && state.patientId.trim().length > 0));

    const handleNext = async () => {
      if (state.role === 'companion' && !state.patientId.trim()) {
        Alert.alert('Error', 'Please enter the patient ID');
        return;
      }
    
      try {
        const age = state.age ? parseInt(state.age) : undefined;
        const trimmedPatientId = state.patientId.trim();

        // If companion, validate patientId exists and has onboarding data before creating the companion user
        if (state.role === 'companion') {
          try {
            await CompanionApi.getPatientDashboard(trimmedPatientId);
          } catch (e) {
            console.error('Patient validation failed:', e);
            Alert.alert('Invalid Patient ID', 'Could not find patient data for the provided ID. Please verify the patient ID and try again.');
            return;
          }
        }

        // Create user and get the userId back
        const userId = await createUser(state.displayName, age, state.role || 'patient');
      
        // Companions skip rest of onboarding and go directly to dashboard
        if (state.role === 'companion') {
          // Explicitly set and persist patientId for companion
          setPatientId(trimmedPatientId);
          
          // Companions don't need to save onboarding data, just complete onboarding
          // Pass userId directly to avoid async state update timing issues
          await completeOnboarding(userId);
          await markOnboardingComplete();
        } else {
          navigation.navigate('AwarenessContext');
        }
      } catch (err) {
        console.error('Failed to create user:', err);
        Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      }
    };

    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.progress}>
          <ProgressIndicator currentStep={1} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.photoWrap, photoStyle]}>
            <TouchableOpacity
              style={styles.photoPlaceholder}
              activeOpacity={0.8}
              onPress={() => { }}
            >
              <Text style={styles.photoHint}>+ Photo</Text>
              <Text style={styles.photoSub}>tap to add later</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.fieldWrap, roleStyle]}>
            <Text style={styles.question}>Who are you?</Text>
            <View style={styles.roleButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  state.role === 'patient' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('patient')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.roleButtonText,
                  state.role === 'patient' && styles.roleButtonTextActive,
                ]}>
                  👤 Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  state.role === 'companion' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('companion')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.roleButtonText,
                  state.role === 'companion' && styles.roleButtonTextActive,
                ]}>
                  🤝 Companion
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View style={[styles.fieldWrap, nameStyle]}>
            <Text style={styles.question}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              value={state.displayName}
              onChangeText={setDisplayName}
              placeholder="Your name or nickname"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={40}
            />
          </Animated.View>

          <Animated.View style={[styles.fieldWrap, ageStyle]}>
            <Text style={styles.question}>Age</Text>
            <TextInput
              style={styles.input}
              value={state.age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, '').slice(0, 3))}
              placeholder="Optional"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
            />
          </Animated.View>

          {state.role === 'companion' && (
            <Animated.View style={[styles.fieldWrap, patientIdStyle]}>
              <Text style={styles.question}>Patient ID</Text>
              <Text style={styles.helperText}>Ask the patient to share their ID with you</Text>
              <TextInput
                style={styles.input}
                value={state.patientId}
                onChangeText={setPatientId}
                placeholder="Paste the patient ID"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Animated.View>
          )}

          <Animated.View style={[styles.ctaWrap, ctaStyle]}>
            <PrimaryButton
              label="Next"
              onPress={handleNext}
              disabled={!canProceed || isLoading}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progress: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  photoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundCard,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  photoSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  fieldWrap: {
    marginBottom: spacing.lg,
  },
  question: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '15',
  },
  roleButtonText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  roleButtonTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  ctaWrap: {
    marginTop: spacing.xl,
  },
});
