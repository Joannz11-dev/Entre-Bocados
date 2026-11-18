import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import * as Crypto from 'expo-crypto';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Platform, Text, TextInput, View } from 'react-native';
import { Button, PlaceImage, PlaceSummary, Screen, styles } from '../../components/demo-ui';
import { canTransition, isFutureDate, validateMessage } from './rules';
import type { PlanMessage, PlanStatus, SharedPlan } from './service';
import { supabase } from '../../services/supabase';
import { usePlansWorkspace } from './workspace';

const statusLabels: Record<PlanStatus, string> = { pending: 'Por acordar', visited: 'Visitado', cancelled: 'Cancelado' };
const pageSize = 50;

function newDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(19, 0, 0, 0);
  return date;
}

export default function SharedPlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = Array.isArray(id) ? id[0] : id;
  return <PlanDetail key={planId} planId={planId} />;
}

function PlanDetail({ planId }: { planId?: string }) {
  const { local: demo, api, userId, brand, actorName, companion, dashboard } = usePlansWorkspace();
  const isLocal = !!demo;
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(planId ?? '');
  const back = () => router.canGoBack() ? router.back() : router.replace(dashboard);
  const [plan, setPlan] = useState<SharedPlan | null>(null);
  const [messages, setMessages] = useState<PlanMessage[]>([]);
  const [dateDraft, setDateDraft] = useState<Date | null>(null);
  const [defaultDate] = useState(newDefaultDate);
  const selectedDate = dateDraft ?? (plan?.planned_for ? new Date(plan.planned_for) : defaultDate);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<{ body: string; nonce: string } | null>(null);
  const [hasEarlier, setHasEarlier] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [messageError, setMessageError] = useState('');

  const load = useCallback(async () => {
    if (!planId || !validId) return;
    try {
      const [nextPlan, nextMessages] = await Promise.all([api.getPlan(planId), api.getPlanMessages(planId)]);
      setPlan(nextPlan);
      setMessages(current => {
        const combined = new Map([...current, ...nextMessages].map(message => [message.id, message]));
        return [...combined.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
      setHasEarlier(nextMessages.length === pageSize);
      setError(nextPlan ? '' : 'No se encontró este plan o no tienes acceso.');
      if (nextPlan) void api.markPlanNotificationsRead(planId).catch(() => {});
    } catch {
      setError(isLocal ? 'No se pudo leer el plan guardado. Inténtalo de nuevo.' : 'No se pudo cargar el plan. Revisa la conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [api, isLocal, planId, validId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const db = supabase;
    if (isLocal || !db || !planId || !validId) return;
    const channel = db.channel(`pilot-plan-${planId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'plan_messages', filter: `plan_id=eq.${planId}` }, () => { void load(); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'plans', filter: `id=eq.${planId}` }, () => { void load(); })
      .subscribe(status => { if (status === 'SUBSCRIBED') void load(); });
    const appState = AppState.addEventListener('change', state => { if (state === 'active') void load(); });
    return () => {
      appState.remove();
      void db.removeChannel(channel);
    };
  }, [isLocal, load, planId, validId]);

  const schedule = async () => {
    if (!plan || !isFutureDate(selectedDate)) {
      setDateError('Elige una fecha y hora futuras.');
      return;
    }
    setBusy(true);
    setDateError('');
    try {
      await api.schedulePlan(plan.id, selectedDate.toISOString());
      setDateDraft(null);
      await load();
    } catch {
      setDateError('No se pudo guardar la fecha. Comprueba que siga siendo futura e inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status: Exclude<PlanStatus, 'pending'>) => {
    if (!plan) return;
    setBusy(true);
    setError('');
    try {
      await api.transitionPlan(plan.id, status);
      await load();
    } catch {
      setError('No se pudo actualizar el plan. Puede que ya esté cerrado; actualiza e inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const cancelPlan = () => Alert.alert(
    '¿Cancelar este plan?',
    'Tu acompañante recibirá un aviso. Esta acción no se puede deshacer.',
    [
      { text: 'Seguir con el plan', style: 'cancel' },
      { text: 'Cancelar plan', style: 'destructive', onPress: () => { void changeStatus('cancelled'); } },
    ],
  );

  const submitMessage = async (request?: { body: string; nonce: string } | null) => {
    if (!plan) return;
    let outgoing = request ?? pending;
    if (!outgoing) {
      const body = validateMessage(draft);
      if (!body) {
        setMessageError('Escribe un mensaje de 1 a 500 caracteres.');
        return;
      }
      outgoing = { body, nonce: Crypto.randomUUID() };
    }
    setPending(outgoing);
    setBusy(true);
    setMessageError('');
    try {
      await api.sendPlanMessage(plan.id, outgoing.body, outgoing.nonce);
      setDraft('');
      setPending(null);
      await load();
    } catch {
      setMessageError('No se pudo confirmar el envío. Reintenta para enviar el mismo mensaje sin duplicarlo.');
    } finally {
      setBusy(false);
    }
  };

  const loadEarlier = async () => {
    if (!planId || !messages.length) return;
    setBusy(true);
    setError('');
    try {
      const older = await api.getPlanMessages(planId, messages[0]);
      setMessages(current => {
        const combined = new Map([...older, ...current].map(message => [message.id, message]));
        return [...combined.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
      setHasEarlier(older.length === pageSize);
    } catch {
      setError('No se pudieron cargar los mensajes anteriores. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  if (!validId) {
    return <Screen navigation={false} brand={brand}><Text style={styles.title}>Plan no disponible</Text><Text style={styles.body}>El identificador del plan no es válido.</Text><Button secondary title="Volver" onPress={back} /></Screen>;
  }

  return <Screen navigation={false} brand={brand} avoidKeyboard>
    <Button secondary title="Volver" onPress={back} />
    {loading && !plan ? <View style={local.loading}><ActivityIndicator color="#9A3412" /><Text style={styles.body}>Cargando plan…</Text></View> : !plan ? <View style={styles.box}><Text accessibilityRole="alert" style={local.error}>{error || 'Este plan ya no está disponible.'}</Text><Button secondary title="Reintentar" onPress={() => void load()} /></View> : <>
      {!demo && plan.restaurant && <PlaceImage place={plan.restaurant} />}
      {plan.restaurant ? <PlaceSummary place={plan.restaurant} /> : <Text style={styles.subtitle}>Restaurante</Text>}
      <View style={local.status}><Text style={local.statusText}>{statusLabels[plan.status]}</Text></View>
      <View style={styles.box}>
        <Text style={styles.subtitle}>La salida</Text>
        <Text style={styles.body}>{plan.planned_for ? new Date(plan.planned_for).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' }) : 'Fecha por acordar'}</Text>
        {plan.status === 'pending' && Platform.OS !== 'web' && <>
          <Text style={styles.note}>Hora de este dispositivo. Ambos participantes pueden cambiarla.</Text>
          <Text style={styles.label}>Por confirmar: {selectedDate.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
          <View style={local.pickerRow}>
            <Button secondary title="Elegir día" onPress={() => setPickerMode('date')} />
            <Button secondary title="Elegir hora" onPress={() => setPickerMode('time')} />
          </View>
          {pickerMode && <View accessibilityLabel={pickerMode === 'date' ? 'Elegir día del plan' : 'Elegir hora del plan'}>
            <DateTimePicker
              accentColor="#9A3412"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              is24Hour
              locale="es_CO"
              minimumDate={pickerMode === 'date' ? new Date() : undefined}
              mode={pickerMode}
              negativeButton={{ label: 'Cancelar' }}
              onDismiss={() => setPickerMode(null)}
              onValueChange={(_event, nextDate) => { setDateDraft(nextDate); setDateError(''); if (Platform.OS === 'android') setPickerMode(null); }}
              positiveButton={{ label: 'Listo' }}
              value={selectedDate}
            />
          </View>}
          {!!dateError && <Text accessibilityRole="alert" style={local.error}>{dateError}</Text>}
          <Button disabled={busy} title={busy ? 'Guardando…' : plan.planned_for ? 'Actualizar fecha' : 'Proponer fecha'} onPress={() => void schedule()} />
        </>}
        {plan.status === 'pending' && Platform.OS === 'web' && <Text style={styles.note}>La programación está disponible en la aplicación móvil.</Text>}
        {canTransition(plan.status, 'visited') && <View style={local.actions}>
          <Button disabled={busy} secondary title="Marcar como visitado" onPress={() => void changeStatus('visited')} />
          <Button disabled={busy} secondary title="Cancelar plan" onPress={cancelPlan} />
        </View>}
        {plan.status !== 'pending' && <Text style={styles.note}>Este plan está cerrado. El historial se conserva en modo lectura.</Text>}
      </View>
      <View style={styles.box}>
        <Text style={styles.subtitle}>Conversación</Text>
        <Text style={styles.note}>{demo ? `Conversación simulada entre ${actorName} y ${companion}.` : 'Solo tú y tu acompañante pueden verla.'}</Text>
        {hasEarlier && <Button secondary disabled={busy} title={busy ? 'Cargando…' : 'Cargar mensajes anteriores'} onPress={() => void loadEarlier()} />}
        {messages.length ? messages.map(message => {
          const mine = message.sender_id === userId;
          return <View key={message.id} style={[local.bubble, mine ? local.mine : local.theirs]}>
            <Text style={local.sender}>{mine ? (actorName ? `${actorName} (tú)` : 'Tú') : companion}</Text>
            <Text style={local.message}>{message.body}</Text>
            <Text style={local.time}>{new Date(message.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>;
        }) : <Text style={styles.body}>Todavía no hay mensajes. Saluda y empiecen a coordinar.</Text>}
        {plan.status === 'pending' ? <>
          <Text style={styles.label}>Tu mensaje</Text>
          <TextInput
            accessibilityLabel="Escribe un mensaje"
            editable={!busy && !pending}
            maxLength={500}
            multiline
            onChangeText={value => { setDraft(value); setMessageError(''); }}
            placeholder="¿A qué hora nos vemos?"
            style={[styles.input, local.composer]}
            value={pending?.body ?? draft}
          />
          <Text style={styles.note}>{(pending?.body ?? draft).trim().length}/500</Text>
          {!!messageError && <Text accessibilityRole="alert" style={local.error}>{messageError}</Text>}
          {pending ? <Button disabled={busy} title={busy ? 'Reintentando…' : 'Reintentar envío'} onPress={() => void submitMessage(pending)} /> : <Button disabled={busy} title={busy ? 'Enviando…' : 'Enviar mensaje'} onPress={() => void submitMessage(null)} />}
        </> : <Text style={styles.note}>El chat está cerrado porque el plan ya fue finalizado.</Text>}
      </View>
    </>}
    {!!error && !!plan && <Text accessibilityRole="alert" style={local.error}>{error}</Text>}
  </Screen>;
}

const local = {
  status: { alignSelf: 'flex-start' as const, backgroundColor: '#E5F2E8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  statusText: { color: '#2D1B14', fontSize: 13, fontWeight: '700' as const },
  loading: { alignItems: 'center' as const, gap: 10, paddingVertical: 24 },
  error: { color: '#8E1B1B', fontSize: 15, lineHeight: 22 },
  pickerRow: { flexWrap: 'wrap' as const, flexDirection: 'row' as const, gap: 8 },
  actions: { gap: 10, marginTop: 4 },
  bubble: { maxWidth: '88%' as const, borderRadius: 18, padding: 13, gap: 5 },
  mine: { alignSelf: 'flex-end' as const, backgroundColor: '#F3DDCE' },
  theirs: { alignSelf: 'flex-start' as const, backgroundColor: '#F4E8DA' },
  sender: { color: '#6E5042', fontSize: 12, fontWeight: '700' as const },
  message: { color: '#2D1B14', fontSize: 16, lineHeight: 23 },
  time: { color: '#6E5042', fontSize: 12, textAlign: 'right' as const },
  composer: { minHeight: 92, textAlignVertical: 'top' as const },
};
