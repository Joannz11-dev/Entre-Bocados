import React, { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Screen, styles } from '../components/demo-ui';
import { SwipeCard, type SwipeAction } from '../components/swipe-card';
import { useDemo } from '../state/demo';

export default function Explore() {
  const { data, update, restaurants, loading, error, reload } = useDemo();
  const [feedback, setFeedback] = useState('');
  const visible = restaurants.filter(p => p.zone === data.zone && !data.dismissed.includes(p.id) &&
    (data.cuisine === 'Todas' || p.cuisine === data.cuisine) &&
    (!data.budget || (p.price_min != null && p.price_min <= Number(data.budget))));
  const current = visible[0];
  const swipe = (action: SwipeAction) => {
    if (!current) return;
    const patch: Parameters<typeof update>[0] = { dismissed: [...data.dismissed, current.id] };
    if (action === 'favorite') patch.favorites = [...new Set([...data.favorites, current.id])];
    if (action === 'like') patch.liked = [...new Set([...data.liked, current.id])];
    update(patch);
    setFeedback(action === 'favorite' ? `${current.name} se guardó en favoritos` : action === 'like' ? `Te interesa ${current.name}` : `Pasaste ${current.name}`);
  };
  return <Screen>
    <Text style={styles.brand}>BOGOTÁ · {data.zone.toUpperCase()}</Text>
    <Text style={styles.title}>Descubre tu próximo lugar.</Text>
    <Text style={styles.body}>Un lugar a la vez. Desliza para decidir.</Text>
    <Button title="Cambiar localidad y filtros" secondary onPress={() => router.push('/preferences')} />
    {loading ? <Text style={styles.body}>Cargando restaurantes...</Text> : error ?
      <View style={styles.box}><Text style={styles.body}>{error}</Text><Button title="Reintentar" onPress={() => void reload()} /></View> :
      current ? <>
        <SwipeCard key={current.id} place={current} onSwipe={swipe} onOpen={() => router.push({ pathname: '/restaurant/[id]', params: { id: current.id } })} />
        <View style={styles.box}><Text style={styles.body}>← Pasar     ↑ Favorito     Me interesa →</Text><Text style={styles.note}>Toca la tarjeta para ver los detalles. Los gestos también están disponibles como acciones de accesibilidad.</Text></View>
      </> :
      <View style={styles.box}><Text style={styles.subtitle}>No hay más restaurantes</Text><Text style={styles.body}>El catálogo de esta localidad puede estar vacío, o los filtros pueden ocultar resultados. Los precios sin verificar no aparecen con un presupuesto activo.</Text><Button title="Empezar otra ronda" onPress={() => update({ dismissed: [] })} /><Button title="Actualizar catálogo" secondary onPress={() => void reload()} /></View>}
    {!!feedback && <Text accessibilityLiveRegion="polite" style={styles.note}>{feedback}</Text>}
  </Screen>;
}
