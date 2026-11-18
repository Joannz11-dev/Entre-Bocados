import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, Text, View } from 'react-native';
import { Button, Screen, styles } from '../../components/demo-ui';
import type { PlanNotification } from './service';
import { supabase } from '../../services/supabase';
import { usePlansWorkspace } from './workspace';

const messages = {
  new_plan: 'Tienen un nuevo plan compartido',
  date_updated: 'Cambió la fecha de su plan',
  cancelled: 'El plan fue cancelado',
  new_message: 'Tienes un mensaje nuevo',
} as const;

export default function PlanNotifications() {
  const { local: demo, api, userId, brand, actorName, dashboard, detail } = usePlansWorkspace();
  const isLocal = !!demo;
  const [notices, setNotices] = useState<PlanNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setNotices(await api.getPlanNotifications());
      setError('');
    } catch {
      setError(isLocal ? 'No se pudieron leer los avisos guardados.' : 'No se pudieron cargar los avisos. Revisa la conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [api, isLocal]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const db = supabase;
    if (isLocal || !db || !userId) return;
    const channel = db.channel(`pilot-notices-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'plan_notifications', filter: `recipient_id=eq.${userId}` }, () => { void load(); })
      .subscribe(status => { if (status === 'SUBSCRIBED') void load(); });
    const appState = AppState.addEventListener('change', state => { if (state === 'active') void load(); });
    return () => {
      appState.remove();
      void db.removeChannel(channel);
    };
  }, [isLocal, load, userId]);

  const openPlan = async (notice: PlanNotification) => {
    try {
      await api.markPlanNotificationsRead(notice.plan_id);
      setNotices(current => current.map(item => item.plan_id === notice.plan_id ? { ...item, is_read: true } : item));
    } catch {
      setError('No se pudo marcar el aviso como leído; el plan sigue disponible.');
    }
    router.push({ pathname: detail, params: { id: notice.plan_id } });
  };

  const markAllRead = async () => {
    try {
      await api.markPlanNotificationsRead();
      setNotices(current => current.map(item => ({ ...item, is_read: true })));
    } catch {
      setError('No se pudieron marcar los avisos como leídos. Inténtalo de nuevo.');
    }
  };

  return <Screen navigation={false} brand={brand}>
    <Text style={styles.title}>Avisos</Text>
    <Text style={styles.body}>{actorName ? `Avisos de ${actorName} · Solo en este dispositivo.` : 'Novedades de tus planes compartidos.'}</Text>
    <Button secondary disabled={!notices.some(notice => !notice.is_read)} title="Marcar todos como leídos" onPress={() => void markAllRead()} />
    {!!error && <View><Text accessibilityRole="alert" style={styles.body}>{error}</Text><Button secondary title="Reintentar carga" onPress={() => void load()} /></View>}
    {loading ? <View style={local.loading}><ActivityIndicator color="#9A3412" /><Text style={styles.body}>Cargando avisos…</Text></View> : notices.length ? notices.map(notice => <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${messages[notice.kind]} · ${notice.restaurant_name}${notice.is_read ? '' : ' · no leído'}`}
      accessibilityState={{ selected: !notice.is_read }}
      key={notice.id}
      onPress={() => void openPlan(notice)}
      style={({ pressed }) => [styles.box, local.card, !notice.is_read && local.unread, pressed && { opacity: 0.86 }]}
    >
      <Text style={styles.subtitle}>{messages[notice.kind]}</Text>
      <Text style={styles.body}>{notice.restaurant_name}</Text>
      <Text style={styles.note}>{new Date(notice.created_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}{notice.is_read ? ' · Leído' : ' · Nuevo'}</Text>
    </Pressable>) : <View style={styles.box}><Text style={styles.subtitle}>Todo al día</Text><Text style={styles.body}>Cuando haya novedades, aparecerán aquí.</Text></View>}
    <Button secondary title="Volver a mis planes" onPress={() => router.canGoBack() ? router.back() : router.replace(dashboard)} />
  </Screen>;
}

const local = {
  card: { backgroundColor: '#FFFCF8', borderWidth: 1, borderColor: '#E9D9CA' },
  unread: { borderColor: '#9A3412', backgroundColor: '#FFF0E4' },
  loading: { alignItems: 'center' as const, gap: 10, paddingVertical: 24 },
  error: { color: '#8E1B1B', fontSize: 15, lineHeight: 22 },
};
