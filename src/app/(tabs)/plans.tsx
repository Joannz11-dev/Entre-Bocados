import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDemo, type Plan } from '../../state/demo';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../../constants/theme';
import { CuisineTile } from '../../components/kit/cuisine-tile';
import { EmptyState, FeedbackPill, GhostButton, HonestNote, Input, PrimaryButton, Rise, Segmented, TopInset, VioletButton } from '../../components/kit/ui';
import { haptic } from '../../lib/haptics';

type TabKey = 'pendiente' | 'visitado' | 'favorito';

export default function Plans() {
  const { data, addPlan, patchPlan, restaurants } = useDemo();
  const [tab, setTab] = useState<TabKey>('pendiente');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualWhen, setManualWhen] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (m: string) => {
    if (timer.current) clearTimeout(timer.current);
    setFeedback(m);
    timer.current = setTimeout(() => setFeedback(null), 2400);
  };

  const pending = data.plans.filter(p => p.status === 'pendiente');
  const visited = data.plans.filter(p => p.status === 'visitado');
  const favored = data.plans.filter(p => p.favorite);
  const list = tab === 'pendiente' ? pending : tab === 'visitado' ? visited : favored;

  const addManual = () => {
    const title = manualTitle.trim();
    if (!title) {
      flash('Ponle nombre al plan primero');
      return;
    }
    addPlan({ title, when: manualWhen.trim() || 'Por acordar', status: 'pendiente', source: 'manual' });
    setManualTitle('');
    setManualWhen('');
    setAdding(false);
    haptic.success();
    flash('Plan guardado en pendientes');
    setTab('pendiente');
  };

  const simulateMatch = () => {
    addPlan({ title: 'Casa Tomillo', withWhom: 'Sofía (demo)', when: 'Fecha por acordar', status: 'pendiente', source: 'duo', note: 'Restaurante ficticio del simulacro' });
    haptic.success();
    flash('¡Match simulado con Sofía! Plan guardado');
  };

  const swipes = data.dismissed.filter(d => !d.startsWith('persona:')).length;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        <TopInset />
        <Rise>
          <Text style={Type.display}>Nuestros planes</Text>
          <Text style={Type.body}>Dúo Sabores: lo que acordaste con tu gente, en un solo lugar.</Text>
        </Rise>

        <Rise delay={80}>
          <Segmented
            value={tab}
            onChange={key => {
              haptic.light();
              setTab(key as TabKey);
            }}
            options={[
              { key: 'pendiente', label: `Pendientes${pending.length ? ` ${pending.length}` : ''}` },
              { key: 'visitado', label: 'Visitados' },
              { key: 'favorito', label: 'Favoritos' },
            ]}
          />
        </Rise>

        {list.length ? (
          list.map((plan, i) => (
            <Rise key={plan.id} delay={140 + i * 60}>
              <PlanCard
                plan={plan}
                restaurants={restaurants}
                onToggleFav={() => {
                  haptic.light();
                  patchPlan(plan.id, { favorite: !plan.favorite });
                }}
                onToggleVisited={() => {
                  haptic.medium();
                  patchPlan(plan.id, { status: plan.status === 'visitado' ? 'pendiente' : 'visitado' });
                  flash(plan.status === 'visitado' ? 'De vuelta a pendientes' : '¡Felicidades por el bocado!');
                }}
                onOpen={plan.restaurantId ? () => router.push({ pathname: '/restaurant/[id]', params: { id: plan.restaurantId! } }) : undefined}
              />
            </Rise>
          ))
        ) : (
          <Rise delay={140}>
            <EmptyState
              pose={tab === 'favorito' ? 'heart' : 'wave'}
              title={tab === 'pendiente' ? 'Aún no hay planes' : tab === 'visitado' ? 'Nada visitado todavía' : 'Sin favoritos por ahora'}
              body={
                tab === 'pendiente'
                  ? 'Consigue un dúo en Conectar, gira la ruleta en Rutas o añade un plan manualmente.'
                  : tab === 'visitado'
                    ? 'Cuando cumplan un plan, márcalo con “¡Ya fuimos!” y aparecerá aquí como trofeo.'
                    : 'Toca el corazón de un plan para guardarlo aquí.'
              }
              action={
                tab === 'pendiente' ? (
                  <View style={{ gap: 10, alignSelf: 'stretch' }}>
                    <VioletButton title="Buscar dúo en Conectar" icon="users" onPress={() => router.push('/connect')} />
                    <GhostButton title="Girar la ruleta de rutas" icon="disc" onPress={() => router.push('/ruta')} />
                    <PrimaryButton title="Simular match con Sofía" icon="heart" onPress={simulateMatch} />
                  </View>
                ) : undefined
              }
            />
          </Rise>
        )}

        {pending.length > 0 && (
          <Rise delay={200}>
            <Pressable accessibilityRole="button" onPress={() => setAdding(a => !a)} style={styles.addRow}>
              <View style={styles.addCircle}>
                <Feather name={adding ? 'x' : 'plus'} size={17} color={Colors.violetDeep} />
              </View>
              <Text style={styles.addText}>{adding ? 'Cancelar' : 'Añadir plan manualmente'}</Text>
            </Pressable>
            {adding && (
              <View style={styles.addCard}>
                <Input placeholder="¿A dónde van? Ej. Ramen House" value={manualTitle} onChangeText={setManualTitle} />
                <Input placeholder="¿Cuándo? Ej. Sáb. 7pm" value={manualWhen} onChangeText={setManualWhen} />
                <PrimaryButton small title="Guardar plan" icon="calendar" onPress={addManual} />
              </View>
            )}
          </Rise>
        )}

        <Rise delay={260}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Feather name="trending-up" size={20} color={Colors.pinkDeep} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={Type.bodyStrong}>Tu mes en bocados</Text>
              <Text style={Type.note}>
                Deslizaste {swipes} {swipes === 1 ? 'lugar' : 'lugares'} y guardaste {data.favorites.length} en favoritos. {data.availability ? `Tus ratos: ${data.availability}.` : 'Define tu disponibilidad para mejores planes.'}
              </Text>
            </View>
          </View>
        </Rise>

        <Rise delay={320}>
          <HonestNote>
            Los planes con personas son simulados (nada se reserva ni publica). Los planes “legado” vienen de la demo anterior y sus restaurantes son ficticios.
          </HonestNote>
        </Rise>
      </ScrollView>
      <FeedbackPill message={feedback} />
    </View>
  );
}

const SOURCE_META: Record<Plan['source'], { label: string; bg: string; fg: string }> = {
  duo: { label: 'Dúo Match', bg: Colors.pinkSoft, fg: Colors.pinkDeep },
  grupo: { label: 'Grupo', bg: Colors.violetSoft, fg: Colors.violetDeep },
  manual: { label: 'Manual', bg: Colors.amberSoft, fg: Colors.amberDeep },
  legado: { label: 'Demo anterior', bg: Colors.creamDeep, fg: Colors.inkSoft },
};

function PlanCard({ plan, restaurants, onToggleFav, onToggleVisited, onOpen }: { plan: Plan; restaurants: { id: string; cuisine: string }[]; onToggleFav: () => void; onToggleVisited: () => void; onOpen?: () => void }) {
  const restaurant = restaurants.find(r => r.id === plan.restaurantId);
  const cuisine = restaurant?.cuisine ?? CUISINE_KEY(plan.title);
  const meta = SOURCE_META[plan.source];
  const pressable = onOpen != null;
  const Content = (
    <>
      <View style={styles.planThumb}>
        <CuisineTile cuisine={cuisine} width={64} height={64} radius={18} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
          <View style={[styles.sourceChip, { backgroundColor: meta.bg }]}>
            <Text style={[styles.sourceText, { color: meta.fg }]}>{meta.label}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Feather name="clock" size={11} color={Colors.inkSoft} />
          <Text style={Type.note}>{plan.when}{plan.withWhom ? ` · con ${plan.withWhom}` : ''}</Text>
        </View>
        {plan.note ? <Text style={[Type.note, { fontSize: 11.5, fontStyle: 'italic' }]}>{plan.note}</Text> : null}
      </View>
      <View style={{ gap: 8, alignItems: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={plan.favorite ? 'Quitar de favoritos' : 'Marcar favorito'} onPress={onToggleFav} hitSlop={8}>
          <Feather name="heart" size={20} color={plan.favorite ? Colors.pink : Colors.inkSoft} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={plan.status === 'visitado' ? 'Marcar pendiente' : 'Marcar como visitado'} onPress={onToggleVisited} hitSlop={8}>
          <View style={[styles.visitedChip, plan.status === 'visitado' && { backgroundColor: Colors.greenSoft }]}>
            <Feather name="check" size={12} color={plan.status === 'visitado' ? Colors.greenDeep : Colors.inkSoft} />
          </View>
        </Pressable>
      </View>
    </>
  );
  if (pressable) {
    return (
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.planCard}>
        {Content}
      </Pressable>
    );
  }
  return <View style={styles.planCard}>{Content}</View>;
}

function CUISINE_KEY(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('ramen') || t.includes('nori')) return 'Asiática';
  if (t.includes('pizza') || t.includes('pasta') || t.includes('italia')) return 'Italiana';
  if (t.includes('brunch') || t.includes('ajiaco') || t.includes('casa')) return 'Colombiana';
  if (t.includes('costilla') || t.includes('brasa')) return 'Carnes';
  if (t.includes('postre') || t.includes('dulce')) return 'Postres';
  return 'Café';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  content: { gap: Spacing.m, paddingHorizontal: Spacing.l, paddingTop: 18, paddingBottom: 118 },
  planCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.card, padding: 14, ...Shadow.card },
  planThumb: { ...Shadow.card, borderRadius: 18 },
  planTitle: { fontFamily: FontNames.display, fontSize: 17, color: Colors.ink, flexShrink: 1 },
  sourceChip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  sourceText: { fontFamily: FontNames.label, fontSize: 10.5 },
  visitedChip: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center', minHeight: 44, paddingHorizontal: 12 },
  addCircle: { width: 34, height: 34, borderRadius: 999, backgroundColor: Colors.violetSoft, alignItems: 'center', justifyContent: 'center' },
  addText: { fontFamily: FontNames.label, fontSize: 13.5, color: Colors.violetDeep },
  addCard: { backgroundColor: Colors.white, borderRadius: Radius.card, padding: Spacing.m, gap: 10, ...Shadow.card },
  statCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.pinkSoft, borderRadius: Radius.card, padding: Spacing.m },
  statIcon: { width: 44, height: 44, borderRadius: 999, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
});
