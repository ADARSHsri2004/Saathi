import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlannerStackParamList } from '../../navigation/PlannerStack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { usePlannerAssessment } from '../../context/PlannerAssessmentContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { NeuralOrb } from '../../components/planner/NeuralOrb';
import { colors, typography, spacing } from '../../theme';

type NavProp = NativeStackNavigationProp<PlannerStackParamList, 'AIProcessing'>;

const CYCLING_TEXTS = [
  'Mapping high-risk moments',
  'Understanding your triggers',
  'Designing your recovery rhythm',
  'Calibrating difficulty level',
];

export function AIProcessingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { generatePlan, markCompleted, answers } = usePlannerAssessment();
  const { state: onboardingState, isHydrating } = useOnboarding();
  const [cycleIndex, setCycleIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const opacity = useSharedValue(0);
  const subOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    subOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCycleIndex((i) => (i + 1) % CYCLING_TEXTS.length);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Wait for hydration to complete
    if (isHydrating) return;

    const callPlanGeneration = async () => {
      try {
        // Validate userId
        if (!onboardingState.userId) {
          throw new Error('User ID not available. Please restart the app and complete onboarding first.');
        }

        // Get daily consumption - prefer from planner assessment, fallback to onboarding
        let dailyConsumption = answers.dailyConsumption;
        
        if (!dailyConsumption || dailyConsumption <= 0) {
          // Fallback to onboarding data if available
          dailyConsumption = onboardingState.frequencyUnit === 'per_day' 
            ? onboardingState.frequencyQuantity 
            : Math.round(onboardingState.frequencyQuantity / 7);
        }

        if (!dailyConsumption || dailyConsumption <= 0) {
          throw new Error('Daily consumption data not available. Please enter how many cigarettes per day.');
        }

        // Call the API to generate the plan
        await generatePlan(onboardingState.userId, dailyConsumption);
        
        // Mark as completed and navigate to reveal screen
        markCompleted();
        navigation.replace('PlannerReveal');
      } catch (err: any) {
        console.error('Plan generation error:', err);
        setError(err.message || 'Failed to generate plan');
        
        // Wait a bit to show error then go back
        setTimeout(() => {
          navigation.goBack();
        }, 3000);
      }
    };

    // Add a small delay before starting the API call
    const timeout = setTimeout(callPlanGeneration, 1000);
    
    return () => clearTimeout(timeout);
  }, [generatePlan, markCompleted, navigation, onboardingState.userId, onboardingState.frequencyQuantity, onboardingState.frequencyUnit, isHydrating, answers.dailyConsumption]);

  const headlineStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.orbWrap}>
        <NeuralOrb size={110} />
      </View>
      <Animated.Text style={[styles.headline, headlineStyle]}>
        {error ? 'Oops! Something went wrong' : 'Analyzing your patterns…'}
      </Animated.Text>
      <Animated.Text style={[styles.subtext, subStyle]}>
        {error || CYCLING_TEXTS[cycleIndex]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbWrap: {
    marginBottom: spacing.xxl,
  },
  headline: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtext: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
