import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../../state/pilot-auth';
import { actors, createLocalPlans, type Actor } from './local';
import * as remote from './service';

const demo = createLocalPlans(AsyncStorage);
const LocalActor = createContext<{ actor: Actor; setActor: (actor: Actor) => void } | null>(null);
export function LocalPlansProvider({ children }: { children: ReactNode }) {
  const [actor, setActor] = useState<Actor>('alex');
  return <LocalActor.Provider value={{ actor, setActor }}>{children}</LocalActor.Provider>;
}

export function usePlansWorkspace() {
  const local = useContext(LocalActor);
  const { session, signOut } = useAuth();
  const actor = local?.actor;
  const userId = actor ?? session?.user.id;
  const api = useMemo(() => actor ? demo.forActor(actor) : {
    ...remote, getPilotData: () => remote.getPilotData(userId!),
  }, [actor, userId]);
  return {
    local, userId, api, signOut, reset: demo.reset,
    brand: local ? 'ENTRE BOCADOS · DEMO LOCAL' : 'ENTRE BOCADOS · PILOTO',
    dashboard: local ? '/local-plans/shared-plans' as const : '/pilot/shared-plans' as const,
    notifications: local ? '/local-plans/notifications' as const : '/pilot/notifications' as const,
    detail: local ? '/local-plans/plan/[id]' as const : '/pilot/plan/[id]' as const,
    actorName: actor ? actors[actor] : null,
    companion: actor ? actors[actor === 'alex' ? 'sofia' : 'alex'] : 'Acompañante',
  };
}
