import { fetchAuthSession } from 'aws-amplify/auth';

import { useEffect, useState } from 'react';
import type { AuthUser } from '../types';


export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const session = await fetchAuthSession();
      const payload = session.tokens?.accessToken.payload;
      if (!payload) { setUser(null); return; }
      setUser({
        sub:    payload.sub as string,
        email:  (payload.email ?? payload.username) as string,
        groups: (payload['cognito:groups'] as string[]) ?? [],
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isAdmin = user?.groups.includes('admins') ?? false;

  return { user, loading, isAdmin, reload: load };
}