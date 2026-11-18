import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../state/demo';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { botScript, displayName, PERSONAS } from '../data/social';
import { Chip, ChipRow, Input, TextButton, TopInset } from '../components/kit/ui';
import { goBackOrHome } from '../lib/nav';
import { Confetti } from '../components/kit/confetti';
import { haptic } from '../lib/haptics';

export default function Chat() {
  const params = useLocalSearchParams<{ thread: string }>();
  const thread = params.thread ?? '';
  const [kind, id] = useMemo(() => (thread.startsWith('duo:') ? (['duo', thread.slice(4)] as const) : thread.startsWith('grupo:') ? (['grupo', thread.slice(6)] as const) : (['persona', thread.slice(8)] as const)), [thread]);
  const { data, pushChat, patchChatMsg, nextScriptLine, addPlan } = useDemo();
  const name = displayName(kind, id);
  const script = useMemo(() => botScript(kind, id), [kind, id]);
  const persona = kind === 'persona' ? PERSONAS.find(p => p.id === id) : null;
  const accent = persona?.color ?? (kind === 'grupo' ? Colors.violet : Colors.orange);

  const [draft, setDraft] = useState('');
  const [burst, setBurst] = useState(0);
  const [typing, setTyping] = useState(false);
  const messages = data.chats[thread] ?? [];
  const seq = useRef(0);
  const nextId = () => `m-${thread}-${++seq.current}`;
  const scrollRef = useRef<import('react-native').ScrollView>(null);
  const botTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = botTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // saludo inicial del bot si la conversación está vacía
    if (messages.length === 0 && script.length > 0) {
      botTimers.current.push(setTimeout(() => {
        setTyping(true);
        botTimers.current.push(
          setTimeout(() => {
            setTyping(false);
            pushChat(thread, { id: nextId(), from: 'them', text: script[0] });
            nextScriptLine(thread);
          }, 1100),
        );
      }, 350));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, typing]);

  const userCount = messages.filter(m => m.from === 'me').length;
  const planMsg = messages.find(m => m.plan != null);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    haptic.light();
    setDraft('');
    pushChat(thread, { id: nextId(), from: 'me', text: clean });

    // propuesta de plan: en el segundo mensaje del usuario, si la persona la trae
    if (kind === 'persona' && persona?.planProposal && userCount === 1 && !planMsg) {
      botTimers.current.push(
        setTimeout(() => {
          pushChat(thread, { id: nextId(), from: 'them', text: '¿Este plan?', plan: persona.planProposal });
        }, 1400),
      );
      return;
    }
    botTimers.current.push(
      setTimeout(() => {
        setTyping(true);
        botTimers.current.push(
          setTimeout(() => {
            setTyping(false);
            const idx = nextScriptLine(thread);
            const line = script.length ? script[Math.min(idx, script.length - 1) % script.length] : 'De acuerdo.';
            pushChat(thread, { id: nextId(), from: 'them', text: line });
          }, 1000),
        );
      }, 500),
    );
  };

  const confirmPlan = () => {
    if (!planMsg?.plan) return;
    haptic.success();
    setBurst(b => b + 1);
    patchChatMsg(thread, planMsg.id, { planConfirmed: true });
    pushChat(thread, { id: nextId(), from: 'me', text: `¡Confirmado: ${planMsg.plan.title}, ${planMsg.plan.when}!` });
    addPlan({
      title: planMsg.plan.title,
      when: planMsg.plan.when,
      status: 'pendiente',
      source: kind === 'grupo' ? 'grupo' : 'duo',
      withWhom: name,
      note: 'Plan del chat · lugar por confirmar',
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={[styles.inner, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <TopInset />
        {/* encabezado */}
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => goBackOrHome('/explore')} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.ink} />
          </Pressable>
          <View style={styles.avatarWrap}>
            {kind === 'duo' ? (
              <View style={styles.duoAvatar}>
                <View style={[styles.avatarDot, { backgroundColor: Colors.violet }]} />
                <View style={[styles.avatarDot, { backgroundColor: Colors.pink, marginLeft: -8 }]} />
              </View>
            ) : (
              <View style={[styles.singleAvatar, { backgroundColor: accent }]}>
                <Text style={styles.avatarInitial}>{name[0]}</Text>
              </View>
            )}
            <View style={styles.onlineDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.status}>En línea · chat simulado</Text>
          </View>
          <View style={styles.demoChip}>
            <Feather name="info" size={12} color={Colors.violetDeep} />
            <Text style={styles.demoText}>Demo</Text>
          </View>
        </View>

        {/* mensajes */}
        <View style={styles.messages}>
          <View style={styles.honestBubble}>
            <Text style={Type.note}>
              Chat simulado: {name} {kind === 'persona' ? 'no es una persona real.' : 'no son personas reales.'} Todo se queda en el teléfono.
            </Text>
          </View>
          {messages.map(msg => (
            <Animated.View key={msg.id} entering={FadeInUp.springify().damping(14)} style={[styles.bubbleRow, msg.from === 'me' ? { justifyContent: 'flex-end' } : null]}>
              {msg.plan ? (
                <View style={styles.planBubble}>
                  <View style={styles.planBubbleHead}>
                    <Feather name="calendar" size={14} color={Colors.white} />
                    <Text style={styles.planBubbleTitle}>Plan propuesto</Text>
                  </View>
                  <Text style={styles.planBubbleName}>{msg.plan.title}</Text>
                  <Text style={styles.planBubbleWhen}>{msg.plan.when}</Text>
                  {!msg.planConfirmed ? (
                    <Pressable accessibilityRole="button" onPress={confirmPlan} style={styles.confirmBtn}>
                      <Text style={styles.confirmText}>Confirmar plan</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.confirmedRow}>
                      <Feather name="check-circle" size={14} color={Colors.greenDeep} />
                      <Text style={styles.confirmedText}>Plan confirmado y guardado</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.bubble, msg.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, { color: msg.from === 'me' ? Colors.white : Colors.ink }]}>{msg.text}</Text>
                </View>
              )}
            </Animated.View>
          ))}
          {typing && (
            <View style={[styles.bubble, styles.bubbleThem, styles.typing]}>
              <TypingDots />
            </View>
          )}
        </View>

        {/* respuestas rápidas + input */}
        <View style={styles.inputZone}>
          {persona && userCount < 3 && (
            <ChipRow>
              {persona.quickReplies.map(q => (
                <Chip key={q} label={q} tone="pink" onPress={() => send(q)} />
              ))}
            </ChipRow>
          )}
          <View style={styles.inputRow}>
            <Input
              accessibilityLabel="Escribe un mensaje"
              placeholder="Escribe un mensaje…"
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => send(draft)}
              returnKeyType="send"
              style={{ flex: 1 }}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Enviar" onPress={() => send(draft)} style={styles.sendBtn}>
              <Feather name="send" size={19} color={Colors.white} />
            </Pressable>
          </View>
          <TextButton title="Ver planes guardados" color={Colors.inkSoft} onPress={() => router.push('/plans')} />
        </View>
      </View>
      <Confetti burst={burst} count={22} />
    </KeyboardAvoidingView>
  );
}

function TypingDots() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 260);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 4, paddingVertical: 4 }}>
      {[0, 1, 2].map(i => (
        <View key={i} style={[styles.dot, { opacity: 0.25 + ((tick + i) % 3) * 0.35 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  inner: { flex: 1, paddingHorizontal: Spacing.l, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, borderRadius: Radius.card, padding: 12, ...Shadow.card },
  backBtn: { width: 42, height: 42, borderRadius: 999, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { width: 46, height: 46, justifyContent: 'center' },
  duoAvatar: { flexDirection: 'row' },
  avatarDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: Colors.white },
  singleAvatar: { width: 46, height: 46, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: FontNames.displayHeavy, fontSize: 20, color: Colors.white },
  onlineDot: { position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.green, borderWidth: 2, borderColor: Colors.white },
  name: { fontFamily: FontNames.label, fontSize: 15, color: Colors.ink },
  status: { ...Type.note, fontSize: 11.5 },
  demoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.violetSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  demoText: { fontFamily: FontNames.label, fontSize: 10.5, color: Colors.violetDeep },
  messages: { flex: 1, gap: 8, paddingVertical: Spacing.m, justifyContent: 'flex-end' },
  honestBubble: { alignSelf: 'center', backgroundColor: Colors.creamDeep, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, maxWidth: '92%' },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '82%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: Colors.violet, borderBottomRightRadius: 6 },
  bubbleThem: { backgroundColor: Colors.white, borderBottomLeftRadius: 6, ...Shadow.card },
  bubbleText: { fontFamily: FontNames.body, fontSize: 14.5, lineHeight: 21 },
  typing: { alignSelf: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.inkSoft },
  planBubble: { backgroundColor: Colors.violet, borderRadius: 20, borderBottomRightRadius: 6, padding: 14, gap: 4, maxWidth: '82%' },
  planBubbleHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planBubbleTitle: { fontFamily: FontNames.label, fontSize: 11, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 1 },
  planBubbleName: { fontFamily: FontNames.display, fontSize: 18, color: Colors.white },
  planBubbleWhen: { fontFamily: FontNames.label, fontSize: 12.5, color: 'rgba(255,255,255,0.9)' },
  confirmBtn: { backgroundColor: Colors.pinkFill, borderRadius: 999, paddingHorizontal: 16, minHeight: 40, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  confirmText: { fontFamily: FontNames.label, fontSize: 13, color: Colors.white },
  confirmedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.greenSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, marginTop: 6, alignSelf: 'flex-start' },
  confirmedText: { fontFamily: FontNames.label, fontSize: 12, color: Colors.greenDeep },
  inputZone: { gap: 8, paddingBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sendBtn: { width: 50, height: 50, borderRadius: 999, backgroundColor: Colors.pinkFill, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
});
