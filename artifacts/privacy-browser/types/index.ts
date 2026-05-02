export interface Profile {
  id: string;
  name: string;
  color: string;
  userAgent: string;
  language: string;
  timezone: string;
  proxyId: string | null;
  createdAt: number;
}

export interface ProxyConfig {
  id: string;
  name: string;
  type: 'HTTP' | 'HTTPS' | 'SOCKS5';
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  loadingProgress: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  profileId: string;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  profileId: string;
  visitedAt: number;
}

export interface Download {
  id: string;
  url: string;
  filename: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  size?: number;
  localPath?: string;
  error?: string;
  startedAt: number;
  profileId: string;
}

export interface ProfileSettings {
  javascriptEnabled: boolean;
  domStorageEnabled: boolean;
  cookiesEnabled: boolean;
  blockThirdPartyCookies: boolean;
  adBlockerEnabled: boolean;
  trackerBlockingEnabled: boolean;
  dntEnabled: boolean;
  referrerPolicy: 'default' | 'no-referrer' | 'same-origin';
  httpsFirstMode: boolean;
  webrtcEnabled: boolean;
  cameraPermission: 'ask' | 'allow' | 'block';
  microphonePermission: 'ask' | 'allow' | 'block';
  locationPermission: 'ask' | 'allow' | 'block';
  clearCookiesOnExit: boolean;
  clearCacheOnExit: boolean;
  clearHistoryOnExit: boolean;
  pauseInactiveTabs: boolean;
}

export const DEFAULT_SETTINGS: ProfileSettings = {
  javascriptEnabled: true,
  domStorageEnabled: true,
  cookiesEnabled: true,
  blockThirdPartyCookies: true,
  adBlockerEnabled: true,
  trackerBlockingEnabled: true,
  dntEnabled: true,
  referrerPolicy: 'same-origin',
  httpsFirstMode: true,
  webrtcEnabled: false,
  cameraPermission: 'ask',
  microphonePermission: 'ask',
  locationPermission: 'ask',
  clearCookiesOnExit: false,
  clearCacheOnExit: false,
  clearHistoryOnExit: false,
  pauseInactiveTabs: true,
};

export const PROFILE_COLORS = [
  '#007AFF', '#34C759', '#FF3B30', '#FF9500',
  '#AF52DE', '#FF6B35', '#30D158', '#5E5CE6',
];

export const HOME_URL = 'about:blank';
