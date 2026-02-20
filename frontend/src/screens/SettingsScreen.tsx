import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../components/AppHeader';
import { colors, spacing, typography, borderRadius } from '../theme';
import { LOCATION_SHIELD_SETUP_KEY } from './settings/locationShield/LocationShieldAllSet';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable) as any;

type NavProp = NativeStackNavigationProp<MainStackParamList, 'Settings'>;

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [locationShieldActive, setLocationShieldActive] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem(LOCATION_SHIELD_SETUP_KEY).then((v) => {
        setLocationShieldActive(v === 'true');
      });
    }, [])
  );

  const handleLocationShieldPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (locationShieldActive) {
      navigation.navigate('LocationShieldStack', { screen: 'RiskZones' });
    } else {
      navigation.navigate('LocationShieldStack');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Settings"
          elevated={false}
          onMenuPress={() => {}}
          onProfilePress={() => navigation.navigate('Profile')}
          onNotificationsPress={() => {}}
          onHelpPress={() => {}}
          onCompanionPress={() => navigation.navigate('Companion')}
        />
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 56 + insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Protection</Text>
          <SettingsRow
            icon={<MaterialCommunityIcons name="shield-check" size={24} color={colors.accent} />}
            label="Location Shield"
            subtitle={locationShieldActive ? 'Active' : 'Not set up'}
            rightElement={
              locationShieldActive ? (
                <View style={styles.activeIndicator}>
                  <View style={styles.activeDot} />
                </View>
              ) : (
                <Feather name="chevron-right" size={20} color={colors.textMuted} />
              )
            }
            onPress={handleLocationShieldPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

type SettingsRowProps = {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress: () => void;
};

function SettingsRow({ icon, label, subtitle, rightElement, onPress }: SettingsRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.row, animatedStyle]}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.rowRight}>{rightElement}</View>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowRight: {
    marginLeft: spacing.sm,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
