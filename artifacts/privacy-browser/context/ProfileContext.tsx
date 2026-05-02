import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PROFILE_COLORS, type Profile, type ProxyConfig } from '@/types';
import { USER_AGENTS } from '@/constants/userAgents';

const PROFILES_KEY = 'profiles';
const PROXIES_KEY = 'proxies';
const ACTIVE_PROFILE_KEY = 'active_profile_id';

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

function createDefaultProfile(): Profile {
  return {
    id: generateId(),
    name: 'Default',
    color: PROFILE_COLORS[0],
    userAgent: USER_AGENTS[0].value,
    language: 'en-US',
    timezone: 'UTC',
    proxyId: null,
    createdAt: Date.now(),
  };
}

interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile | null;
  proxies: ProxyConfig[];
  setActiveProfile: (id: string) => Promise<void>;
  createProfile: (data: Partial<Profile>) => Promise<Profile>;
  updateProfile: (id: string, data: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  createProxy: (data: Omit<ProxyConfig, 'id'>) => Promise<ProxyConfig>;
  updateProxy: (id: string, data: Partial<ProxyConfig>) => Promise<void>;
  deleteProxy: (id: string) => Promise<void>;
  getProxy: (id: string) => ProxyConfig | undefined;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [proxies, setProxies] = useState<ProxyConfig[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [profilesRaw, proxiesRaw, activeId] = await Promise.all([
        AsyncStorage.getItem(PROFILES_KEY),
        AsyncStorage.getItem(PROXIES_KEY),
        AsyncStorage.getItem(ACTIVE_PROFILE_KEY),
      ]);
      let loadedProfiles: Profile[] = profilesRaw ? JSON.parse(profilesRaw) : [];
      const loadedProxies: ProxyConfig[] = proxiesRaw ? JSON.parse(proxiesRaw) : [];

      if (loadedProfiles.length === 0) {
        const defaultProfile = createDefaultProfile();
        loadedProfiles = [defaultProfile];
        await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(loadedProfiles));
      }

      const validActiveId =
        activeId && loadedProfiles.find((p) => p.id === activeId)
          ? activeId
          : loadedProfiles[0].id;

      setProfiles(loadedProfiles);
      setProxies(loadedProxies);
      setActiveProfileId(validActiveId);
      setLoaded(true);
    })();
  }, []);

  const saveProfiles = useCallback(async (updated: Profile[]) => {
    setProfiles(updated);
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
  }, []);

  const saveProxies = useCallback(async (updated: ProxyConfig[]) => {
    setProxies(updated);
    await AsyncStorage.setItem(PROXIES_KEY, JSON.stringify(updated));
  }, []);

  const setActiveProfile = useCallback(async (id: string) => {
    setActiveProfileId(id);
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, id);
  }, []);

  const createProfile = useCallback(
    async (data: Partial<Profile>): Promise<Profile> => {
      const profile: Profile = {
        id: generateId(),
        name: data.name ?? 'New Profile',
        color: data.color ?? PROFILE_COLORS[profiles.length % PROFILE_COLORS.length],
        userAgent: data.userAgent ?? USER_AGENTS[0].value,
        language: data.language ?? 'en-US',
        timezone: data.timezone ?? 'UTC',
        proxyId: data.proxyId ?? null,
        createdAt: Date.now(),
      };
      await saveProfiles([...profiles, profile]);
      return profile;
    },
    [profiles, saveProfiles],
  );

  const updateProfile = useCallback(
    async (id: string, data: Partial<Profile>) => {
      const updated = profiles.map((p) => (p.id === id ? { ...p, ...data } : p));
      await saveProfiles(updated);
    },
    [profiles, saveProfiles],
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      if (profiles.length <= 1) return;
      const updated = profiles.filter((p) => p.id !== id);
      await saveProfiles(updated);
      if (activeProfileId === id) {
        await setActiveProfile(updated[0].id);
      }
    },
    [profiles, activeProfileId, saveProfiles, setActiveProfile],
  );

  const createProxy = useCallback(
    async (data: Omit<ProxyConfig, 'id'>): Promise<ProxyConfig> => {
      const proxy: ProxyConfig = { id: generateId(), ...data };
      await saveProxies([...proxies, proxy]);
      return proxy;
    },
    [proxies, saveProxies],
  );

  const updateProxy = useCallback(
    async (id: string, data: Partial<ProxyConfig>) => {
      const updated = proxies.map((p) => (p.id === id ? { ...p, ...data } : p));
      await saveProxies(updated);
    },
    [proxies, saveProxies],
  );

  const deleteProxy = useCallback(
    async (id: string) => {
      await saveProxies(proxies.filter((p) => p.id !== id));
      // unassign from profiles
      const updatedProfiles = profiles.map((p) =>
        p.proxyId === id ? { ...p, proxyId: null } : p,
      );
      await saveProfiles(updatedProfiles);
    },
    [proxies, profiles, saveProxies, saveProfiles],
  );

  const getProxy = useCallback(
    (id: string) => proxies.find((p) => p.id === id),
    [proxies],
  );

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? null,
    [profiles, activeProfileId],
  );

  const value = useMemo(
    () => ({
      profiles,
      activeProfile,
      proxies,
      setActiveProfile,
      createProfile,
      updateProfile,
      deleteProfile,
      createProxy,
      updateProxy,
      deleteProxy,
      getProxy,
    }),
    [
      profiles,
      activeProfile,
      proxies,
      setActiveProfile,
      createProfile,
      updateProfile,
      deleteProfile,
      createProxy,
      updateProxy,
      deleteProxy,
      getProxy,
    ],
  );

  if (!loaded) return null;
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfiles() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfiles must be used within ProfileProvider');
  return ctx;
}
