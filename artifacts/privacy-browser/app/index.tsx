import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Share, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressBar } from '@/components/AddressBar';
import { BrowserToolbar } from '@/components/BrowserToolbar';
import { BrowserWebView } from '@/components/BrowserWebView';
import { HomeScreen } from '@/components/HomeScreen';
import { MenuSheet } from '@/components/MenuSheet';
import { PinLock } from '@/components/PinLock';
import { TabSwitcher } from '@/components/TabSwitcher';
import { useAppLock } from '@/context/AppLockContext';
import { useBrowser } from '@/context/BrowserContext';
import { useDownloads } from '@/context/DownloadsContext';
import { useProfiles } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { useColors } from '@/hooks/useColors';
import { HOME_URL } from '@/types';

function isOnHomePage(url: string): boolean {
  return !url || url === HOME_URL || url === 'about:blank' || url === '';
}

export default function BrowserScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { isLocked } = useAppLock();
  const { activeProfile } = useProfiles();
  const { currentSettings } = useSettings();
  const { activeTab, activeTabId, updateTab, addBookmark, isBookmarked, addHistory, tabs, createTab } = useBrowser();
  const { addDownload } = useDownloads();

  const webViewRef = useRef<any>(null);
  const [navUrl, setNavUrl] = useState(activeTab?.url ?? HOME_URL);
  const [navKey, setNavKey] = useState(0);
  const [tabsVisible, setTabsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  // Sync nav state when active tab changes
  const prevTabIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeTabId && prevTabIdRef.current !== activeTabId) {
      prevTabIdRef.current = activeTabId;
      const url = activeTab?.url ?? HOME_URL;
      setNavUrl(url);
      setNavKey((k) => k + 1);
    }
  }, [activeTabId, activeTab]);

  const handleNavigate = useCallback(
    (url: string) => {
      setNavUrl(url);
      setNavKey((k) => k + 1);
      if (activeTabId) {
        updateTab(activeTabId, { url, title: 'Loading...', isLoading: true });
      }
    },
    [activeTabId, updateTab],
  );

  const handleNavStateChange = useCallback(
    (state: { url: string; title: string; canGoBack: boolean; canGoForward: boolean }) => {
      if (activeTabId) {
        updateTab(activeTabId, {
          url: state.url,
          title: state.title || state.url,
          canGoBack: state.canGoBack,
          canGoForward: state.canGoForward,
        });
      }
      setIsSecure(state.url.startsWith('https://'));
      if (state.title && state.url && !isOnHomePage(state.url)) {
        addHistory(state.url, state.title);
      }
    },
    [activeTabId, updateTab, addHistory],
  );

  const handleLoadStart = useCallback(
    (url: string) => {
      if (activeTabId) {
        updateTab(activeTabId, { isLoading: true, loadingProgress: 0, url });
      }
    },
    [activeTabId, updateTab],
  );

  const handleLoadEnd = useCallback(() => {
    if (activeTabId) {
      updateTab(activeTabId, { isLoading: false, loadingProgress: 1 });
    }
  }, [activeTabId, updateTab]);

  const handleLoadProgress = useCallback(
    (progress: number) => {
      if (activeTabId) {
        updateTab(activeTabId, { loadingProgress: progress });
      }
    },
    [activeTabId, updateTab],
  );

  const handleDownload = useCallback(
    (url: string, filename: string) => {
      if (activeProfile) {
        addDownload(url, filename, activeProfile.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    [activeProfile, addDownload],
  );

  const handleBookmark = useCallback(() => {
    if (!activeTab) return;
    if (!isBookmarked(activeTab.url)) {
      addBookmark(activeTab.url, activeTab.title);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [activeTab, isBookmarked, addBookmark]);

  const handleGoBack = useCallback(() => {
    webViewRef.current?.goBack?.();
  }, []);

  const handleGoForward = useCallback(() => {
    webViewRef.current?.goForward?.();
  }, []);

  const handleReload = useCallback(() => {
    if (isOnHomePage(activeTab?.url ?? '')) return;
    webViewRef.current?.reload?.();
  }, [activeTab]);

  const handleStop = useCallback(() => {
    webViewRef.current?.stopLoading?.();
  }, []);

  const handleShare = useCallback(async () => {
    if (!activeTab || isOnHomePage(activeTab.url)) return;
    if (Platform.OS !== 'web') {
      await Share.share({ url: activeTab.url, title: activeTab.title });
    }
  }, [activeTab]);

  const handleCopyUrl = useCallback(async () => {
    if (!activeTab) return;
    await Clipboard.setStringAsync(activeTab.url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [activeTab]);

  const handleNewTab = useCallback(() => {
    createTab();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [createTab]);

  const handleFocusSearch = useCallback(() => {
    // Trigger address bar focus — addressed via a direct ref call in AddressBar
  }, []);

  if (isLocked) {
    return <PinLock />;
  }

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const currentUrl = activeTab?.url ?? navUrl;
  const showHome = isOnHomePage(currentUrl);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <AddressBar
        url={currentUrl}
        isLoading={activeTab?.isLoading ?? false}
        loadingProgress={activeTab?.loadingProgress ?? 0}
        canGoBack={(activeTab?.canGoBack ?? false) && !showHome}
        canGoForward={activeTab?.canGoForward ?? false}
        isSecure={isSecure}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onStop={handleStop}
      />

      <View style={s.webContainer}>
        {showHome ? (
          <HomeScreen
            onNavigate={handleNavigate}
            onFocusSearch={handleFocusSearch}
          />
        ) : (
          activeProfile && (
            <BrowserWebView
              url={navUrl}
              navKey={navKey}
              settings={currentSettings}
              profile={activeProfile}
              onNavigationStateChange={handleNavStateChange}
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              onLoadProgress={handleLoadProgress}
              onDownloadRequest={handleDownload}
              webViewRef={webViewRef}
            />
          )
        )}
      </View>

      <BrowserToolbar
        tabCount={tabs.length}
        isBookmarked={activeTab ? isBookmarked(activeTab.url) : false}
        profileColor={activeProfile?.color ?? '#007AFF'}
        profileName={activeProfile?.name ?? 'Default'}
        onBookmark={handleBookmark}
        onShowTabs={() => setTabsVisible(true)}
        onShowProfiles={() => setMenuVisible(true)}
        onShowMenu={() => setMenuVisible(true)}
        onNewTab={handleNewTab}
      />

      <TabSwitcher visible={tabsVisible} onClose={() => setTabsVisible(false)} />
      <MenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onShare={handleShare}
        onCopyUrl={handleCopyUrl}
      />
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    webContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
