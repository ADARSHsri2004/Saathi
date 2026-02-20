import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../theme';
import { AssistantApi, type AssistantContextResponse, type ChatHistoryItem } from '../services/api';

const USER_ID_KEY = 'user_id';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = Math.min(100, Math.round(SCREEN_WIDTH * 0.26));
const BOT_IMAGE = require('../../assets/robot.png');

type Phase = 'loading' | 'entry' | 'presence' | 'greeting' | 'chat' | 'exit';

const GREETING_DEFAULT = (name: string) =>
  `Hi ${name}.\nI'm here with you.\nHow are you feeling right now?`;
const GREETING_PROACTIVE = (name: string) =>
  `Hi ${name}.\nI'm glad you're here.\nWhatever you're feeling, you're not alone. Take a breath with me.`;
const GREETING_CELEBRATE = (name: string) =>
  `Hi ${name}.\nLook at you — another day of strength.\nI'm so proud of you. How are you feeling?`;

const QUICK_CHIPS = [
  'I have a craving',
  'I feel anxious',
  'Distract me',
  'Motivate me',
  'Show my progress',
];

const MOOD_GRADIENTS = {
  calm: [colors.background, colors.backgroundSecondary, colors.accentLight] as const,
  high_risk: [colors.background, colors.backgroundSecondary, colors.warningSoft] as const,
  achievement: [colors.background, colors.backgroundSecondary, colors.milestoneSoft] as const,
};

export function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<AssistantContextResponse | null>(null);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [greetingVisibleLength, setGreetingVisibleLength] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const overlayOpacity = useSharedValue(0);
  const avatarTranslateY = useSharedValue(120);
  const avatarScale = useSharedValue(0.3);
  const avatarRotate = useSharedValue(0);
  const avatarOpacity = useSharedValue(0);
  const bubbleOpacity = useSharedValue(0);
  const chatHeight = useSharedValue(0);
  const breathingScale = useSharedValue(1);
  const particleY1 = useSharedValue(0);
  const particleY2 = useSharedValue(0);
  const particleY3 = useSharedValue(0);
  const exitAvatarY = useSharedValue(0);
  const exitOverlayOpacity = useSharedValue(1);

  const greetingText = context
    ? context.greetingHint === 'proactive'
      ? GREETING_PROACTIVE(context.displayName)
      : context.greetingHint === 'congratulatory'
        ? GREETING_CELEBRATE(context.displayName)
        : GREETING_DEFAULT(context.displayName)
    : '';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId || cancelled) {
        setContext({ displayName: 'there', streak: 0, riskLevel: 'calm', greetingHint: 'default' });
        setPhase('entry');
        return;
      }
      try {
        const [ctx, hist] = await Promise.all([
          AssistantApi.getContext(userId),
          AssistantApi.getChatHistory(userId),
        ]);
        if (cancelled) return;
        setContext(ctx);
        setHistory(hist);
        const msgs = hist.map((h) => [
          { id: `${h.id}-u`, role: 'user' as const, content: h.message },
          { id: h.id, role: 'assistant' as const, content: h.reply },
        ]).flat();
        setMessages(msgs);
        setPhase('entry');
      } catch {
        if (cancelled) return;
        setContext({ displayName: 'there', streak: 0, riskLevel: 'calm', greetingHint: 'default' });
        setPhase('entry');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (phase !== 'entry') return;
    overlayOpacity.value = withTiming(1, { duration: 280 });
    avatarTranslateY.value = withSpring(0, {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    });
    avatarScale.value = withSpring(1, { damping: 16, stiffness: 100 });
    avatarRotate.value = withTiming(2, { duration: 600, easing: Easing.out(Easing.ease) });
    avatarOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    const t = setTimeout(() => setPhase('presence'), 600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'presence') return;
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    particleY1.value = withRepeat(withTiming(-15, { duration: 4000 }), -1, true);
    particleY2.value = withRepeat(withTiming(-12, { duration: 3500 }), -1, true);
    particleY3.value = withRepeat(withTiming(-18, { duration: 4500 }), -1, true);
    const t = setTimeout(() => setPhase('greeting'), 500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'greeting') return;
    bubbleOpacity.value = withTiming(1, { duration: 400 });
  }, [phase]);

  useEffect(() => {
    if (phase !== 'greeting' || !greetingText.length) return;
    const total = greetingText.length;
    const step = 1;
    const interval = 52;
    let n = 0;
    const id = setInterval(() => {
      n += step;
      setGreetingVisibleLength((prev) => Math.min(prev + step, total));
      if (n >= total) clearInterval(id);
    }, interval);
    return () => clearInterval(id);
  }, [phase, greetingText]);

  useEffect(() => {
    if (phase !== 'greeting' || greetingVisibleLength < greetingText.length) return;
    const t = setTimeout(() => {
      setPhase('chat');
      chatHeight.value = withSpring(1, { damping: 20, stiffness: 90 });
    }, 800);
    return () => clearTimeout(t);
  }, [phase, greetingVisibleLength, greetingText.length]);

  const handleClose = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('exit');
    chatHeight.value = withTiming(0, { duration: 400 });
    exitAvatarY.value = withDelay(1400, withTiming(150, { duration: 500 }));
    exitOverlayOpacity.value = withDelay(1600, withTiming(0, { duration: 400 }));
    setTimeout(() => navigation.goBack(), 2200);
  }, [navigation]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending || !context) return;
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) return;
      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [...prev, { id: tempId, role: 'user', content: trimmed }]);
      setInputText('');
      setSending(true);
      try {
        const result = await AssistantApi.sendMessage(userId, trimmed);
        setMessages((prev) => [...prev, { id: result.id, role: 'assistant', content: result.reply }]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setSending(false);
      }
    },
    [sending, context]
  );

  const moodGradient = context ? MOOD_GRADIENTS[context.riskLevel] : MOOD_GRADIENTS.calm;

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value * exitOverlayOpacity.value,
  }));

  const avatarContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: phase === 'exit' ? exitAvatarY.value : avatarTranslateY.value },
      { scale: avatarScale.value },
      { rotate: `${avatarRotate.value}deg` },
    ],
  }));

  const avatarImageStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
  }));

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: phase === 'exit' ? 0 : bubbleOpacity.value,
  }));

  const chatPanelStyle = useAnimatedStyle(() => ({
    flex: chatHeight.value,
    opacity: chatHeight.value,
  }));

  const p1Style = useAnimatedStyle(() => ({ transform: [{ translateY: particleY1.value }] }));
  const p2Style = useAnimatedStyle(() => ({ transform: [{ translateY: particleY2.value }] }));
  const p3Style = useAnimatedStyle(() => ({ transform: [{ translateY: particleY3.value }] }));

  if (phase === 'loading') {
    return (
      <View style={styles.loadingRoot}>
        <LinearGradient
          colors={[colors.background, colors.backgroundSecondary]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingLabel}>Preparing your space...</Text>
      </View>
    );
  }

  const exitMessage = "I'll be here whenever you need me.";

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={[...moodGradient]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.overlay, overlayStyle]} />
      <View style={styles.particles}>
        <Animated.View style={[styles.particle, styles.p1, p1Style]} />
        <Animated.View style={[styles.particle, styles.p2, p2Style]} />
        <Animated.View style={[styles.particle, styles.p3, p3Style]} />
      </View>

      <Pressable style={[styles.closeButton, { top: insets.top + 12, right: spacing.md + insets.right }]} onPress={handleClose}>
        <MaterialCommunityIcons name="close" size={28} color={colors.textPrimary} />
      </Pressable>

      <View style={[styles.avatarRow, { paddingLeft: spacing.lg + insets.left, paddingRight: spacing.lg + insets.right }]}>
        <Animated.View style={[styles.avatarWrap, avatarContainerStyle]}>
          <Animated.View style={[styles.avatarOuter, breathingStyle, { width: AVATAR_SIZE, height: AVATAR_SIZE }]}>
            <Animated.Image
              source={BOT_IMAGE}
              style={[styles.avatarImage, avatarImageStyle, { width: AVATAR_SIZE, height: AVATAR_SIZE }]}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        {(phase === 'greeting' || phase === 'chat' || phase === 'exit') && (
          <Animated.View style={[styles.bubbleWrap, bubbleStyle]}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                {phase === 'exit' ? exitMessage : greetingText.slice(0, greetingVisibleLength)}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      <Animated.View
        style={[
          styles.chatSection,
          chatPanelStyle,
          {
            paddingLeft: spacing.md + insets.left,
          paddingRight: spacing.md + insets.right,
            paddingBottom: spacing.lg + insets.bottom,
          },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top + 44}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.messageScroll}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((m) => (
              <View
                key={m.id}
                style={[styles.messageRow, m.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant]}
              >
                <View
                  style={[
                    styles.bubbleMessage,
                    m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}
                >
                  <Text style={styles.messageText}>{m.content}</Text>
                </View>
              </View>
            ))}
            {sending && (
              <View style={[styles.messageRow, styles.messageRowAssistant]}>
                <View style={[styles.bubbleMessage, styles.bubbleAssistant]}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.quickChipsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickChips}>
              {QUICK_CHIPS.map((label) => (
                <Pressable
                  key={label}
                  style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                  onPress={() => sendMessage(label)}
                  disabled={sending}
                >
                  <Text style={styles.chipText}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Share what's on your mind..."
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!sending}
              />
            </View>
            <Pressable
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
              onPress={() => sendMessage(inputText)}
              disabled={sending}
            >
              <MaterialCommunityIcons name="send" size={22} color={colors.textOnAccent} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  loadingLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentSoft,
  },
  p1: { left: '18%', top: '22%' },
  p2: { left: '72%', top: '35%' },
  p3: { left: '45%', top: '18%' },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: spacing.md,
    zIndex: 20,
    padding: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    gap: spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {},
  bubbleWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  bubble: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  chatSection: {
    minHeight: 0,
  },
  keyboardView: {
    flex: 1,
    minHeight: 0,
  },
  messageScroll: {
    flex: 1,
    minHeight: 120,
  },
  messageContent: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubbleMessage: {
    maxWidth: '82%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: colors.accentLight,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  bubbleAssistant: {
    backgroundColor: colors.backgroundCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  quickChipsWrap: {
    marginVertical: spacing.sm,
  },
  quickChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  chipPressed: {
    opacity: 0.85,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    minWidth: 0,
  },
  inputWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
