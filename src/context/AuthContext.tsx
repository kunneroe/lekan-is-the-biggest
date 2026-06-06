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
    await AsyncStorage.removeItem('refreshToken');
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
        const userStr = await AsyncStorage.getItem('userData');
        
        if (token && userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            setIsSignedIn(true);
          } catch (e) {
            console.error('Failed to parse cached user data');
          }
        } else if (token) {
          // Fallback if token exists but no user data
          try {
            const res = await authService.getProfile();
            const userData = res.user ? res.user : res;
            if (!alive) return;
            setUser(userData);
            setIsSignedIn(true);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          } catch (error: any) {
            console.log('Profile fetch failed, but keeping session active if 404', error.message);
            // Do NOT force a logout here if it's a 404 missing endpoint error.
            if (error.response?.status !== 404) {
               // Only sign out if it's a strict 401 unauthorized
               if (error.response?.status === 401) await signOut();
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
    const { user, accessToken, refreshToken } = data;
    
    if (accessToken) await AsyncStorage.setItem('userToken', accessToken);
    if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
    if (user) await AsyncStorage.setItem('userData', JSON.stringify(user));
    
    setUser(user);
    setIsSignedIn(true);
  }, []);

  const registerUser = useCallback(async (userData: any) => {
    const data = await authService.register(userData);
    const { user, accessToken, refreshToken } = data;
    
    if (accessToken) await AsyncStorage.setItem('userToken', accessToken);
    if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
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
