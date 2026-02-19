import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../theme';

const SIDEBAR_WIDTH = 280;
const SLIDE_DURATION = 280;
const slideEasing = Easing.out(Easing.cubic);

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
};

type AppHeaderProps = {
  title?: string;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onHelpPress?: () => void;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  onCompanionPress?: () => void;
  onAboutPress?: () => void;
  elevated?: boolean;
};

export function AppHeader({
  title = 'Saathi',
  onMenuPress: onMenuPressProp,
  onNotificationsPress,
  onHelpPress,
  onProfilePress,
  onSettingsPress,
  onCompanionPress,
  onAboutPress,
  elevated = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const [sidebarVisible, setSidebarVisible] = React.useState(false);
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  const openSidebar = useCallback(() => {
    setSidebarVisible(true);
  }, []);

  const closeSidebar = useCallback(() => {
    translateX.value = withTiming(-SIDEBAR_WIDTH, {
      duration: SLIDE_DURATION,
      easing: slideEasing,
    });
    backdropOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setSidebarVisible)(false);
    });
  }, []);

  useEffect(() => {
    if (sidebarVisible) {
      translateX.value = withTiming(0, {
        duration: SLIDE_DURATION,
        easing: slideEasing,
      });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    }
  }, [sidebarVisible]);

  const handleMenuPress = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openSidebar();
    onMenuPressProp?.();
  }, [onMenuPressProp, openSidebar]);

  const handleMenuItemPress = useCallback(
    (fn?: () => void) => {
      if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      closeSidebar();
      setTimeout(() => fn?.(), 120);
    },
    [closeSidebar]
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <Feather name="user" size={22} color={colors.accent} />,
      onPress: onProfilePress,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Feather name="settings" size={22} color={colors.accent} />,
      onPress: onSettingsPress,
    },
    {
      id: 'companion',
      label: 'Companion',
      icon: <Feather name="users" size={22} color={colors.accent} />,
      onPress: onCompanionPress,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Ionicons name="notifications-outline" size={22} color={colors.accent} />,
      onPress: onNotificationsPress,
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <Feather name="help-circle" size={22} color={colors.accent} />,
      onPress: onHelpPress,
    },
    {
      id: 'about',
      label: 'About',
      icon: <MaterialCommunityIcons name="information-outline" size={22} color={colors.accent} />,
      onPress: onAboutPress,
    },
  ];

  return (
    <>
      <View
        style={[
          styles.wrapper,
          { paddingTop: insets.top + spacing.sm },
          elevated && styles.wrapperElevated,
        ]}
      >
        <View style={styles.container}>
          <Pressable
            onPress={handleMenuPress}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          >
            <Feather name="menu" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.rightGroup}>
            <Pressable
              onPress={onNotificationsPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={onHelpPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            >
              <Feather name="message-circle" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        visible={sidebarVisible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeSidebar}
          >
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.panel,
              {
                paddingTop: insets.top + spacing.md,
                paddingBottom: insets.bottom + spacing.lg,
              },
              panelStyle,
            ]}
          >
            <View style={styles.panelInner}>
              <View style={styles.panelHeader}>
                <View style={styles.panelLogo}>
                  <View style={styles.logoIconWrap}>
                    <MaterialCommunityIcons name="heart-pulse" size={28} color={colors.textOnAccent} />
                  </View>
                  <Text style={styles.panelTitle}>Saathi</Text>
                </View>
                <Pressable
                  onPress={closeSidebar}
                  style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
                  hitSlop={12}
                >
                  <Feather name="x" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.menuList}>
                {menuItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleMenuItemPress(item.onPress)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                >
                  <View style={styles.menuItemIcon}>{item.icon}</View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </Pressable>
              ))}
              </View>
            </View>

            <View style={styles.panelFooter}>
              <View style={styles.footerDivider} />
              <Text style={styles.footerText}>Your journey, one step at a time.</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
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
  iconButtonPressed: {
    opacity: 0.85,
    backgroundColor: colors.divider,
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.backgroundCard,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    shadowColor: colors.shadowHeavy,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  panelInner: {
    flex: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  panelLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  closeBtnPressed: {
    opacity: 0.8,
  },
  menuList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xxs,
    gap: spacing.md,
  },
  menuItemPressed: {
    backgroundColor: colors.accentSoft,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  panelFooter: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: spacing.md,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
