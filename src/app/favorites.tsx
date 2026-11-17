import React from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button, PlaceSummary, Screen, styles } from '../components/demo-ui';
import { useDemo } from '../state/demo';

export default function Favorites() {
  const { data, restaurants, loading, error, reload } = useDemo();
  const favorites = restaurants.filter(place => data.favorites.includes(place.id));
  const liked = restaurants.filter(place => data.liked.includes(place.id) && !data.favorites.includes(place.id));
  return <Screen><Text style={styles.title}>Tus favoritos</Text><Text style={styles.note}>Guardados únicamente en este dispositivo.</Text>
    {loading ? <Text style={styles.body}>Cargando...</Text> : error ? <View style={styles.box}><Text style={styles.body}>{error}</Text><Button title="Reintentar" onPress={() => void reload()} /></View> :
      <>{favorites.length ? favorites.map(place => <Pressable accessibilityRole="button" key={place.id} style={styles.box} onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: place.id } })}><PlaceSummary place={place} /><Text style={styles.note}>Ver detalle →</Text></Pressable>) : <Text style={styles.body}>Aún no tienes favoritos disponibles.</Text>}
        <Text style={styles.subtitle}>Te interesan</Text>
        {liked.length ? liked.map(place => <Pressable accessibilityRole="button" key={place.id} style={styles.box} onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: place.id } })}><PlaceSummary place={place} /><Text style={styles.note}>Ver detalle →</Text></Pressable>) : <Text style={styles.body}>Desliza a la derecha los lugares que te interesan.</Text>}
      </>}
  </Screen>;
}
