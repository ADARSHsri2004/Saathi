import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationShieldApi, type RiskZoneItem } from './api';

const USER_ID_KEY = 'user_id';
const LOCATION_SHIELD_ZONES_CACHE = 'location_shield_zones_cache';
const NOTIFIED_COOLDOWN_MS = 30 * 60 * 1000;
const DISTANCE_ACCURACY_M = 5;
const LOCATION_TASK_NAME = 'LOCATION_SHIELD_BACKGROUND_TASK';

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

export async function notifyIfInsideZonesNow(
  lat: number,
  lon: number,
  zones: RiskZoneItem[]
): Promise<void> {
  const now = Date.now();
  for (const zone of zones) {
    if (!isInsideZone(lat, lon, zone)) continue;
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

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: { data: { locations: Location.LocationObject[] }; error: Error | null }) => {
    if (error) return;
    const locations = data?.locations;
    if (!locations?.length) return;
    let zonesJson: string | null = null;
    try {
      zonesJson = await AsyncStorage.getItem(LOCATION_SHIELD_ZONES_CACHE);
    } catch {
      return;
    }
    if (!zonesJson) return;
    let zones: RiskZoneItem[];
    try {
      zones = JSON.parse(zonesJson);
    } catch {
      return;
    }
    if (!Array.isArray(zones) || zones.length === 0) return;
    const loc = locations[locations.length - 1];
    const { latitude, longitude } = loc.coords;
    await checkZonesAndNotify(latitude, longitude, zones);
  }
);

export async function startLocationShieldMonitor() {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) return;
    const zones = await LocationShieldApi.getZones(userId);
    if (zones.length === 0) return;

    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') return;

    try {
      await AsyncStorage.setItem(LOCATION_SHIELD_ZONES_CACHE, JSON.stringify(zones));
    } catch {
      //
    }

    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      await Location.requestBackgroundPermissionsAsync();
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,
      distanceInterval: 5,
      showsBackgroundLocationIndicator: true,
    });
  } catch {
    //
  }
}

export async function stopLocationShieldMonitor() {
  try {
    const running = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (running) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch {
    //
  }
}
