import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/index';
import { PrimaryButton } from '../components/PrimaryButton';

type NavProp = NativeStackNavigationProp<MainStackParamList, 'Profession'>;

type DoctorPlace = {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lon: number;
  distanceKm?: number;
};

const HARDCODED_DOCTORS: DoctorPlace[] = [
  { id: 'd1', name: 'Dr. Rajesh Kumar', address: 'Near Bus Stand, Bhagalpur', phone: '+91 612 1234567', lat: 25.2415, lon: 86.9850 },
  { id: 'd2', name: 'Dr. Priya Singh', address: 'Station Road, Bhagalpur', phone: '+91 612 2345678', lat: 25.2380, lon: 86.9900 },
  { id: 'd3', name: 'Dr. Amit Verma', address: 'MG Road, Bhagalpur', phone: '+91 612 3456789', lat: 25.2440, lon: 86.9800 },
  { id: 'd4', name: 'Dr. Sunita Devi', address: 'Near Gandhi Park', phone: '+91 98765 43210', lat: 25.2430, lon: 86.9890 },
  { id: 'd5', name: 'Dr. Anil Sharma', address: 'Hill View Colony', phone: '+91 612 9988776', lat: 25.2395, lon: 86.9835 },
  { id: 'd6', name: 'Dr. Kavita Jha', address: 'Bihar Hospital Road', phone: '+91 612 5566778', lat: 25.2455, lon: 86.9885 },
  { id: 'd7', name: 'Dr. Ramesh Gupta', address: 'College Road', phone: '+91 612 6677889', lat: 25.2375, lon: 86.9815 },
  { id: 'd8', name: 'Dr. Neelam Kumari', address: 'Sapna More', phone: '+91 612 7766554', lat: 25.2460, lon: 86.9825 },
  { id: 'd9', name: 'Dr. Vikash Patel', address: 'Kalyan Chowk', phone: '+91 612 8877665', lat: 25.2400, lon: 86.9870 },
  { id: 'd10', name: 'Dr. Pooja Sinha', address: 'Near Sadaqat Ashram', phone: '+91 612 4455667', lat: 25.2425, lon: 86.9860 },
  { id: 'd11', name: 'Dr. Sanjay Tiwari', address: 'Village Road', phone: '+91 612 3344556', lat: 25.2365, lon: 86.9840 },
  { id: 'd12', name: 'Dr. Meera Yadav', address: 'Green Park', phone: '+91 612 2233445', lat: 25.2470, lon: 86.9905 },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function ProfessionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [nearestDoctors, setNearestDoctors] = useState<DoctorPlace[]>([]);
  const [error, setError] = useState<string | null>(null);

  const requestLocationAndFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationGranted(false);
        setLoading(false);
        setError('Location permission is needed to show nearest doctors.');
        return;
      }
      setLocationGranted(true);

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;

      const withDistance = HARDCODED_DOCTORS.map((d) => ({
        ...d,
        distanceKm: Number(haversineKm(userLat, userLon, d.lat, d.lon).toFixed(2)),
      }));
      withDistance.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      setNearestDoctors(withDistance.slice(0, 10));
    } catch (e) {
      setError('Could not get location. Please try again.');
      setNearestDoctors(HARDCODED_DOCTORS.slice(0, 10).map((d) => ({ ...d, distanceKm: undefined })));
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const callDoctor = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Find doctors</Text>
        <View style={styles.headerRight} />
      </View>

      {locationGranted === null && !loading && (
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
          <View style={styles.promptCard}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="map-marker-radius" size={40} color={colors.accent} />
            </View>
            <Text style={styles.promptTitle}>Share your location</Text>
            <Text style={styles.promptText}>
              We need your live location to show the 10 nearest doctors with their address, contact and distance.
            </Text>
            <PrimaryButton label="Share location" onPress={requestLocationAndFetch} />
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {locationGranted === false && !loading && (
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
          <View style={styles.promptCard}>
            <MaterialCommunityIcons name="map-marker-off" size={40} color={colors.textMuted} />
            <Text style={styles.promptTitle}>Location denied</Text>
            <Text style={styles.promptText}>
              {error || 'Allow location access to see nearest doctors.'}
            </Text>
            <PrimaryButton label="Open settings" onPress={openSettings} />
            <Pressable style={styles.secondaryBtn} onPress={requestLocationAndFetch}>
              <Text style={styles.secondaryBtnText}>Try again</Text>
            </Pressable>
          </View>
        </View>
      )}

      {locationGranted === true && nearestDoctors.length > 0 && !loading && (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.listTitle}>10 nearest doctors</Text>
          {nearestDoctors.map((doc, index) => (
            <View key={doc.id} style={styles.doctorCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doc.name}</Text>
                <View style={styles.row}>
                  <Feather name="map-pin" size={14} color={colors.textMuted} />
                  <Text style={styles.doctorAddress}>{doc.address}</Text>
                </View>
                <View style={styles.row}>
                  <Feather name="phone" size={14} color={colors.textMuted} />
                  <Text style={styles.doctorPhone}>{doc.phone}</Text>
                </View>
                {doc.distanceKm != null && (
                  <View style={styles.distanceWrap}>
                    <MaterialCommunityIcons name="map-marker-distance" size={14} color={colors.accent} />
                    <Text style={styles.distanceText}>{doc.distanceKm} km away</Text>
                  </View>
                )}
              </View>
              <Pressable
                style={({ pressed }) => [styles.callBtn, pressed && styles.callBtnPressed]}
                onPress={() => callDoctor(doc.phone)}
              >
                <Feather name="phone-call" size={18} color={colors.textOnAccent} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {locationGranted === true && nearestDoctors.length === 0 && !loading && error && (
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton label="Try again" onPress={requestLocationAndFetch} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.backgroundCard,
  },
  backBtn: { padding: spacing.xs },
  backBtnPressed: { opacity: 0.7 },
  headerTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  headerRight: { width: 40 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  promptCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  promptTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  promptText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  secondaryBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryBtnText: {
    ...typography.label,
    color: colors.accent,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  listTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    ...typography.label,
    color: colors.accent,
    fontWeight: '700',
  },
  doctorInfo: { flex: 1 },
  doctorName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  doctorAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  doctorPhone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  distanceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  distanceText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  callBtnPressed: { opacity: 0.8 },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
