import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_SETTINGS, type ProfileSettings } from '@/types';

function settingsKey(profileId: string) {
  return `settings_${profileId}`;
}

interface SettingsContextValue {
  getSettings: (profileId: string) => ProfileSettings;
  updateSettings: (profileId: string, patch: Partial<ProfileSettings>) => Promise<void>;
  currentSettings: ProfileSettings;
  setCurrentProfileId: (id: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [allSettings, setAllSettings] = useState<Record<string, ProfileSettings>>({});
  const [currentProfileId, setCurrentProfileId] = useState<string>('');

  const getSettings = useCallback(
    (profileId: string): ProfileSettings => {
      return allSettings[profileId] ?? { ...DEFAULT_SETTINGS };
    },
    [allSettings],
  );

  const loadSettings = useCallback(async (profileId: string) => {
    if (!profileId) return;
    const raw = await AsyncStorage.getItem(settingsKey(profileId));
    const loaded: ProfileSettings = raw
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
      : { ...DEFAULT_SETTINGS };
    setAllSettings((prev) => ({ ...prev, [profileId]: loaded }));
  }, []);

  useEffect(() => {
    if (currentProfileId) loadSettings(currentProfileId);
  }, [currentProfileId, loadSettings]);

  const updateSettings = useCallback(
    async (profileId: string, patch: Partial<ProfileSettings>) => {
      const current = allSettings[profileId] ?? { ...DEFAULT_SETTINGS };
      const updated = { ...current, ...patch };
      setAllSettings((prev) => ({ ...prev, [profileId]: updated }));
      await AsyncStorage.setItem(settingsKey(profileId), JSON.stringify(updated));
    },
    [allSettings],
  );

  const currentSettings = useMemo(
    () => allSettings[currentProfileId] ?? { ...DEFAULT_SETTINGS },
    [allSettings, currentProfileId],
  );

  const value = useMemo(
    () => ({ getSettings, updateSettings, currentSettings, setCurrentProfileId }),
    [getSettings, updateSettings, currentSettings, setCurrentProfileId],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
