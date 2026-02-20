import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlannerStackParamList } from '../../navigation/PlannerStack';
import { usePlannerAssessment } from '../../context/PlannerAssessmentContext';
import { SliderInput } from '../../components/planner/SliderInput';
import { MultiSelectTags } from '../../components/planner/MultiSelectTags';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography, spacing } from '../../theme';

type NavProp = NativeStackNavigationProp<PlannerStackParamList, 'LifestyleTriggers'>;

export function LifestyleTriggersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { answers, setYearsAddicted, setTriggers, addTrigger, setDailyConsumption } = usePlannerAssessment();

  const toggleTrigger = (tag: string) => {
    if (answers.triggers.includes(tag)) {
      setTriggers(answers.triggers.filter((t) => t !== tag));
    } else {
      setTriggers([...answers.triggers, tag]);
    }
  };

  // Validate that we have all required data
  const canProceed = answers.dailyConsumption && answers.dailyConsumption > 0 && answers.yearsAddicted > 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>How many cigarettes per day?</Text>
        <SliderInput
          value={answers.dailyConsumption || 5}
          min={1}
          max={40}
          valueSuffix="cigarettes"
          onValueChange={setDailyConsumption}
        />
        <Text style={styles.sectionTitle}>How long have you been addicted?</Text>
        <SliderInput
          value={answers.yearsAddicted}
          min={0}
          max={50}
          valueSuffix="years"
          onValueChange={setYearsAddicted}
        />
        <Text style={styles.sectionTitle}>What are your main triggers?</Text>
        <Text style={styles.hint}>Select all that apply. Add your own if needed.</Text>
        <MultiSelectTags
          selected={answers.triggers}
          onSelect={toggleTrigger}
          onAddCustom={addTrigger}
        />
        <View style={styles.footer}>
          <PrimaryButton
            label="Generate my plan"
            onPress={() => navigation.navigate('AIProcessing')}
            disabled={!canProceed}
            showArrow={true}
          />
          {!canProceed && (
            <Text style={styles.warningText}>
              Please fill in daily consumption and time addicted
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: spacing.xxl,
  },  warningText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
    textAlign: 'center',
  },});
