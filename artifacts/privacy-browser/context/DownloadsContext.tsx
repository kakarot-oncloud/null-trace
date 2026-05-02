import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type Download } from '@/types';

const DOWNLOADS_KEY = 'downloads';

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

interface DownloadsContextValue {
  downloads: Download[];
  addDownload: (url: string, filename: string, profileId: string) => Promise<Download>;
  updateDownload: (id: string, patch: Partial<Download>) => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
}

const DownloadsContext = createContext<DownloadsContextValue | null>(null);

export function DownloadsProvider({ children }: { children: React.ReactNode }) {
  const [downloads, setDownloads] = useState<Download[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(DOWNLOADS_KEY).then((raw) => {
      if (raw) setDownloads(JSON.parse(raw));
    });
  }, []);

  const save = useCallback(async (updated: Download[]) => {
    setDownloads(updated);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  }, []);

  const addDownload = useCallback(
    async (url: string, filename: string, profileId: string): Promise<Download> => {
      const download: Download = {
        id: generateId(),
        url,
        filename,
        status: 'pending',
        progress: 0,
        startedAt: Date.now(),
        profileId,
      };
      const updated = [download, ...downloads];
      await save(updated);
      return download;
    },
    [downloads, save],
  );

  const updateDownload = useCallback(
    async (id: string, patch: Partial<Download>) => {
      const updated = downloads.map((d) => (d.id === id ? { ...d, ...patch } : d));
      await save(updated);
    },
    [downloads, save],
  );

  const removeDownload = useCallback(
    async (id: string) => {
      await save(downloads.filter((d) => d.id !== id));
    },
    [downloads, save],
  );

  const clearCompleted = useCallback(async () => {
    await save(downloads.filter((d) => d.status !== 'completed'));
  }, [downloads, save]);

  const value = useMemo(
    () => ({ downloads, addDownload, updateDownload, removeDownload, clearCompleted }),
    [downloads, addDownload, updateDownload, removeDownload, clearCompleted],
  );

  return <DownloadsContext.Provider value={value}>{children}</DownloadsContext.Provider>;
}

export function useDownloads() {
  const ctx = useContext(DownloadsContext);
  if (!ctx) throw new Error('useDownloads must be used within DownloadsProvider');
  return ctx;
}
