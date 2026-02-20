import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../theme';

type Zone = {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
};

type CurrentLocationMapProps = {
  location: { latitude: number; longitude: number } | null;
  zones: Zone[];
};

function buildOsmEmbedUrl(lat: number, lon: number): string {
  const delta = 0.005;
  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
}

export function CurrentLocationMap({ location, zones }: CurrentLocationMapProps) {
  if (Platform.OS === 'android') {
    if (!location) {
      return (
        <View style={styles.placeholder}>
          <Feather name="map-pin" size={48} color={colors.textMuted} />
          <Text style={styles.placeholderText}>Location not available</Text>
        </View>
      );
    }
    return (
      <WebView
        source={{ uri: buildOsmEmbedUrl(location.latitude, location.longitude) }}
        style={styles.map}
        scrollEnabled={false}
      />
    );
  }

  const region = location
    ? {
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : {
        latitude: 25.241,
        longitude: 86.985,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton
    >
      {location && (
        <Marker
          coordinate={location}
          title="You are here"
          pinColor={colors.accent}
        />
      )}
      {zones.map((zone) => (
        <Circle
          key={zone.id}
          center={{ latitude: zone.latitude, longitude: zone.longitude }}
          radius={zone.radius}
          strokeColor="rgba(82, 183, 136, 0.8)"
          fillColor="rgba(82, 183, 136, 0.2)"
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    borderRadius: borderRadius.xl,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 58, 92, 0.5)',
    gap: spacing.md,
  },
  placeholderText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
