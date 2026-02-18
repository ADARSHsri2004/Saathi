import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ShieldOrb } from './ShieldOrb';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, typography, borderRadius } from '../../../theme';

export type AlertStyle = 'gentle' | 'strong' | 'guardian';

type AlertStyleSelectorProps = {
  onSelect: (style: AlertStyle) => void;
};

type AlertCardProps = {
  id: AlertStyle;
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
};

export function AlertStyleSelector({ onSelect }: AlertStyleSelectorProps) {
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState<AlertStyle | null>(null);
  const orbIntensity = useSharedValue(0.6);
  const auraThickness = useSharedValue(1);

  useEffect(() => {
    if (selectedStyle) {
      const intensityMap = {
        gentle: 0.7,
        strong: 0.85,
        guardian: 1,
      };
      orbIntensity.value = withTiming(intensityMap[selectedStyle], { duration: 400 });
      auraThickness.value = withTiming(
        selectedStyle === 'guardian' ? 1.5 : selectedStyle === 'strong' ? 1.3 : 1,
        { duration: 400 }
      );
    }
  }, [selectedStyle]);

  const handleSelect = (style: AlertStyle) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedStyle(style);
  };

  const handleContinue = () => {
    if (selectedStyle) {
      onSelect(selectedStyle);
    }
  };

  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbIntensity.value,
  }));

  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: auraThickness.value }],
  }));

  const cards: Omit<AlertCardProps, 'selected' | 'onSelect'>[] = [
    {
      id: 'gentle',
      title: 'Gentle Reminder',
      description: 'Soft notification with encouraging message',
      icon: 'feather',
    },
    {
      id: 'strong',
      title: 'Strong Nudge',
      description: 'More direct language with coping suggestion',
      icon: 'shield',
    },
    {
      id: 'guardian',
      title: 'Guardian Mode',
      description: 'Immediate coping tools and emergency support',
      icon: 'heart',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0A1929', '#1A3A5C', '#2D5A7A']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>How Should Saathi Help You?</Text>
        </View>

        <View style={styles.orbWrapper}>
          <Animated.View style={[styles.auraContainer, auraStyle]}>
            <View style={styles.auraCircle} />
          </Animated.View>
          <Animated.View style={orbStyle}>
            <ShieldOrb
              size={100}
              intensity={selectedStyle ? { gentle: 0.7, strong: 0.85, guardian: 1 }[selectedStyle] : 0.6}
            />
          </Animated.View>
        </View>

        <View style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <AlertCard
              key={card.id}
              {...card}
              selected={selectedStyle === card.id}
              onSelect={() => handleSelect(card.id)}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!selectedStyle}
            showArrow={true}
          />
        </View>
      </View>
    </View>
  );
}

function AlertCard({ id, title, description, icon, selected, onSelect }: AlertCardProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.05, { damping: 15 });
      glowOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(-8, { damping: 15 });
    } else {
      scale.value = withSpring(1, { damping: 15 });
      glowOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15 });
    }
  }, [selected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98, { damping: 15 });
    })
    .onFinalize(() => {
      scale.value = withSpring(selected ? 1.05 : 1, { damping: 15 });
      runOnJS(onSelect)();
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.View style={[styles.cardGlow, glowStyle]} />
        <View style={styles.cardContent}>
          <View style={[styles.cardIcon, selected && styles.cardIconSelected]}>
            <Feather name={icon as any} size={28} color={selected ? colors.accent : colors.textMuted} />
          </View>
          <Text style={[styles.cardTitle, selected && styles.cardTitleSelected]}>
            {title}
          </Text>
          <Text style={styles.cardDescription}>{description}</Text>
          {selected && (
            <View style={styles.selectedIndicator}>
              <Feather name="check-circle" size={20} color={colors.accent} />
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.hero,
    color: colors.textOnAccent,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
  },
  orbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: spacing.lg,
  },
  auraContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(45, 156, 219, 0.2)',
  },
  cardsContainer: {
    flex: 1,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 156, 219, 0.2)',
    borderRadius: borderRadius.xl,
  },
  cardContent: {
    position: 'relative',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardIconSelected: {
    backgroundColor: 'rgba(45, 156, 219, 0.2)',
  },
  cardTitle: {
    ...typography.title,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
    fontSize: 20,
  },
  cardTitleSelected: {
    color: colors.textOnAccent,
  },
  cardDescription: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
});
