import React from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import type { Restaurant } from '../types/restaurant';
import { formatPrice } from '../types/restaurant';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF8EF' },
  content: { padding: 24, paddingBottom: 40, gap: 14, flexGrow: 1 },
  brand: { color: '#9A3412', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#2D1B14', fontSize: 32, fontWeight: '700' },
  subtitle: { color: '#2D1B14', fontSize: 22, fontWeight: '700' },
  body: { color: '#6E5042', fontSize: 16, lineHeight: 23 },
  label: { color: '#2D1B14', fontWeight: '700', marginTop: 8 },
  note: { color: '#6E5042', fontSize: 13, lineHeight: 20 },
  box: { backgroundColor: '#F4E8DA', borderRadius: 18, padding: 18, gap: 8 },
  input: { borderWidth: 1, borderColor: '#D8BFAF', borderRadius: 12, padding: 14, backgroundColor: '#fff', color: '#2D1B14' },
  button: { minHeight: 48, padding: 12, borderRadius: 14, backgroundColor: '#9A3412', alignItems: 'center', justifyContent: 'center' },
  buttonAlt: { backgroundColor: '#F4E8DA', borderWidth: 1, borderColor: '#D8BFAF' },
  buttonText: { color: 'white', fontWeight: '700', textAlign: 'center' },
  buttonAltText: { color: '#703420' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  image: { width: '100%', height: 230, borderRadius: 16, backgroundColor: '#E9D9CA' },
  nav: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, borderTopWidth: 1, borderColor: '#E9D9CA' },
  hero: { backgroundColor: '#542F25', borderRadius: 28, padding: 28, gap: 16, minHeight: 330, justifyContent: 'flex-end' },
  heroIcon: { color: '#FFC68D', fontSize: 46, fontWeight: '700' },
  heroEyebrow: { color: '#FFC68D', fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  heroTitle: { color: '#FFF9F2', fontSize: 37, lineHeight: 42, fontWeight: '800' },
  heroBody: { color: '#F6DCCB', fontSize: 16, lineHeight: 24 },
  intro: { gap: 8, paddingVertical: 8 },
  profileHero: { backgroundColor: '#542F25', borderRadius: 24, padding: 24, alignItems: 'center', gap: 8 },
  avatar: { fontSize: 48, backgroundColor: '#F8E3D4', width: 88, height: 88, textAlign: 'center', textAlignVertical: 'center', borderRadius: 44, overflow: 'hidden' },
});

export function Screen({ children, navigation = true, brand = 'ENTRE BOCADOS / DEMO', avoidKeyboard = false }: { children: React.ReactNode; navigation?: boolean; brand?: string; avoidKeyboard?: boolean }) {
  const content = <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={styles.brand}>{brand}</Text>{children}</ScrollView>;
  return <SafeAreaView style={styles.screen}>{avoidKeyboard ? <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>{content}</KeyboardAvoidingView> : content}{navigation && <View style={styles.nav}><Link href="/explore">Explorar</Link><Link href="/favoritos">Favoritos</Link><Link href="/plans">Planes</Link><Link href="/profile">Perfil</Link></View>}</SafeAreaView>;
}
export function Button({ title, onPress, secondary = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.buttonAlt, disabled && { opacity: 0.5 }, pressed && !disabled && { opacity: 0.86 }]}><Text style={[styles.buttonText, secondary && styles.buttonAltText]}>{title}</Text></Pressable>;
}
export function Chips({ items, value, onChange }: { items: string[]; value: string; onChange: (value: string) => void }) {
  return <View style={styles.row}>{items.map(item => <Pressable accessibilityRole="button" accessibilityState={{ selected: value === item }} key={item} onPress={() => onChange(item)} style={[styles.button, value !== item && styles.buttonAlt]}><Text style={[styles.buttonText, value !== item && styles.buttonAltText]}>{item}</Text></Pressable>)}</View>;
}
export function PlaceImage({ place }: { place: Restaurant }) {
  return place.image_url ? <Image source={{ uri: place.image_url }} style={styles.image} accessibilityLabel={`Foto de ${place.name}`} /> : <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.body}>Fotografía pendiente de autorización</Text></View>;
}
export function PlaceSummary({ place }: { place: Restaurant }) {
  return <><Text style={styles.note}>{place.cuisine.toUpperCase()} · {place.zone.toUpperCase()}</Text><Text style={styles.subtitle}>{place.name}</Text><Text style={styles.body}>{formatPrice(place)}</Text></>;
}
export async function openExternal(url: string) {
  try { await Linking.openURL(url); } catch { const { Alert } = await import('react-native'); Alert.alert('No se pudo abrir el enlace'); }
}
