import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

type AppHeaderProps = {
  title?: string;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onHelpPress?: () => void;
  elevated?: boolean;
};

export function AppHeader({
  title = 'Saathi',
  onMenuPress,
  onNotificationsPress,
  onHelpPress,
  elevated = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingTop: insets.top + spacing.sm },
        elevated && styles.wrapperElevated,
      ]}
    >
      <View style={styles.container}>
        <Pressable onPress={onMenuPress} style={styles.iconButton}>
          <Feather name="menu" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightGroup}>
          <Pressable onPress={onNotificationsPress} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={onHelpPress} style={styles.iconButton}>
            <Feather name="message-circle" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
  },
  wrapperElevated: {
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  container: {
    height: 56,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    fontFamily: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'serif' }),
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
