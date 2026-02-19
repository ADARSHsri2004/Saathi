import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav, type BottomNavKey } from '../components/BottomNav';
import { colors, spacing, typography, borderRadius } from '../theme';
import type { MainStackParamList } from '../navigation/MainStack';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NavProp = NativeStackNavigationProp<MainStackParamList, 'Games'>;

export function GamesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Games"
          elevated={false}
          onMenuPress={() => {}}
          onNotificationsPress={() => {}}
          onHelpPress={() => {}}
        />
      </View>
      <View
        style={[
          styles.content,
          {
            paddingTop: 56 + insets.top + spacing.lg,
            paddingBottom: 86 + insets.bottom + spacing.xl,
          },
        ]}
      >
        <AnimatedPressable
          onPressIn={() => {
            scale.value = withTiming(0.98, { duration: 80 });
          }}
          onPressOut={() => {
            scale.value = withTiming(1, { duration: 150 });
          }}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('FocusRecallGame');
          }}
          style={[styles.card, animatedStyle]}
        >
          <View style={styles.cardIconWrap}>
            <MaterialCommunityIcons name="view-grid-outline" size={32} color={colors.accent} />
          </View>
          <Text style={styles.cardTitle}>Focus Recall</Text>
          <Text style={styles.cardSubtitle}>Train your mind. Reduce the urge.</Text>
          <Text style={styles.cardTagline}>Memorize. Match. Regain control.</Text>
          <View style={styles.cardCta}>
            <Text style={styles.cardCtaText}>Play</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.accent} />
          </View>
        </AnimatedPressable>
      </View>
      <BottomNav activeKey="games" onSelect={handleNavSelect} bottomInset={insets.bottom} />
    </View>
  );

  function handleNavSelect(key: BottomNavKey) {
    if (key === 'Assistant') navigation.navigate('Assistant');
    else if (key !== 'games') navigation.navigate('HomeDashboard');
  }
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
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  cardSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardTagline: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  cardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardCtaText: {
    ...typography.label,
    color: colors.accent,
  },
});
