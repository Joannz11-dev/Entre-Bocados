import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { getRestaurants, withDistances } from '../services/restaurants';
import { hasGoogleMapsKey, nearbyRestaurants, searchRestaurants } from '../services/places';
import type { Coords, Restaurant } from '../types/restaurant';

export type PlanStatus = 'pendiente' | 'visitado';
export type PlanSource = 'duo' | 'grupo' | 'manual' | 'legado';
export type Plan = {
  id: string;
  title: string;
  restaurantId?: string;
  withWhom?: string;
  when: string;
  status: PlanStatus;
  source: PlanSource;
  favorite?: boolean;
  note?: string;
};
export type ChatMsg = {
  id: string;
  from: 'me' | 'them';
  text: string;
  plan?: { title: string; when: string } | null;
  planConfirmed?: boolean;
};

type DemoData = {
  started: boolean;
  alias: string;
  avatar: string;
  description: string;
  zone: string;
  radiusKm: number;
  cuisine: string;
  budget: string;
  availability: string;
  social: boolean;
  favorites: string[];
  liked: string[];
  dismissed: string[];
  matches: string[];
  plans: Plan[];
  chats: Record<string, ChatMsg[]>;
  scriptIndex: Record<string, number>;
  joinedGroups: string[];
};

const initial: DemoData = {
  started: false,
  alias: '',
  avatar: '',
  description: '',
  zone: 'Usaquén',
  radiusKm: 5,
  cuisine: 'Todas',
  budget: '',
  availability: '',
  social: false,
  favorites: [],
  liked: [],
  dismissed: [],
  matches: [],
  plans: [],
  chats: {},
  scriptIndex: {},
  joinedGroups: [],
};

// Claves de demo: la v3 consolida; las claves previas se leen pero no se borran.
const storageKey = 'entre-bocados-catalog-v3';
const legacyV2 = 'entre-bocados-catalog-v2';
const legacyPlansKey = 'entre-bocados-simulated-plans-v2';
const legacyV1 = 'entre-bocados-demo-v1';
const OLD_PLACES: Record<number, string> = {
  1: 'Casa Tomillo', 2: 'La Mesa Verde', 3: 'Patio Criollo', 4: 'Miga y Sal',
  5: 'Nori', 6: 'La Esquina', 7: 'Oliva', 8: 'Brasa Sur',
};

type ContextValue = {
  data: DemoData;
  ready: boolean;
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  update: (patch: Partial<DemoData>) => void;
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  patchPlan: (id: string, patch: Partial<Plan>) => void;
  pushChat: (thread: string, msg: ChatMsg) => void;
  patchChatMsg: (thread: string, id: string, patch: Partial<ChatMsg>) => void;
  nextScriptLine: (thread: string) => number;
  reload: (center?: Coords, radiusKm?: number) => Promise<void>;
  reset: () => void;
};

const Context = createContext<ContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DemoData>(initial);
  const [ready, setReady] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Lectura fresca del estado para callbacks (evita dependencias cambiantes).
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    (async () => {
      try {
        const merged: DemoData = { ...initial };
        const [rawCurrent, raw, legacyPlansRaw, v1Raw] = await Promise.all([
          AsyncStorage.getItem(storageKey),
          AsyncStorage.getItem(legacyV2),
          AsyncStorage.getItem(legacyPlansKey),
          AsyncStorage.getItem(legacyV1),
        ]);
        if (rawCurrent) {
          // La v3 es la fuente de verdad cuando existe.
          Object.assign(merged, JSON.parse(rawCurrent) as Partial<DemoData>);
        } else if (raw) {
          const old = JSON.parse(raw) as Partial<DemoData>;
          const { chats, plans, matches, scriptIndex, joinedGroups, ...rest } = old;
          Object.assign(merged, rest);
        }
        if (!merged.plans?.length) {
          const legacyPlanNames: string[] = [];
          if (legacyPlansRaw) for (const name of JSON.parse(legacyPlansRaw) as string[]) legacyPlanNames.push(name);
          if (v1Raw) {
            const v1 = JSON.parse(v1Raw) as { plans?: number[] };
            for (const id of v1.plans ?? []) {
              const name = OLD_PLACES[id];
              if (name && !legacyPlanNames.includes(name)) legacyPlanNames.push(name);
            }
          }
          if (legacyPlanNames.length) {
            merged.plans = [
              ...legacyPlanNames.map((name, i) => ({
                id: `legado-${i}`,
                title: name,
                when: 'Fecha por acordar',
                status: 'pendiente' as PlanStatus,
                source: 'legado' as PlanSource,
                note: 'Plan de la demo anterior · restaurante ficticio',
              })),
            ];
          }
        }
        setData(merged);
      } catch {
        Alert.alert('No se pudieron cargar los datos locales');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(storageKey, JSON.stringify(data)).catch(() => Alert.alert('No se pudieron guardar los datos locales'));
  }, [data, ready]);

  const reload = useCallback(async (center?: Coords, radiusKm?: number) => {
    setLoading(true);
    setError(null);
    try {
      if (center && hasGoogleMapsKey()) {
        // Catálogo en vivo: restaurantes reales de Google Maps alrededor del usuario.
        const cuisine = dataRef.current.cuisine;
        const radius = Math.max(((radiusKm ?? dataRef.current.radiusKm) || 5) * 1000, 1000);
        const list =
          cuisine && cuisine !== 'Todas'
            ? await searchRestaurants(cuisine, center, radius)
            : await nearbyRestaurants(center, radius);
        setRestaurants(list);
      } else {
        const rows = await getRestaurants();
        // Catálogo de respaldo con distancias reales desde el GPS si hay centro.
        setRestaurants(center ? withDistances(rows, center) : rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getRestaurants()
      .then(result => {
        if (active) setRestaurants(result);
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err.message : 'Error de conexión');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = (patch: Partial<DemoData>) => setData(previous => ({ ...previous, ...patch }));

  const addPlan = (plan: Omit<Plan, 'id'>) =>
    setData(previous => ({ ...previous, plans: [{ ...plan, id: `plan-${Date.now()}` }, ...previous.plans] }));

  const patchPlan = (id: string, patch: Partial<Plan>) =>
    setData(previous => ({ ...previous, plans: previous.plans.map(p => (p.id === id ? { ...p, ...patch } : p)) }));

  const pushChat = (thread: string, msg: ChatMsg) =>
    setData(previous => ({ ...previous, chats: { ...previous.chats, [thread]: [...(previous.chats[thread] ?? []), msg] } }));

  const patchChatMsg = (thread: string, id: string, patch: Partial<ChatMsg>) =>
    setData(previous => ({
      ...previous,
      chats: { ...previous.chats, [thread]: (previous.chats[thread] ?? []).map(m => (m.id === id ? { ...m, ...patch } : m)) },
    }));

  const nextScriptLine = (thread: string) => {
    const idx = data.scriptIndex[thread] ?? 0;
    setData(previous => ({ ...previous, scriptIndex: { ...previous.scriptIndex, [thread]: (previous.scriptIndex[thread] ?? 0) + 1 } }));
    return idx;
  };

  return (
    <Context.Provider
      value={{
        data,
        ready,
        restaurants,
        loading,
        error,
        update,
        addPlan,
        patchPlan,
        pushChat,
        patchChatMsg,
        nextScriptLine,
        reload,
        reset: () => setData(initial),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useDemo() {
  const context = useContext(Context);
  if (!context) throw new Error('DemoProvider no encontrado');
  return context;
}
