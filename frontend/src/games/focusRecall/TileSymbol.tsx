import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

const SIZE = 28;

const SYMBOL_MAP: Record<number, React.ReactNode> = {
  0: <Feather name="wind" size={SIZE} color={colors.accent} />,
  1: <MaterialCommunityIcons name="pine-tree" size={SIZE} color={colors.secondary} />,
  2: <Feather name="droplet" size={SIZE} color={colors.info} />,
  3: <MaterialCommunityIcons name="brain" size={SIZE} color={colors.accentPressed} />,
  4: <MaterialCommunityIcons name="shield-check" size={SIZE} color={colors.secondary} />,
  5: <Feather name="sun" size={SIZE} color={colors.milestone} />,
  6: <MaterialCommunityIcons name="timer-outline" size={SIZE} color={colors.textSecondary} />,
  7: <Feather name="heart" size={SIZE} color={colors.error} />,
};

type Props = { symbolKey: number };

export function TileSymbol({ symbolKey }: Props) {
  return (
    <View style={styles.wrap}>
      {SYMBOL_MAP[symbolKey] ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE + 8,
    height: SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
