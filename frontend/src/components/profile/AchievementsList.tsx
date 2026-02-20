import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { profileColors } from './profileColors';
import { spacing, typography, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = 90;
const CARD_MARGIN = 10;

interface Achievement {
  id: string;
  title: string;
  unlocked: boolean;
}

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  const [selected, setSelected] = React.useState<Achievement | null>(null);

  const onPress = (item: Achievement) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(item);
  };

  const closeModal = () => setSelected(null);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <FlatList
        data={achievements}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AchievementBadge item={item} onPress={() => onPress(item)} />
        )}
      />
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalCard}>
            {selected && (
              <>
                <View
                  style={[
                    styles.modalIconWrap,
                    !selected.unlocked && styles.modalIconLocked,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={selected.unlocked ? 'medal' : 'lock'}
                    size={48}
                    color={selected.unlocked ? profileColors.streak : profileColors.text}
                  />
                </View>
                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.modalStatus}>
                  {selected.unlocked ? 'Unlocked' : 'Locked'}
                </Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function AchievementBadge({
  item,
  onPress,
}: {
  item: Achievement;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.badge,
          animatedStyle,
          !item.unlocked && styles.badgeLocked,
        ]}
      >
        <View
          style={[
            styles.badgeIconWrap,
            item.unlocked ? styles.badgeIconUnlocked : styles.badgeIconLocked,
          ]}
        >
          <MaterialCommunityIcons
            name={item.unlocked ? 'medal' : 'lock'}
            size={36}
            color={item.unlocked ? profileColors.streak : 'rgba(255,255,255,0.4)'}
          />
        </View>
        <Text
          style={[styles.badgeTitle, !item.unlocked && styles.badgeTitleLocked]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleSmall,
    fontWeight: '700',
    color: profileColors.text,
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingRight: spacing.lg,
    gap: CARD_MARGIN,
  },
  badge: {
    width: CARD_SIZE,
    marginRight: CARD_MARGIN,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: profileColors.cardBorder,
    backgroundColor: profileColors.cardBg,
    padding: spacing.sm,
    alignItems: 'center',
  },
  badgeLocked: {
    opacity: 0.85,
  },
  badgeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeIconUnlocked: {
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  badgeIconLocked: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badgeTitle: {
    ...typography.caption,
    color: profileColors.text,
    textAlign: 'center',
    fontSize: 11,
  },
  badgeTitleLocked: {
    color: 'rgba(255,255,255,0.5)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: borderRadius.xl,
    backgroundColor: profileColors.gradientMid,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: profileColors.cardBorder,
  },
  modalIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalIconLocked: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    ...typography.titleSmall,
    fontWeight: '700',
    color: profileColors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalStatus: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.lg,
  },
  modalCloseBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: profileColors.cardBg,
    borderRadius: borderRadius.md,
  },
  modalCloseText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: profileColors.text,
  },
});
