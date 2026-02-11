import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { CravingLevel, TileItem, FocusRecallAnalytics, OnGameComplete } from './types';
import { PREVIEW_SECONDS, GRID_CONFIG, PAIR_COUNT, MATCH_SCORE } from './constants';
import { buildTiles, flipTilesFaceDown } from './utils';
import { AnimatedTile } from './AnimatedTile';

const CRAVING_OPTIONS: CravingLevel[] = ['Low', 'Medium', 'High'];

type Phase = 'pregame' | 'preview' | 'matching' | 'complete';

type Props = {
  onGameComplete?: OnGameComplete;
  onReturnToGames: () => void;
};

export function FocusRecallGameScreen({ onGameComplete, onReturnToGames }: Props) {
  const insets = useSafeAreaInsets();
  const { width: winWidth } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>('pregame');
  const [cravingBefore, setCravingBefore] = useState<CravingLevel>('Medium');
  const [cravingAfter, setCravingAfter] = useState<CravingLevel | null>(null);
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [countdownText, setCountdownText] = useState('Memorize…');

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const firstTapTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pairCount = PAIR_COUNT[cravingBefore];
  const gridSize = GRID_CONFIG[cravingBefore];
  const previewSec = PREVIEW_SECONDS[cravingBefore];

  const breathOpacity = useSharedValue(0.4);
  const countdownOpacity = useSharedValue(1);
  const completeScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  const startGame = useCallback(() => {
    setCravingBefore(cravingBefore);
    const newTiles = buildTiles(pairCount);
    setTiles(newTiles);
    setSelectedIds([]);
    setScore(0);
    setMistakes(0);
    setTimerSeconds(0);
    setPhase('preview');
    setCountdownText('Memorize…');
    startTimeRef.current = null;
    endTimeRef.current = null;
    firstTapTimeRef.current = null;
  }, [cravingBefore, pairCount]);

  useEffect(() => {
    if (phase !== 'preview') return;
    breathOpacity.value = withSequence(
      withTiming(0.65, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      withTiming(0.35, { duration: 1200, easing: Easing.inOut(Easing.ease) })
    );
    const t = setTimeout(() => {
      setCountdownText('Memorize…');
      const flipAt = previewSec * 1000;
      const flipTimer = setTimeout(() => {
        setTiles((prev) => flipTilesFaceDown(prev));
        countdownOpacity.value = withTiming(0, { duration: 200 });
        setTimeout(() => {
          progressWidth.value = 0;
          setPhase('matching');
          startTimeRef.current = Date.now();
          timerRef.current = setInterval(() => {
            setTimerSeconds((s) => s + 1);
          }, 1000);
        }, 250);
      }, flipAt);
      return () => clearTimeout(flipTimer);
    }, 0);
    return () => clearTimeout(t);
  }, [phase, previewSec]);

  useEffect(() => {
    if (phase !== 'matching') return;
    const [id1, id2] = selectedIds;
    if (id2 === undefined) return;
    const t1 = tiles.find((t) => t.id === id1);
    const t2 = tiles.find((t) => t.id === id2);
    if (!t1 || !t2) return;
    if (t1.symbolKey === t2.symbolKey) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTiles((prev) =>
        prev.map((t) =>
          t.id === id1 || t.id === id2 ? { ...t, isMatched: true } : t
        )
      );
      setScore((s) => s + MATCH_SCORE);
      setSelectedIds([]);
      const newMatched = tiles.filter((t) => t.isMatched).length + 2;
      progressWidth.value = withSpring((newMatched / 2) / pairCount, {
        damping: 14,
        stiffness: 120,
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMistakes((m) => m + 1);
      setTimeout(() => {
        setTiles((prev) =>
          prev.map((t) =>
            t.id === id1 || t.id === id2 ? { ...t, isFlipped: false } : t
          )
        );
        setSelectedIds([]);
      }, 700);
    }
  }, [phase, selectedIds, tiles, pairCount]);

  useEffect(() => {
    if (phase !== 'matching') return;
    const matched = tiles.filter((t) => t.isMatched).length;
    if (matched === tiles.length && tiles.length > 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      endTimeRef.current = Date.now();
      completeScale.value = withSequence(
        withSpring(1.02, { damping: 12, stiffness: 100 }),
        withSpring(1)
      );
      setPhase('complete');
    }
  }, [phase, tiles]);

  const handleTilePress = useCallback(
    (id: string) => {
      if (phase !== 'matching' || selectedIds.length >= 2) return;
      const tile = tiles.find((t) => t.id === id);
      if (!tile || tile.isFlipped || tile.isMatched) return;
      if (!firstTapTimeRef.current && startTimeRef.current)
        firstTapTimeRef.current = Date.now();
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setTiles((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isFlipped: true } : t))
      );
    },
    [phase, selectedIds.length, tiles]
  );

  const completeData = (): FocusRecallAnalytics | null => {
    if (!startTimeRef.current || !endTimeRef.current) return null;
    const timeMs = endTimeRef.current - startTimeRef.current;
    const totalPairs = pairCount;
    const accuracy = totalPairs > 0 ? ((totalPairs - mistakes) / totalPairs) * 100 : 0;
    return {
      cravingBefore,
      cravingAfter: cravingAfter ?? cravingBefore,
      timeToCompletionMs: timeMs,
      mistakeCount: mistakes,
      totalPairs,
      reactionSpeedMs: firstTapTimeRef.current
        ? firstTapTimeRef.current - startTimeRef.current
        : null,
      sessionTimestamp: new Date().toISOString(),
      accuracyPercent: Math.round(accuracy),
      score,
    };
  };

  const handlePlayAgain = () => {
    setPhase('pregame');
    setCravingAfter(null);
    setTiles([]);
    setSelectedIds([]);
  };

  const handleReturn = () => {
    const data = completeData();
    if (data && onGameComplete) onGameComplete(data);
    onReturnToGames();
  };

  const breathStyle = useAnimatedStyle(() => ({
    opacity: breathOpacity.value,
  }));

  const countdownStyle = useAnimatedStyle(() => ({
    opacity: countdownOpacity.value,
  }));

  const completeCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completeScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progressWidth.value * 100, 100)}%`,
  }));

  const totalCells = gridSize.rows * gridSize.cols;
  const gap = spacing.sm;
  const maxGridWidth = winWidth - spacing.lg * 2;
  const cellSize = Math.min(
    (maxGridWidth - gap * (gridSize.cols - 1)) / gridSize.cols,
    72
  );

  if (phase === 'pregame') {
    return (
      <View style={styles.screen}>
        <View style={[styles.breathBg, breathStyle]} />
        <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
          <Text style={styles.title}>Focus Recall</Text>
          <Text style={styles.subtitle}>Train your mind. Reduce the urge.</Text>
          <Text style={styles.tagline}>Memorize. Match. Regain control.</Text>
          <View style={styles.cravingBlock}>
            <Text style={styles.cravingLabel}>How strong is your craving now?</Text>
            <View style={styles.cravingRow}>
              {CRAVING_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setCravingBefore(opt)}
                  style={[
                    styles.cravingChip,
                    cravingBefore === opt && styles.cravingChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.cravingChipText,
                      cravingBefore === opt && styles.cravingChipTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              startGame();
            }}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'preview' || phase === 'matching') {
    const showCountdown = phase === 'preview';
    return (
      <View style={styles.screen}>
        <View style={[styles.breathBg, breathStyle]} />
        {phase === 'matching' && (
          <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
            <Text style={styles.topBarText}>{timerSeconds}s</Text>
            <Text style={styles.topBarText}>
              {tiles.filter((t) => t.isMatched).length}/{pairCount}
            </Text>
            <Text style={styles.topBarText}>{score}</Text>
          </View>
        )}
        {phase === 'matching' && (
          <View style={[styles.progressTrack, { top: insets.top + 44 }]}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        )}
        <View
          style={[
            styles.gridWrap,
            {
              paddingTop: insets.top + (phase === 'matching' ? 72 : 48),
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View
            style={[
              styles.grid,
              {
                width: gridSize.cols * cellSize + gap * (gridSize.cols - 1),
              },
            ]}
          >
            {tiles.map((tile) => (
              <AnimatedTile
                key={tile.id}
                symbolKey={tile.symbolKey}
                isFlipped={tile.isFlipped}
                isMatched={tile.isMatched}
                onPress={() => handleTilePress(tile.id)}
                disabled={selectedIds.length >= 2}
                size={cellSize}
              />
            ))}
          </View>
        </View>
        {showCountdown && (
          <Animated.View style={[styles.countdownOverlay, countdownStyle]}>
            <Text style={styles.countdownLabel}>{countdownText}</Text>
          </Animated.View>
        )}
      </View>
    );
  }

  const data = completeData();
  const timeTaken = data ? Math.round(data.timeToCompletionMs / 1000) : 0;
  const encouragement =
    cravingAfter && cravingBefore !== cravingAfter
      ? 'You redirected your urge.'
      : 'Your focus is stronger than your craving.';
  const insight =
    cravingAfter && cravingBefore !== cravingAfter
      ? `Craving reduced from ${cravingBefore} to ${cravingAfter}.`
      : 'Working memory training reduces impulsive behavior.';

  return (
    <View style={[styles.screen, styles.completeScreen]}>
      <View
        style={[
          styles.completeContent,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        <Animated.View style={[styles.completeCard, completeCardStyle]}>
          <Text style={styles.completeTitle}>Well done</Text>
          <Text style={styles.completeStat}>
            Time: {timeTaken}s · Accuracy: {data?.accuracyPercent ?? 0}% · Score: {score}
          </Text>
          <Text style={styles.encouragement}>{encouragement}</Text>
          <Text style={styles.insightLabel}>How strong is your craving now?</Text>
          <View style={styles.cravingRow}>
            {CRAVING_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setCravingAfter(opt)}
                style={[
                  styles.cravingChip,
                  cravingAfter === opt && styles.cravingChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.cravingChipText,
                    cravingAfter === opt && styles.cravingChipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
          {cravingAfter && (
            <Text style={styles.insightText}>{insight}</Text>
          )}
          <Text style={styles.reinforcement}>
            Every time you play, your brain gets stronger.
          </Text>
          <View style={styles.completeButtons}>
            <Pressable
              onPress={handleReturn}
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.secondaryBtnText}>Return to Games</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (cravingAfter) {
                  const d = completeData();
                  if (d && onGameComplete) onGameComplete({ ...d, cravingAfter });
                }
                handlePlayAgain();
              }}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.primaryBtnText}>Play Again</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  breathBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accentLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.hero,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.titleSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  cravingBlock: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  cravingLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cravingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cravingChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  cravingChipActive: {
    backgroundColor: colors.accentSoft,
  },
  cravingChipText: {
    ...typography.label,
    color: colors.textMuted,
  },
  cravingChipTextActive: {
    color: colors.accentPressed,
  },
  startButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.accent,
  },
  startButtonText: {
    ...typography.button,
    color: colors.textOnAccent,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 2,
  },
  topBarText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  progressTrack: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.progressBackground,
    overflow: 'hidden',
    zIndex: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.progressFill,
  },
  gridWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,250,250,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownLabel: {
    ...typography.title,
    color: colors.accentPressed,
  },
  completeScreen: {
    justifyContent: 'center',
  },
  completeContent: {
    paddingHorizontal: spacing.lg,
  },
  completeCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  completeTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  completeStat: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  encouragement: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  insightLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  insightText: {
    ...typography.bodySmall,
    color: colors.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  reinforcement: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  completeButtons: {
    gap: spacing.sm,
  },
  secondaryBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.textOnAccent,
  },
  secondaryBtnText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  btnPressed: {
    opacity: 0.85,
  },
});
