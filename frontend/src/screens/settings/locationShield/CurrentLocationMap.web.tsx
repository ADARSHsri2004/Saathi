import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../theme';

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

export function CurrentLocationMap({ location }: CurrentLocationMapProps) {
  if (!location) {
    return (
      <View style={styles.placeholder}>
        <Feather name="map-pin" size={48} color={colors.textMuted} />
        <Text style={styles.text}>Location not available</Text>
      </View>
    );
  }

  const iframeSrc = buildOsmEmbedUrl(location.latitude, location.longitude);

  return (
    <View style={styles.container}>
      <iframe
        title="Current location"
        src={iframeSrc}
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
