import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { setLogoutHandler } from '../services/api';

type User = any; // Can be defined strictly later

type AuthContextValue = {
  isSignedIn: boolean;
  isAuthReady: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  signOut: (showAlert?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const signOut = useCallback(async (showAlert = false) => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setIsSignedIn(false);
    setUser(null);
    if (showAlert === true) {
      Alert.alert('Session Expired', 'Please login again.');
    }
  }, []);

  useEffect(() => {
    setLogoutHandler(() => {
      void signOut(true);
    });

    let alive = true;
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');

        if (token) {
          try {
            // Always validate session and refresh user from backend on boot
            const res = await authService.getProfile();
            const userData = res.user ? res.user : res;
            if (!alive) return;
            setUser(userData);
            setIsSignedIn(true);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          } catch (error: any) {
            console.log('Session validation failed:', error.message);
            if (error.response?.status === 401) {
              await signOut();
            }
            // For other errors (network, 404), keep signed in using cached data
            const userStr = await AsyncStorage.getItem('userData');
            if (userStr) {
              try {
                const parsedUser = JSON.parse(userStr);
                if (alive) {
                  setUser(parsedUser);
                  setIsSignedIn(true);
                }
              } catch (e) {
                console.error('Failed to parse cached user data');
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to check auth state:', error);
      } finally {
        if (alive) setIsAuthReady(true);
      }
    };

    checkAuth();

    return () => {
      alive = false;
    };
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await authService.login({ identifier: email, password });
    const { user, accessToken } = data;

    if (accessToken) await AsyncStorage.setItem('userToken', accessToken);
    if (user) await AsyncStorage.setItem('userData', JSON.stringify(user));

    setUser(user);
    setIsSignedIn(true);
  }, []);

  const registerUser = useCallback(async (userData: any) => {
    const data = await authService.register(userData);
    const { user, accessToken } = data;

    if (accessToken) await AsyncStorage.setItem('userToken', accessToken);
    if (user) await AsyncStorage.setItem('userData', JSON.stringify(user));

    setUser(user);
    setIsSignedIn(true);
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      isSignedIn,
      isAuthReady,
      user,
      signIn,
      register: registerUser,
      signOut,
    }),
    [isSignedIn, isAuthReady, user, signIn, registerUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
