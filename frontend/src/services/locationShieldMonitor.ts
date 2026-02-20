import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationShieldApi, type RiskZoneItem } from './api';

const USER_ID_KEY = 'user_id';
const NOTIFIED_COOLDOWN_MS = 30 * 60 * 1000;
const LOCATION_UPDATE_INTERVAL_MS = 10000;
const DISTANCE_ACCURACY_M = 50;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isInsideZone(
  userLat: number,
  userLon: number,
  zone: RiskZoneItem
): boolean {
  const d = haversineMeters(userLat, userLon, zone.latitude, zone.longitude);
  return d <= zone.radius + DISTANCE_ACCURACY_M;
}

let lastNotified: Record<string, number> = {};
let watchSubscription: Location.LocationSubscription | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

async function checkZonesAndNotify(
  lat: number,
  lon: number,
  zones: RiskZoneItem[]
) {
  const now = Date.now();
  for (const zone of zones) {
    if (!isInsideZone(lat, lon, zone)) continue;
    const last = lastNotified[zone.id] ?? 0;
    if (now - last < NOTIFIED_COOLDOWN_MS) continue;
    lastNotified[zone.id] = now;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "You're near a risk zone",
          body: zone.name
            ? `Near ${zone.name}. Remember your strength.`
            : "You're near a place you marked as risky.",
          data: { zoneId: zone.id },
        },
        trigger: { seconds: 1 },
      });
    } catch {
      //
    }
  }
}

async function startPolling(zones: RiskZoneItem[]) {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await checkZonesAndNotify(
        pos.coords.latitude,
        pos.coords.longitude,
        zones
      );
    } catch {
      //
    }
  }, LOCATION_UPDATE_INTERVAL_MS);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export async function startLocationShieldMonitor() {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) return;
    const zones = await LocationShieldApi.getZones(userId);
    if (zones.length === 0) return;
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return;

    if (watchSubscription) {
      watchSubscription.remove();
      watchSubscription = null;
    }
    stopPolling();

    watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_UPDATE_INTERVAL_MS,
        distanceInterval: DISTANCE_ACCURACY_M,
      },
      (loc) => {
        checkZonesAndNotify(
          loc.coords.latitude,
          loc.coords.longitude,
          zones
        );
      }
    );
  } catch {
    stopPolling();
  }
}

export function stopLocationShieldMonitor() {
  if (watchSubscription) {
    watchSubscription.remove();
    watchSubscription = null;
  }
  stopPolling();
}
