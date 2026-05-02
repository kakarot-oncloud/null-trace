import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

const PIN_KEY = 'app_pin';
const PIN_ENABLED_KEY = 'app_pin_enabled';
const BIOMETRIC_ENABLED_KEY = 'app_biometric_enabled';

interface AppLockContextValue {
  isLocked: boolean;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  setPIN: (pin: string) => Promise<void>;
  disablePIN: () => Promise<void>;
  enableBiometric: (enabled: boolean) => Promise<void>;
  unlock: (pin?: string) => Promise<boolean>;
  lock: () => void;
  verifyPIN: (pin: string) => Promise<boolean>;
  biometricAvailable: boolean;
}

const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const [pinEn, bioEn] = await Promise.all([
        AsyncStorage.getItem(PIN_ENABLED_KEY),
        AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY),
      ]);
      const pEnabled = pinEn === 'true';
      const bEnabled = bioEn === 'true';
      setPinEnabled(pEnabled);
      setBiometricEnabled(bEnabled);
      if (pEnabled || bEnabled) setIsLocked(true);

      if (Platform.OS !== 'web') {
        try {
          const LocalAuth = require('expo-local-authentication');
          const hasHardware = await LocalAuth.hasHardwareAsync();
          const isEnrolled = await LocalAuth.isEnrolledAsync();
          setBiometricAvailable(hasHardware && isEnrolled);
        } catch {
          setBiometricAvailable(false);
        }
      }
      setInitialized(true);
    })();
  }, []);

  const setPIN = useCallback(async (pin: string) => {
    await SecureStore.setItemAsync(PIN_KEY, pin);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
    setPinEnabled(true);
  }, []);

  const disablePIN = useCallback(async () => {
    await SecureStore.deleteItemAsync(PIN_KEY);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
    setPinEnabled(false);
    setBiometricEnabled(false);
    setIsLocked(false);
  }, []);

  const enableBiometric = useCallback(async (enabled: boolean) => {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    setBiometricEnabled(enabled);
  }, []);

  const verifyPIN = useCallback(async (pin: string): Promise<boolean> => {
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    return stored === pin;
  }, []);

  const unlock = useCallback(
    async (pin?: string): Promise<boolean> => {
      if (biometricEnabled && Platform.OS !== 'web') {
        try {
          const LocalAuth = require('expo-local-authentication');
          const result = await LocalAuth.authenticateAsync({
            promptMessage: 'Unlock Privacy Browser',
            fallbackLabel: 'Use PIN',
          });
          if (result.success) {
            setIsLocked(false);
            return true;
          }
        } catch {
          // fall through to PIN
        }
      }
      if (pin !== undefined) {
        const ok = await verifyPIN(pin);
        if (ok) setIsLocked(false);
        return ok;
      }
      if (!pinEnabled && !biometricEnabled) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [biometricEnabled, pinEnabled, verifyPIN],
  );

  const lock = useCallback(() => {
    if (pinEnabled || biometricEnabled) setIsLocked(true);
  }, [pinEnabled, biometricEnabled]);

  const value = useMemo(
    () => ({
      isLocked,
      pinEnabled,
      biometricEnabled,
      biometricAvailable,
      setPIN,
      disablePIN,
      enableBiometric,
      unlock,
      lock,
      verifyPIN,
    }),
    [
      isLocked,
      pinEnabled,
      biometricEnabled,
      biometricAvailable,
      setPIN,
      disablePIN,
      enableBiometric,
      unlock,
      lock,
      verifyPIN,
    ],
  );

  if (!initialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock() {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used within AppLockProvider');
  return ctx;
}
