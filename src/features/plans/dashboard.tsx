import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Pressable, Text, View } from 'react-native';
import { Button, PlaceImage, PlaceSummary, Screen, styles } from '../../components/demo-ui';
import type { MatchOption, SharedPlan } from './service';
import { supabase } from '../../services/supabase';
import { usePlansWorkspace } from './workspace';

const statusLabels = { pending: 'Por acordar', visited: 'Visitado', cancelled: 'Cancelado' } as const;

export default function SharedPlans() {
  const { local: demo, api, userId, signOut, reset, brand, actorName, companion, notifications, detail } = usePlansWorkspace();
  const isLocal = !!demo;
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [plans, setPlans] = useState<SharedPlan[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.getPilotData();
      setMatches(data.matches);
      setPlans(data.plans);
      setUnreadCount(data.unreadCount);
      setError('');
    } catch {
      setMatches([]);
      setPlans([]);
      setUnreadCount(0);
      setError(isLocal ? 'No se pudieron leer los planes guardados.' : 'No se pudieron cargar los planes. Revisa la conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [api, isLocal, userId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const db = supabase;
    if (isLocal || !db || !userId) return;
    const channel = db.channel(`pilot-plans-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => { void load(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'plan_notifications', filter: `recipient_id=eq.${userId}` }, () => { void load(); })
      .subscribe(status => { if (status === 'SUBSCRIBED') void load(); });
    const appState = AppState.addEventListener('change', state => { if (state === 'active') void load(); });
    return () => {
      appState.remove();
      void db.removeChannel(channel);
    };
  }, [isLocal, load, userId]);

  const openPlan = (id: string) => router.push({ pathname: detail, params: { id } });
  const create = async (match: MatchOption) => {
    setCreating(match.id);
    setError('');
    try {
      const id = await api.createPlan(match.id);
      await load();
      openPlan(id);
    } catch {
      setError('No se pudo crear el plan. La coincidencia pudo cambiar; actualiza e inténtalo de nuevo.');
    } finally {
      setCreating('');
    }
  };

  const logout = async () => {
    const message = await signOut();
    if (message) setError('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    else router.replace('/pilot-login');
  };

  const resetDemo = () => Alert.alert('¿Reiniciar esta demo?', 'Se borrarán solo los planes, mensajes y avisos de esta demo local.', [
    { text: 'Conservar demo', style: 'cancel' },
    { text: 'Reiniciar demo', style: 'destructive', onPress: () => void reset().then(load).catch(() => setError('No se pudo reiniciar la demo. Inténtalo de nuevo.')) },
  ]);

  return <Screen navigation={false} brand={brand}>
    <Text style={styles.title}>Planes compartidos</Text>
    {demo ? <View style={local.banner}><Text style={styles.heroEyebrow}>SIMULACIÓN SIN CONEXIÓN</Text><Text style={local.bannerTitle}>Ahora eres {actorName}</Text><Text style={styles.heroBody}>Cambia de participante para probar el otro lado del plan.</Text></View> : <Text style={styles.body}>Coordinen dónde y cuándo encontrarse.</Text>}
    <View style={styles.row}>
      <Button secondary title={`Avisos${unreadCount ? ` · ${unreadCount}` : ''}`} onPress={() => router.push(notifications)} />
      {demo ? <Button secondary disabled={!!creating} title={`Cambiar a ${companion}`} onPress={() => { setLoading(true); setMatches([]); setPlans([]); setUnreadCount(0); setError(''); demo.setActor(demo.actor === 'alex' ? 'sofia' : 'alex'); }} /> : <Button secondary title="Cerrar sesión" onPress={() => void logout()} />}
    </View>
    {!!error && <View style={local.error}><Text accessibilityRole="alert" style={local.errorText}>{error}</Text><Button secondary title="Reintentar" onPress={() => void load()} /></View>}
    {loading ? <View style={local.loading}><ActivityIndicator color="#9A3412" /><Text style={styles.body}>Cargando tus planes…</Text></View> : <>
      <Text style={styles.subtitle}>Tus planes</Text>
      {plans.length ? plans.map(plan => <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir plan para ${plan.restaurant?.name ?? 'restaurante'} · ${statusLabels[plan.status]}`}
        key={plan.id}
        onPress={() => openPlan(plan.id)}
        style={({ pressed }) => [styles.box, local.card, pressed && { opacity: 0.86 }]}
      >
        {!demo && plan.restaurant && <PlaceImage place={plan.restaurant} />}
        {plan.restaurant ? <PlaceSummary place={plan.restaurant} /> : <Text style={styles.subtitle}>Restaurante</Text>}
        <View style={[local.status, plan.status !== 'pending' && local.terminal]}><Text style={local.statusText}>{statusLabels[plan.status]}</Text></View>
        <Text style={styles.note}>{plan.planned_for ? new Date(plan.planned_for).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : 'Fecha por acordar'}</Text>
        <Text style={styles.note}>Toca para ver el plan y conversar.</Text>
      </Pressable>) : <View style={styles.box}><Text style={styles.subtitle}>Aún no hay planes</Text><Text style={styles.body}>Crea un plan desde una coincidencia para verlo aquí.</Text></View>}

      <Text style={styles.subtitle}>Coincidencias disponibles</Text>
      {matches.filter(match => !match.hasPlan).length ? matches.filter(match => !match.hasPlan).map(match => <View key={match.id} style={[styles.box, local.card]}>
        {!demo && match.restaurant && <PlaceImage place={match.restaurant} />}
        {match.restaurant ? <PlaceSummary place={match.restaurant} /> : <Text style={styles.subtitle}>Restaurante</Text>}
        <Text style={styles.note}>{demo ? `Coincidencia ficticia con ${companion}` : 'Coincidencia validada · ambos usuarios pueden crear este plan.'}</Text>
        <Button disabled={creating === match.id} title={creating === match.id ? 'Creando…' : 'Crear plan compartido'} onPress={() => void create(match)} />
      </View>) : <View style={styles.box}><Text style={styles.body}>No hay coincidencias nuevas. Los planes se crean solo a partir de coincidencias validadas.</Text></View>}
    </>}
    {demo ? <Button secondary disabled={!!creating} title="Reiniciar demo local" onPress={resetDemo} /> : <Text style={styles.note}>Acceso privado para cuentas de prueba. Los cambios se sincronizan con el mismo proyecto Supabase.</Text>}
    <Button secondary title="Volver a Planes" onPress={() => router.replace('/plans')} />
  </Screen>;
}

const local = {
  banner: { backgroundColor: '#542F25', borderRadius: 22, padding: 20, gap: 8 },
  bannerTitle: { color: '#FFF9F2', fontSize: 26, fontWeight: '800' as const },
  card: { backgroundColor: '#FFFCF8', borderWidth: 1, borderColor: '#E9D9CA' },
  status: { alignSelf: 'flex-start' as const, backgroundColor: '#E5F2E8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  terminal: { backgroundColor: '#EDE6E0' },
  statusText: { color: '#2D1B14', fontSize: 13, fontWeight: '700' as const },
  loading: { alignItems: 'center' as const, gap: 10, paddingVertical: 24 },
  error: { backgroundColor: '#FDECEC', borderRadius: 14, padding: 14, gap: 8 },
  errorText: { color: '#8E1B1B', fontSize: 15, lineHeight: 22 },
};
