import React, { forwardRef, useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { type ProfileSettings, type Profile, HOME_URL } from '@/types';

const AD_TRACKER_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googletagmanager.com',
  'google-analytics.com', 'analytics.google.com', 'facebook.net',
  'ads.twitter.com', 'moatads.com', 'pubmatic.com', 'rubiconproject.com',
  'openx.net', 'adnxs.com', 'criteo.com', 'taboola.com', 'outbrain.com',
  'adsrvr.org', 'advertising.com', 'scorecardresearch.com',
  'quantserve.com', 'chartbeat.com', 'hotjar.com', 'mixpanel.com',
  'segment.com', 'amplitude.com', 'yandex-team.ru', 'mc.yandex.ru',
];

function buildInjectedJS(settings: ProfileSettings, profile: Profile): string {
  const parts: string[] = [];

  if (profile.language) {
    parts.push(`
      try {
        Object.defineProperty(navigator, 'language', { get: () => '${profile.language}', configurable: true });
        Object.defineProperty(navigator, 'languages', { get: () => ['${profile.language}'], configurable: true });
      } catch(e) {}
    `);
  }

  if (settings.dntEnabled) {
    parts.push(`
      try {
        Object.defineProperty(navigator, 'doNotTrack', { get: () => '1', configurable: true });
      } catch(e) {}
    `);
  }

  if (!settings.webrtcEnabled) {
    parts.push(`
      try {
        window.RTCPeerConnection = undefined;
        window.webkitRTCPeerConnection = undefined;
        window.mozRTCPeerConnection = undefined;
        if (navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('WebRTC disabled by privacy settings'));
          navigator.mediaDevices.enumerateDevices = () => Promise.resolve([]);
        }
      } catch(e) {}
    `);
  }

  if (settings.referrerPolicy === 'no-referrer') {
    parts.push(`
      try {
        const meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'no-referrer';
        document.head && document.head.appendChild(meta);
      } catch(e) {}
    `);
  } else if (settings.referrerPolicy === 'same-origin') {
    parts.push(`
      try {
        const meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'same-origin';
        document.head && document.head.appendChild(meta);
      } catch(e) {}
    `);
  }

  if (settings.adBlockerEnabled || settings.trackerBlockingEnabled) {
    const domains = settings.adBlockerEnabled && settings.trackerBlockingEnabled
      ? AD_TRACKER_DOMAINS
      : settings.adBlockerEnabled
        ? AD_TRACKER_DOMAINS.slice(0, 14)
        : AD_TRACKER_DOMAINS.slice(14);

    parts.push(`
      (function() {
        try {
          const blockedDomains = ${JSON.stringify(domains)};
          const isBlocked = (url) => {
            if (!url) return false;
            try { const u = new URL(url); return blockedDomains.some(d => u.hostname.endsWith(d)); } catch { return false; }
          };
          const origFetch = window.fetch;
          window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string' && isBlocked(url)) return Promise.reject(new Error('Blocked by Privacy Browser'));
            if (url instanceof Request && isBlocked(url.url)) return Promise.reject(new Error('Blocked'));
            return origFetch.apply(this, args);
          };
          const XHROpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(m, url, ...rest) {
            this._pbBlocked = isBlocked(url);
            return XHROpen.call(this, m, url, ...rest);
          };
          const XHRSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.send = function(...args) {
            if (this._pbBlocked) { Object.defineProperty(this, 'status', {get: () => 0}); return; }
            return XHRSend.apply(this, args);
          };
        } catch(e) {}
      })();
    `);
  }

  return parts.join('\n');
}

interface BrowserWebViewProps {
  url: string;
  navKey: number;
  settings: ProfileSettings;
  profile: Profile;
  onNavigationStateChange: (state: { url: string; title: string; canGoBack: boolean; canGoForward: boolean }) => void;
  onLoadStart: (url: string) => void;
  onLoadEnd: () => void;
  onLoadProgress: (progress: number) => void;
  onDownloadRequest: (url: string, filename: string) => void;
  webViewRef: React.RefObject<any>;
}

export function BrowserWebView({
  url,
  navKey,
  settings,
  profile,
  onNavigationStateChange,
  onLoadStart,
  onLoadEnd,
  onLoadProgress,
  onDownloadRequest,
  webViewRef,
}: BrowserWebViewProps) {
  const injectedJS = useMemo(() => buildInjectedJS(settings, profile), [settings, profile]);

  const handleShouldStartLoad = useCallback(
    (request: { url: string }) => {
      const reqUrl = request.url;

      // HTTPS-first mode
      if (settings.httpsFirstMode && reqUrl.startsWith('http://') && !reqUrl.startsWith('http://localhost')) {
        const httpsUrl = reqUrl.replace('http://', 'https://');
        webViewRef.current?.injectJavaScript(`window.location.href = '${httpsUrl}';`);
        return false;
      }

      // Block ad/tracker domains at request level
      if (settings.adBlockerEnabled || settings.trackerBlockingEnabled) {
        try {
          const u = new URL(reqUrl);
          const blocked = AD_TRACKER_DOMAINS.some((d) => u.hostname.endsWith(d));
          if (blocked) return false;
        } catch {
          // continue
        }
      }

      return true;
    },
    [settings, webViewRef],
  );

  const handleNavChange = useCallback(
    (navState: any) => {
      onNavigationStateChange({
        url: navState.url ?? '',
        title: navState.title ?? '',
        canGoBack: navState.canGoBack ?? false,
        canGoForward: navState.canGoForward ?? false,
      });
    },
    [onNavigationStateChange],
  );

  const handleLoadStart = useCallback(
    (e: any) => {
      onLoadStart(e.nativeEvent?.url ?? url);
    },
    [onLoadStart, url],
  );

  const handleLoadProgress = useCallback(
    (e: any) => {
      onLoadProgress(e.nativeEvent?.progress ?? 0);
    },
    [onLoadProgress],
  );

  const handleError = useCallback(() => {
    onLoadEnd();
  }, [onLoadEnd]);

  // Web placeholder — WebView cannot run on web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webPlaceholder}>
        {/* WebView is not available in web preview — use Expo Go on your device to test browsing */}
      </View>
    );
  }

  // Lazy-load WebView to avoid issues on web
  const { WebView } = require('react-native-webview');

  return (
    <WebView
      ref={webViewRef}
      key={navKey}
      source={{ uri: url }}
      style={styles.webview}
      userAgent={profile.userAgent}
      javaScriptEnabled={settings.javascriptEnabled}
      domStorageEnabled={settings.domStorageEnabled}
      thirdPartyCookiesEnabled={!settings.blockThirdPartyCookies}
      sharedCookiesEnabled={settings.cookiesEnabled}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      injectedJavaScriptBeforeContentLoaded={injectedJS}
      injectedJavaScriptForMainFrameOnly={false}
      onShouldStartLoadWithRequest={handleShouldStartLoad}
      onNavigationStateChange={handleNavChange}
      onLoadStart={handleLoadStart}
      onLoadEnd={onLoadEnd}
      onLoadProgress={handleLoadProgress}
      onError={handleError}
      onHttpError={handleError}
      onFileDownload={(event: any) => {
        const { downloadUrl } = event.nativeEvent;
        const filename = downloadUrl.split('/').pop()?.split('?')[0] ?? 'download';
        onDownloadRequest(downloadUrl, filename);
      }}
      allowsBackForwardNavigationGestures
      pullToRefreshEnabled
      geolocationEnabled={settings.locationPermission !== 'block'}
      mixedContentMode="compatibility"
      originWhitelist={['*']}
      setSupportMultipleWindows={false}
      cacheEnabled={!settings.clearCacheOnExit}
      incognito={settings.clearCookiesOnExit}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
  webPlaceholder: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
