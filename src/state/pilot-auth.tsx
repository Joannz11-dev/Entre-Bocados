import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';

/**
 * Auth del piloto de planes compartidos (equipo): usa services/supabase y
 * devuelve errores como texto. Vive aparte de la autenticación principal de
 * la app (state/auth) para que ambos flujos convivan sin mezclarse.
 */

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        setReady(true);
      }
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (mounted) {
        setSession(error ? null : data.session);
        setReady(true);
      }
    }).catch(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Falta configurar la conexión con Supabase en .env.local.';
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return null;
    const { error } = await supabase.auth.signOut();
    return error?.message ?? null;
  }, []);

  const value = useMemo(() => ({ ready, session, signIn, signOut }), [ready, session, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider no encontrado');
  return context;
}
