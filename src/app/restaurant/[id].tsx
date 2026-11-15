import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Button, openExternal, PlaceImage, PlaceSummary, Screen, styles } from '../../components/demo-ui';
import { useDemo } from '../../state/demo';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, update, restaurants, loading, error, reload } = useDemo();
  const place = restaurants.find(item => item.id === id);
  if (!place) return <Screen><Text style={styles.body}>{loading ? 'Cargando...' : error || 'Restaurante no disponible.'}</Text>{error && <Button title="Reintentar" onPress={() => void reload()} />}<Button title="Volver" secondary onPress={() => router.replace('/explore')} /></Screen>;
  const favorite = data.favorites.includes(place.id);
  return <Screen><Button title="← Volver" secondary onPress={() => router.back()} /><PlaceImage place={place} /><PlaceSummary place={place} />
    <Text style={styles.body}>{place.description || 'Descripción no disponible.'}</Text>
    <Text style={styles.label}>Dirección</Text><Text style={styles.body}>{place.address}, {place.zone}, {place.city}</Text>
    <Button title={favorite ? 'Quitar de favoritos' : 'Guardar favorito'} onPress={() => update({ favorites: favorite ? data.favorites.filter(item => item !== place.id) : [...data.favorites, place.id] })} />
    {place.menu_url ? <Button title="Ver menú" secondary onPress={() => void openExternal(place.menu_url!)} /> : <Text style={styles.note}>Menú no disponible por ahora.</Text>}
    {place.maps_url ? <Button title="Abrir ubicación" secondary onPress={() => void openExternal(place.maps_url!)} /> : <Text style={styles.note}>Ubicación en mapas no disponible.</Text>}
  </Screen>;
}
