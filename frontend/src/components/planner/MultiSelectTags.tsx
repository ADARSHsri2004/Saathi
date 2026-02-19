import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { PLANNER_SPRING } from '../../constants/plannerAnimations';

const DEFAULT_TRIGGERS = [
  'Stress',
  'Social situations',
  'After meals',
  'Alcohol',
  'Boredom',
  'Morning coffee',
  'Driving',
  'Work breaks',
];

type MultiSelectTagsProps = {
  selected: string[];
  onSelect: (tag: string) => void;
  onAddCustom: (tag: string) => void;
};

function TagChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const activeValue = useSharedValue(selected ? 1 : 0);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    activeValue.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const handleTap = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectRef.current();
  }, []);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.96, PLANNER_SPRING);
    })
    .onFinalize((_, success) => {
      scale.value = withSpring(1, PLANNER_SPRING);
      if (success) runOnJS(handleTap)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      activeValue.value,
      [0, 1],
      [colors.backgroundSecondary, colors.accentSoft]
    ),
    borderColor: interpolateColor(
      activeValue.value,
      [0, 1],
      ['transparent', colors.accent]
    ),
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.chip, animatedStyle]}>
        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

export function MultiSelectTags({ selected, onSelect, onAddCustom }: MultiSelectTagsProps) {
  const [customText, setCustomText] = useState('');

  const handleAddCustom = useCallback(() => {
    const t = customText.trim();
    if (t) {
      onAddCustom(t);
      setCustomText('');
    }
  }, [customText, onAddCustom]);

  return (
    <View style={styles.wrap}>
      <View style={styles.chipRow}>
        {DEFAULT_TRIGGERS.map((tag) => (
          <TagChip
            key={tag}
            label={tag}
            selected={selected.includes(tag)}
            onSelect={() => onSelect(tag)}
          />
        ))}
      </View>
      <View style={styles.customRow}>
        <TextInput
          style={styles.input}
          placeholder="+ Add custom trigger"
          placeholderTextColor={colors.textMuted}
          value={customText}
          onChangeText={setCustomText}
          onSubmitEditing={handleAddCustom}
          returnKeyType="done"
        />
        {customText.trim().length > 0 && (
          <Animated.View style={styles.addWrap}>
            <Feather
              name="plus-circle"
              size={24}
              color={colors.accent}
              onPress={handleAddCustom}
            />
          </Animated.View>
        )}
      </View>
      {selected.filter((s) => !DEFAULT_TRIGGERS.includes(s)).length > 0 && (
        <View style={styles.customChips}>
          {selected
            .filter((s) => !DEFAULT_TRIGGERS.includes(s))
            .map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                selected
                onSelect={() => onSelect(tag)}
              />
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  chipLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  chipLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  addWrap: {
    padding: spacing.xs,
  },
  customChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
