import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const getProjectRef = () => {
  try {
    return new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0] || null;
  } catch {
    return null;
  }
};

const AUTH_STORAGE_KEY = (() => {
  const projectRef = getProjectRef();
  return projectRef ? `sb-${projectRef}-auth-token` : null;
})();

const getStoredTokens = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return { accessToken: null, refreshToken: null };
  }

  const sessionLike =
    (value as any)?.currentSession ??
    (Array.isArray(value) ? value[0] : value) ??
    null;

  const accessToken = typeof sessionLike?.access_token === 'string' ? sessionLike.access_token : null;
  const refreshToken = typeof sessionLike?.refresh_token === 'string' ? sessionLike.refresh_token : null;

  return { accessToken, refreshToken };
};

const hasMalformedTokens = (accessToken: string | null, refreshToken: string | null) => {
  return !accessToken || !refreshToken || accessToken.length < 20 || refreshToken.length < 20;
};

const clearMalformedStoredSession = () => {
  if (!AUTH_STORAGE_KEY) return false;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    const { accessToken, refreshToken } = getStoredTokens(parsed);

    if (hasMalformedTokens(accessToken, refreshToken)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return true;
    }

    return false;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return true;
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    const initializeAuth = async () => {
      try {
        const cleared = clearMalformedStoredSession();
        if (cleared) {
          await supabase.auth.signOut({ scope: 'local' });
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          throw error;
        }

        const malformedSession = hasMalformedTokens(
          initialSession?.access_token ?? null,
          initialSession?.refresh_token ?? null,
        );

        if (initialSession && malformedSession) {
          await supabase.auth.signOut({ scope: 'local' });
          setSession(null);
          setUser(null);
          return;
        }

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('Failed to restore auth session, clearing local session.', error);

        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {
          // Ignore local sign-out cleanup failures.
        }

        if (!isMounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}
