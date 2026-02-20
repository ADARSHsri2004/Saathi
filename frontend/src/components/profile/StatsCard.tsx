import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { profileColors } from './profileColors';
import { spacing, typography, borderRadius } from '../../theme';

type StatKey = 'cleanDays' | 'relapses' | 'risk' | 'mood';

interface StatsCardProps {
  type: StatKey;
  value: string | number;
  label: string;
  subLabel?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StatsCard({ type, value, label, subLabel, riskLevel }: StatsCardProps) {
  const scale = useSharedValue(1);
  const numOpacity = useSharedValue(0);

  useEffect(() => {
    numOpacity.value = withTiming(1, { duration: 500 });
  }, [value]);

  const getIcon = () => {
    switch (type) {
      case 'cleanDays':
        return 'meditation';
      case 'relapses':
        return 'alert-circle';
      case 'risk':
        return 'target';
      case 'mood':
        return 'brain';
      default:
        return 'chart-box';
    }
  };

  const getRiskColor = () => {
    if (type !== 'risk') return profileColors.text;
    switch (riskLevel) {
      case 'low':
        return profileColors.success;
      case 'medium':
        return profileColors.warning;
      case 'high':
        return profileColors.relapse;
      default:
        return profileColors.text;
    }
  };

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedNum = useAnimatedStyle(() => ({ opacity: numOpacity.value }));

  const onPressIn = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.97, { duration: 100 });
  };
  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <AnimatedPressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.card, animatedCard]}
    >
      <LinearGradient
        colors={[profileColors.cardBg, 'rgba(255,255,255,0.05)']}
        style={styles.gradient}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name={getIcon() as any}
            size={24}
            color={type === 'relapses' ? profileColors.relapse : profileColors.xp}
          />
        </View>
        <Animated.Text
          style={[
            styles.value,
            animatedNum,
            type === 'risk' && { color: getRiskColor() },
          ]}
        >
          {value}
        </Animated.Text>
        <Text style={styles.label}>{label}</Text>
        {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: profileColors.cardBorder,
  },
  gradient: {
    padding: spacing.md,
    minHeight: 88,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.titleSmall,
    fontWeight: '700',
    color: profileColors.text,
  },
  label: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  subLabel: {
    ...typography.caption,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});
