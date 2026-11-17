import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getRestaurants } from '../services/restaurants';
import type { Restaurant } from '../types/restaurant';

type DemoData = {
  started: boolean;
  alias: string;
  avatar: string;
  description: string;
  zone: string;
  cuisine: string;
  budget: string;
  availability: string;
  social: boolean;
  favorites: string[];
  liked: string[];
  dismissed: string[];
};
const initial: DemoData = { started: false, alias: '', avatar: '🙂', description: '', zone: 'Usaquén', cuisine: 'Todas', budget: '', availability: '', social: false, favorites: [], liked: [], dismissed: [] };
const storageKey = 'entre-bocados-catalog-v2';
type ContextValue = {
  data: DemoData; ready: boolean; restaurants: Restaurant[]; loading: boolean; error: string | null;
  update: (patch: Partial<DemoData>) => void; reload: () => Promise<void>; reset: () => void;
};
const Context = createContext<ContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(initial);
  const [ready, setReady] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(storageKey).then(raw => {
      if (raw) setData({ ...initial, ...JSON.parse(raw) });
    }).catch(() => Alert.alert('No se pudieron cargar los datos locales')).finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(storageKey, JSON.stringify(data)).catch(() => Alert.alert('No se pudieron guardar los datos locales'));
  }, [data, ready]);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setRestaurants(await getRestaurants()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error de conexión'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    getRestaurants().then(result => { if (active) setRestaurants(result); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Error de conexión'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const update = (patch: Partial<DemoData>) => setData(previous => ({ ...previous, ...patch }));
  return <Context.Provider value={{ data, ready, restaurants, loading, error, update, reload, reset: () => setData(initial) }}>{children}</Context.Provider>;
}
export function useDemo() {
  const context = useContext(Context);
  if (!context) throw new Error('DemoProvider no encontrado');
  return context;
}
