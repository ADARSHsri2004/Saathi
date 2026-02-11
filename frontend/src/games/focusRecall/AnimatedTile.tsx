import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TileSymbol } from './TileSymbol';
import { colors, spacing, borderRadius } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  symbolKey: number;
  isFlipped: boolean;
  isMatched: boolean;
  onPress: () => void;
  disabled?: boolean;
  size: number;
};

export function AnimatedTile({ symbolKey, isFlipped, isMatched, onPress, disabled, size }: Props) {
  const rotateY = useSharedValue(isFlipped ? 0 : 180);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    rotateY.value = withSpring(isFlipped ? 0 : 180, {
      damping: 14,
      stiffness: 120,
    });
  }, [isFlipped]);

  useEffect(() => {
    if (isMatched) {
      glowOpacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1.08, { damping: 10, stiffness: 200 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [isMatched]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 400 }, { rotateY: `${rotateY.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 400 }, { rotateY: `${rotateY.value + 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 400 }, { scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.4,
  }));

  const handlePress = () => {
    if (disabled || isFlipped || isMatched) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={[styles.outer, { width: size, height: size }, containerStyle]}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <AnimatedPressable
        onPress={handlePress}
        style={[styles.tile, { width: size, height: size }]}
        disabled={disabled || isMatched}
      >
        <Animated.View style={[styles.face, styles.backFace, backStyle]}>
          <View style={styles.backPattern} />
        </Animated.View>
        <Animated.View style={[styles.face, styles.frontFace, frontStyle]}>
          <TileSymbol symbolKey={symbolKey} />
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accent,
  },
  tile: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backFace: {
    backgroundColor: colors.backgroundSecondary,
  },
  frontFace: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  backPattern: {
    width: '70%',
    height: '70%',
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
});
