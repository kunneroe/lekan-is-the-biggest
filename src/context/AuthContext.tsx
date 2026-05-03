import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const MOCK_AUTH_KEY = '@goshop_mock_signed_in';

type AuthContextValue = {
  isSignedIn: boolean;
  isAuthReady: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(MOCK_AUTH_KEY).then((v) => {
      if (!alive) return;
      setIsSignedIn(v === 'true');
      setIsAuthReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async () => {
    await AsyncStorage.setItem(MOCK_AUTH_KEY, 'true');
    setIsSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(MOCK_AUTH_KEY);
    setIsSignedIn(false);
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      isSignedIn,
      isAuthReady,
      signIn,
      signOut,
    }),
    [isSignedIn, isAuthReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
