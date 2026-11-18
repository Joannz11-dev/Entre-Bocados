import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, authRedirectUri } from '../lib/supabase';

type AuthContextValue = {
  /** Restaurando la sesión guardada en el dispositivo. */
  initializing: boolean;
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  sendRecovery: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

/** Traduce los errores de Supabase a mensajes claros en español. */
function friendlyAuthError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('email not confirmed')) return 'Confirma tu cuenta con el enlace que enviamos a tu correo.';
  if (msg.includes('user already registered')) return 'Ya existe una cuenta con este correo. Inicia sesión.';
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (msg.includes('unable to validate email') || msg.includes('invalid email')) return 'El correo no es válido. Revísalo e inténtalo de nuevo.';
  if (msg.includes('password should be at least') || msg.includes('password')) return 'La contraseña debe tener al menos 8 caracteres.';
  if (msg.includes('fetch') || msg.includes('network')) return 'Sin conexión con el servidor. Verifica tu internet e inténtalo de nuevo.';
  return 'No fue posible completar la operación. Inténtalo de nuevo.';
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setInitializing(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initializing,
      user: session?.user ?? null,
      session,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error(friendlyAuthError(error.message));
      },
      async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: authRedirectUri() },
        });
        if (error) throw new Error(friendlyAuthError(error.message));
        return { needsConfirmation: !data.session };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async sendRecovery(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: authRedirectUri(),
        });
        if (error) throw new Error(friendlyAuthError(error.message));
      },
      async resendConfirmation(email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: { emailRedirectTo: authRedirectUri() },
        });
        if (error) throw new Error(friendlyAuthError(error.message));
      },
      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(friendlyAuthError(error.message));
      },
    }),
    [initializing, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

/** Mensaje de error listo para mostrar en pantalla. */
export function authErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'No fue posible completar la operación. Inténtalo de nuevo.';
}

export { AuthProvider };
