import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { scale as scaleSize, scaleFont, isSmallScreen } from '../../utils/responsive';
import { CircularProgressRing } from '../CircularProgressRing';

interface MoneySavedCardProps {
  amount: number;
  goal: number;
  goalReward: string;
  scrollY: SharedValue<number>;
}

export function MoneySavedCard({
  amount,
  goal,
  goalReward,
  scrollY,
}: MoneySavedCardProps) {
  const animatedAmount = useSharedValue(0);
  const coinFloat = useSharedValue(0);
  const smallScreen = isSmallScreen();

  useEffect(() => {
    animatedAmount.value = withTiming(amount, { duration: 2000 });
    coinFloat.value = withTiming(1, { duration: 2000 });
  }, [amount, goal]);

  const coinFloatStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          coinFloat.value,
          [0, 1],
          [0, -8]
        ),
      },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [100, 200], [1, 0.9], 'clamp');
    return { opacity };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={['#F59E0B', '#F97316', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { padding: smallScreen ? spacing.lg : spacing.xl }]}
      >
        <View style={styles.content}>
          <View style={styles.amountSection}>
            <Text style={styles.label}>Money Saved</Text>
            <Animated.Text style={[styles.amount, { fontSize: smallScreen ? scaleFont(30) : scaleFont(36) }]}>
              ₹{Math.round(animatedAmount.value).toLocaleString()}
            </Animated.Text>
          </View>

          <Animated.View style={[styles.coinStack, coinFloatStyle]}>
            <MaterialCommunityIcons 
              name="currency-usd" 
              size={smallScreen ? scaleSize(40) : scaleSize(48)} 
              color="#FFD700" 
            />
            <MaterialCommunityIcons
              name="currency-usd"
              size={smallScreen ? scaleSize(34) : scaleSize(40)}
              color="#FFA500"
              style={styles.coin2}
            />
            <MaterialCommunityIcons
              name="currency-usd"
              size={smallScreen ? scaleSize(30) : scaleSize(36)}
              color="#FF8C00"
              style={styles.coin3}
            />
          </Animated.View>
        </View>

        <View style={styles.goalSection}>
          <CircularProgressRing
            value={goal > 0 ? amount : 0}
            maxValue={goal > 0 ? goal : 1}
            radius={smallScreen ? 32 : 36}
            duration={1200}
            progressValueColor="#FFFFFF"
            activeStrokeColor="#FFFFFF"
            inActiveStrokeColor="rgba(255,255,255,0.3)"
            progressFormatter={(v) => `${goal > 0 ? Math.round((amount / goal) * 100) : 0}%`}
            showProgressValue={true}
          />
          <View style={styles.goalTextContainer}>
            <Text style={styles.goalLabel}>Reward Goal</Text>
            <Text style={styles.goalReward}>{goalReward}</Text>
            <Text style={styles.goalAmount}>₹{goal.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  gradient: {
    padding: spacing.xl,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  amountSection: {
    flex: 1,
  },
  label: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.hero,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  coinStack: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coin2: {
    position: 'absolute',
    top: 8,
    left: 4,
  },
  coin3: {
    position: 'absolute',
    top: 16,
    left: 8,
  },
  goalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  goalTextContainer: {
    flex: 1,
  },
  goalLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xxs,
  },
  goalReward: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  goalAmount: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
