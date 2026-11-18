import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useDemo } from '../state/demo';
import { Colors, Radius, Shadow, Spacing, Type } from '../constants/theme';

import { Chip, ChipRow, Field, Input, PrimaryButton, Rise, Screen, TextButton } from '../components/kit/ui';
import { goBackOrHome } from '../lib/nav';
import { haptic } from '../lib/haptics';

const RADIOS = [1, 3, 5, 10, 25];

const BUDGETS = [
  { key: '', label: 'Sin límite' },
  { key: '20000', label: 'Hasta $20k' },
  { key: '40000', label: 'Hasta $40k' },
  { key: '70000', label: 'Hasta $70k' },
];

export default function Preferences() {
  const { data, update, restaurants } = useDemo();
  const cuisines = ['Todas', ...Array.from(new Set(restaurants.map(p => p.cuisine))).sort()];
  const money = (v: string) => `$${Number(v).toLocaleString('es-CO')}`;

  return (
    <Screen back scroll>
      <Rise>
        <Text style={[Type.display, { fontSize: 32 }]}>Tus preferencias</Text>
        <Text style={[Type.body, { marginTop: -Spacing.s }]}>Personaliza tu experiencia: todo queda en este dispositivo.</Text>
      </Rise>

      <Rise delay={90}>
        <View style={styles.card}>
          <Field label="Radio de búsqueda" hint="Explorar y la ruleta usan los lugares dentro de este radio desde tu ubicación.">
            <ChipRow>
              {RADIOS.map(km => (
                <Chip
                  key={km}
                  label={`${km} km`}
                  icon="map-pin"
                  tone="green"
                  selected={data.radiusKm === km}
                  onPress={() => {
                    haptic.light();
                    update({ radiusKm: km });
                  }}
                />
              ))}
            </ChipRow>
          </Field>
        </View>
      </Rise>

      <Rise delay={160}>
        <View style={styles.card}>
          <Field label="Presupuesto por plato" hint="Con presupuesto activo se excluyen restaurantes con precio sin confirmar.">
            <ChipRow>
              {BUDGETS.map(b => (
                <Chip
                  key={b.key}
                  label={b.key ? b.label : b.label}
                  icon="dollar-sign"
                  tone="amber"
                  selected={data.budget === b.key}
                  onPress={() => {
                    haptic.light();
                    update({ budget: b.key });
                  }}
                />
              ))}
            </ChipRow>
            {data.budget ? (
              <View style={styles.rangeNote}>
                <Text style={Type.note}>Máximo por plato: {money(data.budget)} COP</Text>
              </View>
            ) : null}
          </Field>
        </View>
      </Rise>

      <Rise delay={230}>
        <View style={styles.card}>
          <Field label="Gastronomía favorita">
            <ChipRow>
              {cuisines.map(c => (
                <Chip
                  key={c}
                  label={c}
                  icon={c === 'Todas' ? 'grid' : undefined}
                  tone="pink"
                  selected={data.cuisine === c}
                  onPress={() => {
                    haptic.light();
                    update({ cuisine: c });
                  }}
                />
              ))}
            </ChipRow>
          </Field>
        </View>
      </Rise>

      <Rise delay={300}>
        <View style={styles.card}>
          <Field label="⏰ Disponibilidad" hint="Ej. Vie. 5pm – 9pm. La usamos para tus planes y la ruleta.">
            <Input
              accessibilityLabel="Disponibilidad"
              placeholder="Ej. viernes después de las 6 p. m."
              value={data.availability}
              onChangeText={availability => update({ availability })}
            />
          </Field>
        </View>
      </Rise>

      <Rise delay={360}>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={Type.label}>Modo social simulado</Text>
              <Text style={Type.note}>No publica tu perfil ni conecta con personas reales.</Text>
            </View>
            <Switch
              accessibilityLabel="Modo social simulado"
              trackColor={{ true: Colors.violet, false: Colors.creamDeep }}
              thumbColor={Colors.white}
              value={data.social}
              onValueChange={social => {
                haptic.light();
                update({ social });
              }}
            />
          </View>
        </View>
      </Rise>

      <Rise delay={420}>
        <PrimaryButton
          title="Guardar preferencias"
          icon="check"
          onPress={() => {
            haptic.medium();
            update({ started: true });
            router.replace('/explore');
          }}
        />
        <TextButton title="Volver" color={Colors.inkSoft} onPress={() => goBackOrHome('/explore')} />
      </Rise>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: Radius.card, padding: Spacing.m, gap: 10, ...Shadow.card },
  rangeNote: { backgroundColor: Colors.amberSoft, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
