import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlannerStackParamList } from '../../navigation/PlannerStack';
import { usePlannerAssessment } from '../../context/PlannerAssessmentContext';
import { QuestionCard } from '../../components/planner/QuestionCard';
import { OptionTile } from '../../components/planner/OptionTile';
import { AssessmentProgressBar } from '../../components/planner/AssessmentProgressBar';
import { XPSpark } from '../../components/planner/XPSpark';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography, spacing } from '../../theme';
import { FTND_QUESTIONS } from '../../constants/plannerQuestions';
import { FTND_STEPS, XP_PER_QUESTION } from '../../constants/plannerAnimations';

type NavProp = NativeStackNavigationProp<PlannerStackParamList, 'Assessment'>;

export function AssessmentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { answers, setFtndAnswer } = usePlannerAssessment();
  const [step, setStep] = useState(0);
  const [showXp, setShowXp] = useState(false);

  const q = FTND_QUESTIONS[step];
  const selected = q ? answers.ftnd[step] : undefined;
  const isLast = step === FTND_QUESTIONS.length - 1;

  const handleSelect = useCallback(
    (value: number) => {
      setFtndAnswer(step, value);
      setShowXp(true);
      setTimeout(() => setShowXp(false), 800);
    },
    [step, setFtndAnswer]
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      navigation.navigate('LifestyleTriggers');
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, navigation]);

  if (!q) return null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.progressWrap}>
        <AssessmentProgressBar
          progress={step + (selected !== undefined ? 1 : 0)}
          total={FTND_STEPS}
          glow={selected !== undefined}
        />
      </View>
      <View style={styles.cardWrap}>
        <QuestionCard
          step={step + 1}
          totalSteps={FTND_STEPS}
          question={q.question}
          encouragement="Be honest. This helps us build better support."
        >
          {q.options.map((opt) => (
            <OptionTile
              key={opt.value}
              label={opt.label}
              selected={selected === opt.value}
              onSelect={() => handleSelect(opt.value)}
            />
          ))}
        </QuestionCard>
        {showXp && (
          <View style={styles.xpWrap}>
            <XPSpark value={XP_PER_QUESTION} visible={showXp} />
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label={isLast ? 'Continue to lifestyle questions' : 'Next'}
          onPress={handleNext}
          disabled={selected === undefined}
          showArrow={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  cardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  xpWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
