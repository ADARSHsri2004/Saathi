import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { buildLeafletMapHtml } from './leafletMapHtml';

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
  draftCenter: { latitude: number; longitude: number } | null;
  draftRadius: number;
  onMapPress?: (coords: { latitude: number; longitude: number }) => void;
};

export function CurrentLocationMap({
  location,
  zones,
  draftCenter,
  draftRadius,
  onMapPress,
}: CurrentLocationMapProps) {
  const webViewRef = useRef<WebView>(null);
  const lastInjectedLocation = useRef<{ latitude: number; longitude: number } | null>(null);

  if (Platform.OS === 'android') {
    if (!location) {
      return (
        <View style={styles.placeholder}>
          <Feather name="map-pin" size={48} color={colors.textMuted} />
          <Text style={styles.placeholderText}>Location not available</Text>
        </View>
      );
    }
    const html = buildLeafletMapHtml(location, zones, draftCenter, draftRadius);
    return (
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.map}
        scrollEnabled={false}
        originWhitelist={['*']}
        onMessage={(e) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === 'draftMove' && onMapPress) {
              onMapPress({ latitude: data.lat, longitude: data.lng });
            }
          } catch {
            //
          }
        }}
      />
    );
  }

  useEffect(() => {
    if (Platform.OS !== 'android' || !location) return;
    const prev = lastInjectedLocation.current;
    if (prev && prev.latitude === location.latitude && prev.longitude === location.longitude) return;
    lastInjectedLocation.current = location;
    const script = `window.updateUserLocation && window.updateUserLocation(${location.latitude}, ${location.longitude});`;
    const t = setTimeout(() => {
      webViewRef.current?.injectJavaScript(script);
    }, 100);
    return () => clearTimeout(t);
  }, [location?.latitude, location?.longitude]);

  const mapRef = useRef<MapView>(null);
  const prevCenter = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!draftCenter || !mapRef.current) return;
    const prev = prevCenter.current;
    const dist = prev
      ? Math.hypot(draftCenter.latitude - prev.latitude, draftCenter.longitude - prev.longitude)
      : 1;
    prevCenter.current = draftCenter;
    if (dist > 0.002) {
      mapRef.current.animateToRegion({
        ...draftCenter,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 400);
    }
  }, [draftCenter?.latitude, draftCenter?.longitude]);

  const centerForRegion = draftCenter ?? location ?? { latitude: 25.241, longitude: 86.985 };
  const region = {
    ...centerForRegion,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={region}
      showsUserLocation
      followsUserLocation
      showsMyLocationButton
      onPress={onMapPress ? (e) => onMapPress(e.nativeEvent.coordinate) : undefined}
    >
      {zones.map((zone) => (
        <React.Fragment key={zone.id}>
          <Marker
            coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
            title={zone.name}
            pinColor="#E53935"
          />
          <Circle
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            radius={zone.radius}
            strokeColor="rgba(229, 57, 53, 0.8)"
            fillColor="rgba(229, 57, 53, 0.2)"
          />
        </React.Fragment>
      ))}
      {draftCenter && (
        <>
          <Marker
            coordinate={draftCenter}
            title="New zone"
            pinColor="#E53935"
            draggable
            onDragEnd={(e) => onMapPress?.(e.nativeEvent.coordinate)}
          />
          <Circle
            center={draftCenter}
            radius={draftRadius}
            strokeColor="rgba(229, 57, 53, 0.7)"
            fillColor="rgba(229, 57, 53, 0.15)"
          />
        </>
      )}
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
