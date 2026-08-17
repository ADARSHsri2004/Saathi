import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationShieldApi, type RiskZoneItem } from './api';

const USER_ID_KEY = 'user_id';

const NOTIFIED_COOLDOWN_MS = 30 * 60 * 1000;

// For testing, use a shorter distance interval.
// Set this to 50 in production if appropriate.
const DISTANCE_INTERVAL_M = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
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
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function isInsideZone(
  userLat: number,
  userLon: number,
  zone: RiskZoneItem
): boolean {
  const distance = haversineMeters(
    userLat,
    userLon,
    zone.latitude,
    zone.longitude
  );

  console.log(
    `Zone "${zone.name}" distance: ${Math.round(distance)}m / radius: ${zone.radius}m`
  );

  return distance <= zone.radius;
}

const lastNotified: Record<string, number> = {};

let watchSubscription: Location.LocationSubscription | null = null;

let isStarting = false;

async function checkZonesAndNotify(
  latitude: number,
  longitude: number,
  zones: RiskZoneItem[]
) {
  const now = Date.now();

  console.log('Checking risk zones...');

  for (const zone of zones) {
    if (!isInsideZone(latitude, longitude, zone)) {
      continue;
    }

    console.log(`User is inside risk zone: ${zone.name}`);

    const lastNotification = lastNotified[zone.id] ?? 0;

    if (now - lastNotification < NOTIFIED_COOLDOWN_MS) {
      console.log(
        `Notification skipped due to cooldown: ${zone.name}`
      );
      continue;
    }

    lastNotified[zone.id] = now;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "You're near a risk zone",
          body: zone.name
            ? `Near ${zone.name}. Remember your strength.`
            : "You're near a place you marked as risky.",
          data: {
            zoneId: zone.id,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });

      console.log(`Notification scheduled for: ${zone.name}`);
    } catch (error) {
      console.error(
        'Failed to schedule notification:',
        error
      );
    }
  }
}

export async function startLocationShieldMonitor() {
  // Prevent multiple watchers from being created.
  if (watchSubscription || isStarting) {
    console.log('Location Shield already running.');
    return;
  }

  isStarting = true;

  try {
    console.log('Starting Location Shield...');

    // --------------------------------------------------
    // 1. Get user ID
    // --------------------------------------------------

    const userId = await AsyncStorage.getItem(USER_ID_KEY);

    if (!userId) {
      console.log('Location Shield: No user ID found.');
      return;
    }

    console.log('Location Shield user:', userId);

    // --------------------------------------------------
    // 2. Get risk zones
    // --------------------------------------------------

    const zones = await LocationShieldApi.getZones(userId);

    console.log('Risk zones:', zones);

    if (!zones || zones.length === 0) {
      console.log('Location Shield: No risk zones found.');
      return;
    }

    // --------------------------------------------------
    // 3. Request location permission
    // --------------------------------------------------

    const {
      status: locationStatus,
    } = await Location.requestForegroundPermissionsAsync();

    console.log(
      'Location permission:',
      locationStatus
    );

    if (locationStatus !== 'granted') {
      console.log(
        'Location permission was not granted.'
      );
      return;
    }

    // --------------------------------------------------
    // 4. Request notification permission
    // --------------------------------------------------

    const {
      status: notificationStatus,
    } = await Notifications.requestPermissionsAsync();

    console.log(
      'Notification permission:',
      notificationStatus
    );

    if (notificationStatus !== 'granted') {
      console.log(
        'Notification permission was not granted.'
      );

      // Monitoring can still continue.
      // User just won't receive notifications.
    }

    // --------------------------------------------------
    // 5. Start location watcher
    // --------------------------------------------------

    console.log('Starting location watcher...');

    watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,

        // For testing.
        // This allows updates without requiring 50m movement.
        distanceInterval: DISTANCE_INTERVAL_M,

        // Request an update roughly every 10 seconds.
        timeInterval: 10_000,
      },

      async (location) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = location.coords;

        console.log('--------------------------------');
        console.log('LOCATION UPDATE');
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
        console.log('Accuracy:', accuracy);
        console.log('--------------------------------');

        await checkZonesAndNotify(
          latitude,
          longitude,
          zones
        );
      }
    );

    console.log(
      'Location Shield watcher started successfully.'
    );
  } catch (error) {
    console.error(
      'Failed to start Location Shield:',
      error
    );

    watchSubscription = null;
  } finally {
    isStarting = false;
  }
}

export function stopLocationShieldMonitor() {
  console.log('Stopping Location Shield...');

  if (watchSubscription) {
    watchSubscription.remove();
    watchSubscription = null;
  }

  isStarting = false;

  console.log('Location Shield stopped.');
}