import { useMemo, useEffect } from 'react';
import { useSetState } from 'minimal-shared/hooks';

import axios, { endpoints } from 'src/lib/axios';

import { AuthContext } from '../auth-context';

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true }); // loading starts as true

  const checkUserSession = async () => {
    try {
      const response = await axios.get(endpoints.auth.me, {
        withCredentials: true,
      });
      console.log('User session response:', response.data);

      setState({ user: response.data, loading: false });
    } catch (error) {
      setState({ user: null, loading: false });
    }
  };

  // 🧠 Restore session on first load
  useEffect(() => {
    checkUserSession();
  }, []);

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,

      checkUserSession, // expose this
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
