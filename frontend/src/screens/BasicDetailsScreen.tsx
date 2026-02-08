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
import { useOnboarding } from '../context/OnboardingContext';
import { colors, typography, spacing, borderRadius } from '../theme/index';
import type { OnboardingStackParamList } from '../navigation/OnboardingStack';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BasicDetails'>;

export function BasicDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { state, setDisplayName, setAge } = useOnboarding();
  const photoOpacity = useSharedValue(0);
  const nameOpacity = useSharedValue(0);
  const ageOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    photoOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    nameOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    ageOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    ctaOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, []);

  const photoStyle = useAnimatedStyle(() => ({ opacity: photoOpacity.value }));
  const nameStyle = useAnimatedStyle(() => ({ opacity: nameOpacity.value }));
  const ageStyle = useAnimatedStyle(() => ({ opacity: ageOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const canProceed = state.displayName.trim().length > 0;

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

        <Animated.View style={[styles.ctaWrap, ctaStyle]}>
          <PrimaryButton
            label="Next"
            onPress={() => navigation.navigate('AwarenessContext')}
            disabled={!canProceed}
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
  ctaWrap: {
    marginTop: spacing.xl,
  },
});
