import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../theme';
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
  const onMapPressRef = useRef(onMapPress);
  onMapPressRef.current = onMapPress;

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.type === 'draftMove' && onMapPressRef.current) {
          onMapPressRef.current({ latitude: data.lat, longitude: data.lng });
        }
      } catch {
        //
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const hasAnyPoint = location || zones.length > 0 || draftCenter;
  if (!hasAnyPoint) {
    return (
      <View style={styles.placeholder}>
        <Feather name="map-pin" size={48} color={colors.textMuted} />
        <Text style={styles.text}>Location not available</Text>
      </View>
    );
  }

  const html = buildLeafletMapHtml(location, zones, draftCenter, draftRadius);

  return (
    <View style={styles.container}>
      <iframe
        title="Map"
        srcDoc={html}
        style={styles.iframe as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '100%',
    minHeight: 200,
    border: 0,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 58, 92, 0.5)',
    gap: spacing.md,
    minHeight: 200,
  },
  text: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
