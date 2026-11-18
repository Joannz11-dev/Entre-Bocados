import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../../state/demo';
import { authErrorMessage, useAuth } from '../../state/auth';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../../constants/theme';
import { Chip, Field, GhostButton, Input, PrimaryButton, Rise, TextButton, TopInset } from '../../components/kit/ui';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'EB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data, update, reset } = useDemo();
  const money = data.budget ? `$${Number(data.budget).toLocaleString('es-CO')}` : 'Sin límite';
  const verified = Boolean(user?.email_confirmed_at);

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres cerrar tu sesión en este dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut().catch(err => Alert.alert('No fue posible cerrar sesión', authErrorMessage(err))) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TopInset />
        <Rise>
          <View style={styles.hero}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroInitials}>{initialsOf(data.alias || 'Comensal EB')}</Text>
            </View>
            <Text style={styles.heroName}>{data.alias || 'Mi perfil'}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              <View style={styles.heroChip}>
                <Feather name="navigation" size={11} color={Colors.white} />
                <Text style={styles.heroChipText}>Radio {data.radiusKm} km</Text>
              </View>
              {data.availability ? (
                <View style={styles.heroChip}>
                  <Feather name="clock" size={11} color={Colors.white} />
                  <Text style={styles.heroChipText}>{data.availability}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </Rise>

        <Rise delay={80}>
          <View style={styles.card}>
            <Text style={Type.heading}>Cuenta</Text>
            <Text style={Type.note}>Cuenta verificada de Supabase asociada a esta app.</Text>
            <View style={styles.accountRow}>
              <View style={styles.accountIcon}>
                <Feather name="mail" size={15} color={Colors.violetDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={Type.bodyStrong} numberOfLines={1}>{user?.email}</Text>
                <Text style={Type.note}>{verified ? 'Correo confirmado' : 'Confirmación pendiente'}</Text>
              </View>
              <Chip label={verified ? 'Verificada' : 'Pendiente'} tone={verified ? 'green' : 'amber'} />
            </View>
            <View style={styles.accountRow}>
              <View style={styles.accountIcon}>
                <Feather name="shield" size={15} color={Colors.violetDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={Type.bodyStrong}>Rol: Usuario</Text>
                <Text style={Type.note}>Autenticación gestionada por Supabase Auth.</Text>
              </View>
            </View>
            <GhostButton title="Cerrar sesión" icon="log-out" onPress={confirmLogout} />
          </View>
        </Rise>

        <Rise delay={140}>
          <View style={styles.rowCards}>
            <Pressable accessibilityRole="button" onPress={() => router.push('/favoritos')} style={styles.countCard}>
              <View style={[styles.countIcon, { backgroundColor: Colors.pinkSoft }]}>
                <Feather name="heart" size={18} color={Colors.pinkDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={Type.bodyStrong}>Mis guardados</Text>
                <Text style={Type.note}>{data.favorites.length} favoritos · {data.liked.length} intereses</Text>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.inkSoft} />
            </Pressable>
          </View>
        </Rise>

        <Rise delay={200}>
          <View style={styles.card}>
            <Text style={Type.heading}>Un poco de ti</Text>
            <Text style={Type.note}>Se guarda solo en este dispositivo.</Text>
            <Field label="Nombre o alias">
              <Input accessibilityLabel="Alias" value={data.alias} onChangeText={alias => update({ alias })} placeholder="Tu nombre" />
            </Field>
            <Field label="Descripción">
              <Input accessibilityLabel="Descripción" value={data.description} onChangeText={description => update({ description })} placeholder="Cuéntanos un poco de ti" multiline />
            </Field>
          </View>
        </Rise>

        <Rise delay={260}>
          <View style={styles.card}>
            <Text style={Type.heading}>Tus preferencias</Text>
            <PrefRow icon="map-pin" text={`Búsqueda en un radio de ${data.radiusKm} km`} />
            <PrefRow icon="coffee" text={`Cocina: ${data.cuisine}`} />
            <PrefRow icon="dollar-sign" text={`Presupuesto: ${money} por plato`} />
            <PrefRow icon="clock" text={`Disponibilidad: ${data.availability || 'Sin definir'}`} />
            <PrefRow icon="users" text={`Modo social: ${data.social ? 'activo (simulado)' : 'desactivado'}`} />
            <PrimaryButton small title="Editar preferencias" icon="sliders" onPress={() => router.push('/preferences')} />
          </View>
        </Rise>

        <Rise delay={320}>
          <View style={{ gap: 10 }}>
            <GhostButton
              title="Borrar datos guardados en el dispositivo"
              icon="trash-2"
              onPress={() =>
                Alert.alert('Borrar datos locales', 'Se borrarán los datos guardados en este dispositivo: alias, favoritos y planes.', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Borrar', style: 'destructive', onPress: () => { reset(); router.replace('/explore'); } },
                ])
              }
            />
          </View>
          <TextButton title="Entre Bocados · v2" color={Colors.inkSoft} onPress={() => {}} />
        </Rise>
      </ScrollView>
    </View>
  );
}

function PrefRow({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.prefRow}>
      <View style={styles.prefIcon}>
        <Feather name={icon} size={14} color={Colors.violetDeep} />
      </View>
      <Text style={[Type.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  content: { gap: Spacing.m, paddingHorizontal: Spacing.l, paddingTop: 18, paddingBottom: 118 },
  hero: { backgroundColor: Colors.violet, borderRadius: Radius.sheet, padding: Spacing.l, alignItems: 'center', gap: 10, ...Shadow.float },
  heroAvatar: { width: 96, height: 96, borderRadius: 999, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.35)' },
  heroInitials: { fontFamily: FontNames.display, fontSize: 34, color: Colors.violet },
  heroName: { fontFamily: FontNames.display, fontSize: 24, color: Colors.white },
  heroChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(64,31,51,0.30)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  heroChipText: { fontFamily: FontNames.label, fontSize: 11.5, color: Colors.white },
  rowCards: { gap: 10 },
  countCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.card, padding: 14, ...Shadow.card },
  countIcon: { width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.white, borderRadius: Radius.card, padding: Spacing.m, gap: 12, ...Shadow.card },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.cream, borderRadius: Radius.input, padding: 12 },
  accountIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.violetSoft, alignItems: 'center', justifyContent: 'center' },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prefIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: Colors.violetSoft, alignItems: 'center', justifyContent: 'center' },
});
