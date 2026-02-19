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
import { NeuralOrb } from '../../components/planner/NeuralOrb';
import { colors, typography, spacing } from '../../theme';

type NavProp = NativeStackNavigationProp<PlannerStackParamList, 'AIProcessing'>;

const CYCLING_TEXTS = [
  'Mapping high-risk moments',
  'Understanding your triggers',
  'Designing your recovery rhythm',
  'Calibrating difficulty level',
];

const ARTIFICIAL_DELAY_MS = 3500;

export function AIProcessingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { markCompleted } = usePlannerAssessment();
  const [cycleIndex, setCycleIndex] = useState(0);
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
    const id = setTimeout(() => {
      markCompleted();
      navigation.replace('PlannerReveal');
    }, ARTIFICIAL_DELAY_MS);
    return () => clearTimeout(id);
  }, [markCompleted, navigation]);

  const headlineStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.orbWrap}>
        <NeuralOrb size={110} />
      </View>
      <Animated.Text style={[styles.headline, headlineStyle]}>
        Analyzing your patterns…
      </Animated.Text>
      <Animated.Text style={[styles.subtext, subStyle]}>
        {CYCLING_TEXTS[cycleIndex]}
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
