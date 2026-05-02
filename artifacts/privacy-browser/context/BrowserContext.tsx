import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type Bookmark, type BrowserTab, type HistoryEntry, HOME_URL } from '@/types';

function tabsKey(profileId: string) {
  return `tabs_${profileId}`;
}
function bookmarksKey(profileId: string) {
  return `bookmarks_${profileId}`;
}
function historyKey(profileId: string) {
  return `history_${profileId}`;
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

function newTab(url = HOME_URL): BrowserTab {
  return {
    id: generateId(),
    url,
    title: 'New Tab',
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    loadingProgress: 0,
  };
}

interface BrowserContextValue {
  tabs: BrowserTab[];
  activeTabId: string | null;
  activeTab: BrowserTab | null;
  bookmarks: Bookmark[];
  history: HistoryEntry[];
  createTab: (url?: string) => void;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  updateTab: (id: string, patch: Partial<BrowserTab>) => void;
  addBookmark: (url: string, title: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (url: string) => boolean;
  addHistory: (url: string, title: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadProfile: (profileId: string) => Promise<void>;
  clearProfileData: (profileId: string) => Promise<void>;
  currentProfileId: string;
}

const BrowserContext = createContext<BrowserContextValue | null>(null);

export function BrowserProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<BrowserTab[]>([newTab()]);
  const [activeTabId, setActiveTabId] = useState<string | null>(tabs[0].id);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState('');

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? null,
    [tabs, activeTabId],
  );

  const loadProfile = useCallback(async (profileId: string) => {
    setCurrentProfileId(profileId);
    const [tabsRaw, bookmarksRaw, historyRaw] = await Promise.all([
      AsyncStorage.getItem(tabsKey(profileId)),
      AsyncStorage.getItem(bookmarksKey(profileId)),
      AsyncStorage.getItem(historyKey(profileId)),
    ]);
    const loadedTabs: BrowserTab[] = tabsRaw ? JSON.parse(tabsRaw) : [newTab()];
    const loadedBookmarks: Bookmark[] = bookmarksRaw ? JSON.parse(bookmarksRaw) : [];
    const loadedHistory: HistoryEntry[] = historyRaw ? JSON.parse(historyRaw) : [];
    setTabs(loadedTabs.length ? loadedTabs : [newTab()]);
    setActiveTabId(loadedTabs[0]?.id ?? null);
    setBookmarks(loadedBookmarks);
    setHistory(loadedHistory);
  }, []);

  const saveTabs = useCallback(
    async (updated: BrowserTab[]) => {
      if (!currentProfileId) return;
      await AsyncStorage.setItem(tabsKey(currentProfileId), JSON.stringify(updated));
    },
    [currentProfileId],
  );

  const createTab = useCallback(
    (url?: string) => {
      const tab = newTab(url);
      setTabs((prev) => {
        const updated = [...prev, tab];
        saveTabs(updated);
        return updated;
      });
      setActiveTabId(tab.id);
    },
    [saveTabs],
  );

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) {
          const fresh = newTab();
          setActiveTabId(fresh.id);
          saveTabs([fresh]);
          return [fresh];
        }
        const updated = prev.filter((t) => t.id !== id);
        if (activeTabId === id) {
          const idx = prev.findIndex((t) => t.id === id);
          const newActive = updated[Math.min(idx, updated.length - 1)];
          setActiveTabId(newActive?.id ?? null);
        }
        saveTabs(updated);
        return updated;
      });
    },
    [activeTabId, saveTabs],
  );

  const switchTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const updateTab = useCallback(
    (id: string, patch: Partial<BrowserTab>) => {
      setTabs((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
        saveTabs(updated);
        return updated;
      });
    },
    [saveTabs],
  );

  const addBookmark = useCallback(
    async (url: string, title: string) => {
      if (!currentProfileId) return;
      const bookmark: Bookmark = {
        id: generateId(),
        url,
        title,
        profileId: currentProfileId,
        createdAt: Date.now(),
      };
      const updated = [bookmark, ...bookmarks];
      setBookmarks(updated);
      await AsyncStorage.setItem(bookmarksKey(currentProfileId), JSON.stringify(updated));
    },
    [bookmarks, currentProfileId],
  );

  const removeBookmark = useCallback(
    async (id: string) => {
      if (!currentProfileId) return;
      const updated = bookmarks.filter((b) => b.id !== id);
      setBookmarks(updated);
      await AsyncStorage.setItem(bookmarksKey(currentProfileId), JSON.stringify(updated));
    },
    [bookmarks, currentProfileId],
  );

  const isBookmarked = useCallback(
    (url: string) => bookmarks.some((b) => b.url === url),
    [bookmarks],
  );

  const addHistory = useCallback(
    async (url: string, title: string) => {
      if (!currentProfileId) return;
      const entry: HistoryEntry = {
        id: generateId(),
        url,
        title,
        profileId: currentProfileId,
        visitedAt: Date.now(),
      };
      const updated = [entry, ...history].slice(0, 500);
      setHistory(updated);
      await AsyncStorage.setItem(historyKey(currentProfileId), JSON.stringify(updated));
    },
    [history, currentProfileId],
  );

  const clearHistory = useCallback(async () => {
    if (!currentProfileId) return;
    setHistory([]);
    await AsyncStorage.setItem(historyKey(currentProfileId), JSON.stringify([]));
  }, [currentProfileId]);

  const clearProfileData = useCallback(async (profileId: string) => {
    await Promise.all([
      AsyncStorage.removeItem(tabsKey(profileId)),
      AsyncStorage.removeItem(bookmarksKey(profileId)),
      AsyncStorage.removeItem(historyKey(profileId)),
    ]);
  }, []);

  const value = useMemo(
    () => ({
      tabs,
      activeTabId,
      activeTab,
      bookmarks,
      history,
      createTab,
      closeTab,
      switchTab,
      updateTab,
      addBookmark,
      removeBookmark,
      isBookmarked,
      addHistory,
      clearHistory,
      loadProfile,
      clearProfileData,
      currentProfileId,
    }),
    [
      tabs,
      activeTabId,
      activeTab,
      bookmarks,
      history,
      createTab,
      closeTab,
      switchTab,
      updateTab,
      addBookmark,
      removeBookmark,
      isBookmarked,
      addHistory,
      clearHistory,
      loadProfile,
      clearProfileData,
      currentProfileId,
    ],
  );

  return <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>;
}

export function useBrowser() {
  const ctx = useContext(BrowserContext);
  if (!ctx) throw new Error('useBrowser must be used within BrowserProvider');
  return ctx;
}
