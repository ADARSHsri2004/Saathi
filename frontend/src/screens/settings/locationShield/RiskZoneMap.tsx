import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform, ActivityIndicator, ScrollView, TouchableOpacity, LayoutChangeEvent, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { CurrentLocationMap } from './CurrentLocationMap';
import { ShieldOrb } from './ShieldOrb';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { LocationShieldApi } from '../../../services/api';

const USER_ID_KEY = 'user_id';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

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

const DEFAULT_REGION = {
  latitude: 25.241,
  longitude: 86.985,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export function RiskZoneMap({ onContinue }: RiskZoneMapProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ lat: string; lon: string; display_name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [draftCenter, setDraftCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radius, setRadius] = useState(100);
  const radiusShared = useSharedValue(100);
  const sliderProgress = useSharedValue((100 - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS));
  const trackWidth = useSharedValue(Math.max(0, width - spacing.lg * 2));
  const rippleScale = useSharedValue(1);
  const particleOpacity = useSharedValue(0);
  const particleX = useSharedValue(width / 2);
  const particleY = useSharedValue(200);
  const orbIntensity = useSharedValue(0.6);
  const lastReportedRadius = useRef(100);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission not granted');
          setLocationLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setLocation(coords);
          setDraftCenter((prev) => prev ?? coords);
        }
      } catch (e) {
        if (!cancelled) {
          setLocationError('Could not get location');
        }
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!location) return;
    setDraftCenter((prev) => prev ?? location);
  }, [location]);

  const loadZones = useCallback(async () => {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      setZonesLoading(false);
      return;
    }
    try {
      const data = await LocationShieldApi.getZones(userId);
      setZones(data.map((z) => ({ ...z, id: z.id })));
    } catch {
      setZones([]);
    } finally {
      setZonesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!locationLoading) {
      loadZones();
    }
  }, [locationLoading, loadZones]);

  const searchPlaces = async () => {
    const q = searchText.trim();
    if (!q) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(q)}&limit=5`,
        { headers: { Accept: 'application/json', 'User-Agent': 'Saathi/1.0' } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data.map((r: any) => ({ lat: r.lat, lon: r.lon, display_name: r.display_name })));
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (lat: string, lon: string) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      setDraftCenter({ latitude, longitude });
      setSearchResults([]);
      setSearchText('');
    }
  };

  const handleMapPress = useCallback((coords: { latitude: number; longitude: number }) => {
    setDraftCenter(coords);
  }, []);

  useEffect(() => {
    radiusShared.value = radius;
    const p = (radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS);
    sliderProgress.value = withTiming(p, { duration: 150 });
    lastReportedRadius.current = radius;
    rippleScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200 })
      ),
      -1,
      false
    );
  }, [radius]);

  const handleSliderChange = useCallback((value: number) => {
    const newRadius = Math.round(Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, value)));
    if (newRadius === lastReportedRadius.current) return;
    lastReportedRadius.current = newRadius;
    setRadius(newRadius);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const onSliderLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) trackWidth.value = w;
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      const w = trackWidth.value;
      if (w <= 0) return;
      const x = Math.max(0, Math.min(w, e.x));
      const p = x / w;
      sliderProgress.value = p;
      const r = Math.round(MIN_RADIUS + p * (MAX_RADIUS - MIN_RADIUS));
      if (r !== lastReportedRadius.current) {
        runOnJS(handleSliderChange)(r);
      }
    })
    .onEnd(() => {
      'worklet';
      const p = sliderProgress.value;
      const r = Math.round(MIN_RADIUS + p * (MAX_RADIUS - MIN_RADIUS));
      sliderProgress.value = withTiming((r - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS), { duration: 100 });
      runOnJS(handleSliderChange)(r);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      'worklet';
      const w = trackWidth.value;
      if (w <= 0) return;
      const x = Math.max(0, Math.min(w, e.x));
      const p = x / w;
      sliderProgress.value = withTiming(p, { duration: 150 });
      const r = Math.round(MIN_RADIUS + p * (MAX_RADIUS - MIN_RADIUS));
      runOnJS(handleSliderChange)(r);
    });

  const sliderComposed = Gesture.Race(panGesture, tapGesture);

  const sliderFillStyle = useAnimatedStyle(() => ({
    width: `${sliderProgress.value * 100}%`,
  }));

  const sliderThumbStyle = useAnimatedStyle(() => ({
    left: `${sliderProgress.value * 100}%`,
  }));

  const handleSaveZone = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const center = draftCenter ?? location ?? { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude };
    const newZone: RiskZone = {
      id: Date.now().toString(),
      latitude: center.latitude,
      longitude: center.longitude,
      radius,
      name: searchText.trim() || 'Risk Zone',
    };
    const updatedZones = [...zones, newZone];

    particleOpacity.value = 1;
    particleX.value = withTiming(width / 2, { duration: 800 });
    particleY.value = withTiming(100, { duration: 800 }, () => {
      particleOpacity.value = withTiming(0, { duration: 200 });
      orbIntensity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.8, { duration: 300 })
      );
    });

    setZones(updatedZones);
    setSearchText('');
    setRadius(100);

    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (userId) {
      try {
        const saved = await LocationShieldApi.saveZones(
          userId,
          updatedZones.map((z) => ({ latitude: z.latitude, longitude: z.longitude, radius: z.radius, name: z.name }))
        );
        setZones(saved.map((z) => ({ ...z, id: z.id })));
      } catch {
        setZones(updatedZones);
      }
    }
  };

  const handleContinue = async () => {
    if (zones.length === 0) return;
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (userId) {
      try {
        await LocationShieldApi.saveZones(
          userId,
          zones.map((z) => ({ latitude: z.latitude, longitude: z.longitude, radius: z.radius, name: z.name }))
        );
      } catch {
        //
      }
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

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { maxWidth: width }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Mark Places That Feel Risky</Text>
            <Text style={styles.subtitle}>Saathi will alert you if you get close.</Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a place..."
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={(t) => { setSearchText(t); setSearchResults([]); }}
                onSubmitEditing={searchPlaces}
                returnKeyType="search"
              />
              <Pressable onPress={searchPlaces} style={styles.searchButton} disabled={searching || !searchText.trim()}>
                {searching ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Feather name="arrow-right" size={20} color={colors.accent} />
                )}
              </Pressable>
            </View>
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.searchResultsScroll}>
                  {searchResults.map((r, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.searchResultItem}
                      onPress={() => selectSearchResult(r.lat, r.lon)}
                      activeOpacity={0.7}
                    >
                      <Feather name="map-pin" size={16} color={colors.textMuted} />
                      <Text style={styles.searchResultText} numberOfLines={2}>{r.display_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.mapContainer}>
            {locationLoading ? (
              <View style={styles.mapPlaceholder}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.mapLoadingText}>Getting your location...</Text>
              </View>
            ) : locationError && !location ? (
              <View style={styles.mapPlaceholder}>
                <Feather name="map-pin" size={48} color={colors.textMuted} />
                <Text style={styles.mapLoadingText}>{locationError}</Text>
              </View>
            ) : (
              <CurrentLocationMap
                location={location}
                zones={zones}
                draftCenter={draftCenter}
                draftRadius={radius}
                onMapPress={handleMapPress}
              />
            )}
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Alert Radius</Text>
            <GestureDetector gesture={sliderComposed}>
              <Animated.View style={styles.sliderTrack} onLayout={onSliderLayout}>
                <Animated.View style={[styles.sliderFill, sliderFillStyle]} />
                <Animated.View style={[styles.sliderThumb, sliderThumbStyle]} />
              </Animated.View>
            </GestureDetector>
            <Text style={styles.radiusValue}>{radius}m</Text>
          </View>

          <View style={styles.orbContainer}>
            <Animated.View style={orbStyle}>
              <ShieldOrb size={80} intensity={orbIntensity.value} />
            </Animated.View>
            <Animated.View style={[styles.particle, particleStyle]}>
              <View style={styles.particleGlow} />
            </Animated.View>
          </View>

          <View style={[styles.actions, { maxWidth: width - spacing.lg * 2 }]}>
            {zones.length > 0 && (
              <PrimaryButton
                label="Add Another"
                onPress={handleSaveZone}
                style={[styles.addButton, styles.actionButton]}
              />
            )}
            <PrimaryButton
              label={zones.length === 0 ? 'Save Zone' : 'Continue'}
              onPress={zones.length === 0 ? handleSaveZone : handleContinue}
              showArrow={true}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
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
    flexShrink: 1,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    fontSize: 15,
    flexShrink: 1,
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
  searchButton: {
    padding: spacing.xs,
  },
  searchResults: {
    marginTop: spacing.xs,
    maxHeight: 160,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  searchResultsScroll: {
    maxHeight: 160,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchResultText: {
    flex: 1,
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  mapContainer: {
    minHeight: 220,
    height: 220,
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
    gap: spacing.md,
  },
  mapLoadingText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
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
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.lg,
    alignSelf: 'stretch',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionButton: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
