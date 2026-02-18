import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { ShieldOrb } from './ShieldOrb';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, typography, borderRadius } from '../../../theme';

const { width } = Dimensions.get('window');
const MIN_RADIUS = 50;
const MAX_RADIUS = 500;

type RiskZone = {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
};

type RiskZoneMapProps = {
  onContinue: (zones: RiskZone[]) => void;
};

export function RiskZoneMap({ onContinue }: RiskZoneMapProps) {
  const insets = useSafeAreaInsets();
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [searchText, setSearchText] = useState('');
  const [radius, setRadius] = useState(100);
  const radiusShared = useSharedValue(100);
  const rippleScale = useSharedValue(1);
  const particleOpacity = useSharedValue(0);
  const particleX = useSharedValue(width / 2);
  const particleY = useSharedValue(200);
  const orbIntensity = useSharedValue(0.6);

  useEffect(() => {
    radiusShared.value = radius;
    rippleScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200 })
      ),
      -1,
      false
    );
  }, [radius]);

  const handleSliderChange = (value: number) => {
    const newRadius = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, value));
    setRadius(newRadius);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const progress = Math.max(0, Math.min(1, (e.x - spacing.lg) / (width - spacing.lg * 2)));
      const newRadius = MIN_RADIUS + progress * (MAX_RADIUS - MIN_RADIUS);
      handleSliderChange(newRadius);
    })
    .onEnd(() => {
      radiusShared.value = withTiming(radius);
    });

  const handleSaveZone = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const newZone: RiskZone = {
      id: Date.now().toString(),
      latitude: 0, // In real app, get from map
      longitude: 0,
      radius,
      name: searchText || 'Risk Zone',
    };

    // Animate particle flying to orb
    particleOpacity.value = 1;
    particleX.value = withTiming(width / 2, { duration: 800 });
    particleY.value = withTiming(100, { duration: 800 }, () => {
      particleOpacity.value = withTiming(0, { duration: 200 });
      orbIntensity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.8, { duration: 300 })
      );
    });

    setZones([...zones, newZone]);
    setSearchText('');
    setRadius(100);
  };

  const handleContinue = () => {
    if (zones.length === 0) {
      // Show gentle message
      return;
    }
    onContinue(zones);
  };

  const radiusStyle = useAnimatedStyle(() => {
    const scale = interpolate(radiusShared.value, [MIN_RADIUS, MAX_RADIUS], [0.5, 2]);
    return {
      transform: [{ scale: rippleScale.value * scale }],
    };
  });

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
    transform: [
      { translateX: particleX.value },
      { translateY: particleY.value },
    ],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbIntensity.value,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0A1929', '#1A3A5C', '#2D5A7A']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Mark Places That Feel Risky</Text>
          <Text style={styles.subtitle}>Saathi will alert you if you get close.</Text>
        </View>

        {/* Glassmorphism search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a place..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Map area with pulsing marker */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            {/* Center marker */}
            <View style={styles.centerMarker}>
              <View style={styles.markerDot} />
            </View>

            {/* Radius circle */}
            <Animated.View style={[styles.radiusCircle, radiusStyle]}>
              <View style={styles.radiusCircleInner} />
            </Animated.View>

            {/* Energy wave */}
            <Animated.View style={[styles.energyWave, radiusStyle]}>
              <LinearGradient
                colors={['rgba(45, 156, 219, 0.3)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Saved zones */}
            {zones.map((zone) => (
              <View
                key={zone.id}
                style={[
                  styles.savedZone,
                  {
                    width: (zone.radius / MAX_RADIUS) * 200,
                    height: (zone.radius / MAX_RADIUS) * 200,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Radius slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Alert Radius</Text>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.sliderTrack}>
              <Animated.View
                style={[
                  styles.sliderFill,
                  {
                    width: `${((radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100}%`,
                  },
                ]}
              />
              <Pressable
                style={[
                  styles.sliderThumb,
                  {
                    left: `${((radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100}%`,
                  },
                ]}
                onPressIn={() => {
                  if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              />
            </Animated.View>
          </GestureDetector>
          <Text style={styles.radiusValue}>{radius}m</Text>
        </View>

        {/* Shield orb with particles */}
        <View style={styles.orbContainer}>
          <Animated.View style={orbStyle}>
            <ShieldOrb size={80} intensity={orbIntensity.value} />
          </Animated.View>
          <Animated.View style={[styles.particle, particleStyle]}>
            <View style={styles.particleGlow} />
          </Animated.View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {zones.length > 0 && (
            <PrimaryButton
              label="Add Another"
              onPress={handleSaveZone}
              style={styles.addButton}
            />
          )}
          <PrimaryButton
            label={zones.length === 0 ? 'Save Zone' : 'Continue'}
            onPress={zones.length === 0 ? handleSaveZone : handleContinue}
            showArrow={true}
          />
        </View>
      </View>
    </View>
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
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  title: {
    ...typography.hero,
    color: colors.textOnAccent,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    fontSize: 15,
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textOnAccent,
    paddingVertical: spacing.xs,
  },
  mapContainer: {
    flex: 1,
    marginVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 58, 92, 0.5)',
  },
  centerMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  radiusCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(45, 156, 219, 0.5)',
    borderStyle: 'dashed',
  },
  radiusCircleInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9999,
    backgroundColor: 'rgba(45, 156, 219, 0.1)',
  },
  energyWave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  savedZone: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(82, 183, 136, 0.6)',
    backgroundColor: 'rgba(82, 183, 136, 0.1)',
  },
  sliderContainer: {
    marginBottom: spacing.lg,
  },
  sliderLabel: {
    ...typography.label,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    top: -9,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  radiusValue: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginBottom: spacing.md,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  particleGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
