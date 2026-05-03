import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Dedicated key for “intro carousel finished → show auth”.
 * Do not reuse `@goshop_onboarding_done`; older builds set that when skipping straight to Home,
 * which made the app jump to Login with no carousel.
 */
export const HAS_SEEN_ONBOARDING_KEY = '@goshop_intro_completed';

type OnboardingGateValue = {
  hasSeenOnboarding: boolean;
  isOnboardingGateReady: boolean;
  markHasSeenOnboarding: () => Promise<void>;
};

const OnboardingGateContext = createContext<OnboardingGateValue | null>(null);

export function OnboardingGateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isOnboardingGateReady, setIsOnboardingGateReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY).then((v) => {
      if (!alive) return;
      setHasSeenOnboarding(v === 'true');
      setIsOnboardingGateReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const markHasSeenOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
  }, []);

  const value = useMemo(
    (): OnboardingGateValue => ({
      hasSeenOnboarding,
      isOnboardingGateReady,
      markHasSeenOnboarding,
    }),
    [hasSeenOnboarding, isOnboardingGateReady, markHasSeenOnboarding],
  );

  return (
    <OnboardingGateContext.Provider value={value}>
      {children}
    </OnboardingGateContext.Provider>
  );
}

export function useOnboardingGate() {
  const ctx = useContext(OnboardingGateContext);
  if (!ctx) {
    throw new Error('useOnboardingGate must be used within OnboardingGateProvider');
  }
  return ctx;
}
