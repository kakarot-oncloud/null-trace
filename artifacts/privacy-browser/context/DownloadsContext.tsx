import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
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
  // Track which downloads are already being processed so we never double-start
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(DOWNLOADS_KEY).then((raw) => {
      if (raw) setDownloads(JSON.parse(raw));
    });
  }, []);

  const save = useCallback(async (updated: Download[]) => {
    setDownloads(updated);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  }, []);

  const updateDownloadInner = useCallback(
    async (id: string, patch: Partial<Download>, current: Download[]) => {
      const updated = current.map((d) => (d.id === id ? { ...d, ...patch } : d));
      setDownloads(updated);
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
      return updated;
    },
    [],
  );

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
      processingRef.current.delete(id);
      await save(downloads.filter((d) => d.id !== id));
    },
    [downloads, save],
  );

  const clearCompleted = useCallback(async () => {
    const removed = downloads.filter((d) => d.status === 'completed').map((d) => d.id);
    removed.forEach((id) => processingRef.current.delete(id));
    await save(downloads.filter((d) => d.status !== 'completed'));
  }, [downloads, save]);

  // Process pending downloads immediately — runs in the context so no screen needs to be open
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const pending = downloads.filter(
      (d) => d.status === 'pending' && !processingRef.current.has(d.id),
    );
    if (pending.length === 0) return;

    pending.forEach((d) => {
      processingRef.current.add(d.id);

      const docDir = FileSystem.documentDirectory;
      if (!docDir) {
        processingRef.current.delete(d.id);
        return;
      }

      const dest = docDir + d.filename;

      // Snapshot current downloads list for inline updates (avoids stale closure)
      setDownloads((prev) => {
        const snapshot = prev.map((t) => (t.id === d.id ? { ...t, status: 'downloading' as const, progress: 0 } : t));
        AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(snapshot));
        return snapshot;
      });

      const downloadResumable = FileSystem.createDownloadResumable(
        d.url,
        dest,
        {},
        (prog) => {
          const progress = prog.totalBytesExpectedToWrite > 0
            ? prog.totalBytesWritten / prog.totalBytesExpectedToWrite
            : 0;
          setDownloads((prev) => {
            const updated = prev.map((t) => (t.id === d.id ? { ...t, progress } : t));
            AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
            return updated;
          });
        },
      );

      downloadResumable.downloadAsync().then((result) => {
        processingRef.current.delete(d.id);
        if (result) {
          setDownloads((prev) => {
            const updated = prev.map((t) =>
              t.id === d.id ? { ...t, status: 'completed' as const, progress: 1, localPath: result.uri } : t,
            );
            AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
            return updated;
          });
        } else {
          setDownloads((prev) => {
            const updated = prev.map((t) =>
              t.id === d.id ? { ...t, status: 'failed' as const, error: 'Download failed' } : t,
            );
            AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      }).catch((e: any) => {
        processingRef.current.delete(d.id);
        setDownloads((prev) => {
          const updated = prev.map((t) =>
            t.id === d.id ? { ...t, status: 'failed' as const, error: e?.message ?? 'Unknown error' } : t,
          );
          AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
          return updated;
        });
      });
    });
  // Only re-run when a new pending download appears — not on every progress update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloads.filter((d) => d.status === 'pending').map((d) => d.id).join(',')]);

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
