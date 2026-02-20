import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularProgressRing } from '../CircularProgressRing';
import { profileColors } from './profileColors';
import { spacing } from '../../theme';
import { scaleFont, isSmallScreen } from '../../utils/responsive';

interface StreakCircleProps {
  streakDays: number;
}

export function StreakCircle({ streakDays }: StreakCircleProps) {
  const radius = isSmallScreen() ? 80 : 90;
  const progress = Math.min(100, (streakDays / 30) * 100);

  return (
    <View style={styles.wrapper}>
      <CircularProgressRing
        value={streakDays}
        maxValue={30}
        radius={radius}
        duration={1200}
        title="Days"
        subtitle="Current Streak"
        titleColor={profileColors.text}
        subtitleColor="rgba(255,255,255,0.85)"
        progressValueColor={profileColors.text}
        activeStrokeColor={profileColors.streak}
        inActiveStrokeColor="rgba(255,255,255,0.2)"
        inActiveStrokeOpacity={0.5}
        activeStrokeWidth={10}
        inActiveStrokeWidth={10}
        showProgressValue={true}
        progressFormatter={(v) => String(Math.round(v))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
});
