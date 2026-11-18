import type { Restaurant } from '../../types/restaurant';
import { canTransition, isFutureDate, validateMessage } from './rules.js';
import type { PlanMessage, PlanNotification, PlanStatus, SharedPlan } from './service';

export const actors = { alex: 'Alex', sofia: 'Sofía' } as const;
export type Actor = keyof typeof actors;
const matchId = 'casa-tomillo-demo';
const planId = '00000000-0000-4000-8000-000000000005';
const key = 'entre-bocados-local-plans-v1';
const place: Restaurant = {
  id: matchId, name: 'Casa Tomillo', cuisine: 'Cocina de autor', city: 'Bogotá',
  zone: 'Usaquén', description: 'Un restaurante ficticio para practicar cómo organizar una salida.',
  address: '', price_min: null, price_max: null, image_url: null, menu_url: null, maps_url: null,
};

type State = {
  plan: SharedPlan | null;
  messages: PlanMessage[];
  notices: (PlanNotification & { recipient: Actor })[];
};
type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export function createLocalPlans(storage: Storage, now = () => new Date()) {
  let tail: Promise<unknown> = Promise.resolve();
  const read = async (): Promise<State> => {
    const raw = await storage.getItem(key);
    if (!raw) return { plan: null, messages: [], notices: [] };
    const state = JSON.parse(raw) as State;
    if (!Array.isArray(state.messages) || !Array.isArray(state.notices) || (state.plan !== null && state.plan?.id !== planId)) {
      throw new Error('No se pudo leer la demo guardada.');
    }
    return state;
  };
  const enqueue = <T,>(work: () => Promise<T>) => {
    const next = tail.then(work);
    tail = next.catch(() => {});
    return next;
  };
  const write = <T,>(work: (state: State) => T) => enqueue(async () => {
    const state = await read();
    const result = work(state);
    await storage.setItem(key, JSON.stringify(state));
    return result;
  });
  const activePlan = (state: State, id: string) => {
    if (state.plan?.id !== id || state.plan.status !== 'pending') throw new Error('El plan no está disponible para cambios.');
    return state.plan;
  };
  const notify = (state: State, actor: Actor, kind: PlanNotification['kind'], at: string) => {
    state.notices.push({
      id: String(state.notices.length + 1), plan_id: planId, kind, is_read: false,
      created_at: at, restaurant_name: place.name, recipient: actor === 'alex' ? 'sofia' : 'alex',
    });
  };

  return {
    reset: () => enqueue(() => storage.removeItem(key)),
    forActor: (actor: Actor) => ({
      async getPilotData() {
        const state = await read();
        return {
          matches: [{ id: matchId, created_at: '', restaurant: place, hasPlan: !!state.plan }],
          plans: state.plan ? [state.plan] : [],
          unreadCount: state.notices.filter(item => item.recipient === actor && !item.is_read).length,
        };
      },
      async getPlan(id: string) {
        const { plan } = await read();
        return plan?.id === id ? plan : null;
      },
      async getPlanMessages(id: string, before?: PlanMessage) {
        if (id !== planId) return [];
        const { messages } = await read();
        const end = before ? messages.findIndex(item => item.id === before.id) : messages.length;
        return end < 0 ? [] : messages.slice(Math.max(0, end - 50), end);
      },
      async getPlanNotifications() {
        return (await read()).notices.filter(item => item.recipient === actor).reverse();
      },
      createPlan: (id: string) => write(state => {
        if (id !== matchId) throw new Error('Coincidencia no disponible.');
        if (state.plan) return state.plan.id;
        const at = now().toISOString();
        state.plan = { id: planId, match_id: matchId, restaurant_id: place.id, restaurant: place, participant_a: 'alex', participant_b: 'sofia', created_by: actor, status: 'pending', planned_for: null, created_at: at, updated_at: at };
        notify(state, actor, 'new_plan', at);
        return planId;
      }),
      schedulePlan: (id: string, date: string) => write(state => {
        const plan = activePlan(state, id);
        const time = now();
        if (!isFutureDate(date, time.getTime())) throw new Error('Elige una fecha futura.');
        const normalized = new Date(date).toISOString();
        if (plan.planned_for === normalized) return;
        plan.planned_for = normalized;
        plan.updated_at = time.toISOString();
        notify(state, actor, 'date_updated', plan.updated_at);
      }),
      transitionPlan: (id: string, status: Exclude<PlanStatus, 'pending'>) => write(state => {
        const plan = activePlan(state, id);
        if (!canTransition(plan.status, status)) throw new Error('Estado no válido.');
        plan.status = status;
        plan.updated_at = now().toISOString();
        if (status === 'cancelled') notify(state, actor, 'cancelled', plan.updated_at);
      }),
      sendPlanMessage: (id: string, draft: string, nonce: string) => write(state => {
        if (state.messages.some(item => item.plan_id === id && item.sender_id === actor && item.client_nonce === nonce)) return;
        const plan = activePlan(state, id);
        const body = validateMessage(draft);
        if (!body) throw new Error('Mensaje no válido.');
        const at = now().toISOString();
        state.messages.push({ id: String(state.messages.length + 1), plan_id: id, sender_id: actor, client_nonce: nonce, body, created_at: at });
        plan.updated_at = at;
        notify(state, actor, 'new_message', at);
      }),
      markPlanNotificationsRead: (id?: string) => write(state => {
        for (const item of state.notices) {
          if (item.recipient === actor && (!id || item.plan_id === id)) item.is_read = true;
        }
      }),
    }),
  };
}
