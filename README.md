<div align="center">

<img src="artifacts/privacy-browser/assets/images/icon.png" width="120" height="120" style="border-radius: 24px" alt="Null Trace Icon" />

# Null Trace

### A production-grade, multi-profile privacy browser for Android & iOS

[![EAS Build](https://github.com/kakarot-oncloud/null-trace/actions/workflows/eas-build.yml/badge.svg)](https://github.com/kakarot-oncloud/null-trace/actions/workflows/eas-build.yml)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey?logo=android&logoColor=white)](https://expo.dev)

**Built with Expo · React Native · TypeScript · EAS**

[Features](#-features) · [Screenshots](#-screenshots) · [Installation](#-installation) · [Build](#-build-with-eas) · [Tech Stack](#-tech-stack) · [Privacy](#-privacy-architecture)

</div>

---

## What is Null Trace?

**Null Trace** is not just a WebView wrapper. It is a fully-featured, privacy-first mobile browser that gives you the tools to browse the internet without leaving a trace — across multiple isolated profiles, each with its own identity, proxy, and privacy settings.

Think of it as your own private browser that combines the best ideas from Brave, Firefox Focus, and Tor Browser — built natively for Android and iOS using Expo.

---

## ✨ Features

### 🌐 Browser Core
- Full WebView browser with address bar, progress indicator, and smooth navigation
- Back / Forward / Reload / Stop controls with haptic feedback
- Pull-to-refresh and swipe gesture navigation
- Multi-tab management — open, close, and switch between tabs
- Beautiful new-tab home page with quick links and privacy status

### 🛡️ Privacy Engine
| Feature | Description |
|---|---|
| **Ad Blocker** | Blocks 25+ ad networks at both request and JavaScript levels |
| **Tracker Blocking** | Eliminates analytics scripts, heatmaps, and data brokers |
| **HTTPS-First** | Automatically upgrades all HTTP connections to HTTPS |
| **WebRTC Shield** | Disables `RTCPeerConnection` to prevent IP leaks |
| **Do Not Track** | Injects the `DNT: 1` header on every request |
| **Referrer Policy** | Configurable: Default / Same-origin / No-referrer |
| **Cookie Control** | Block all cookies or third-party cookies only |
| **Clear on Exit** | Auto-clear cookies, cache, and history when the app closes |

### 👤 Multi-Profile System
- Create unlimited isolated browser profiles
- Each profile has its own tabs, bookmarks, history, settings, and cookies
- Per-profile **user agent spoofing** (Chrome, Firefox, Safari, mobile variants)
- Per-profile **language and locale** spoofing
- Per-profile **proxy assignment**
- Profile color indicators throughout the UI

### 🌐 Proxy Manager
- Add **HTTP**, **HTTPS**, and **SOCKS5** proxies
- Formats: `IP:PORT` or `USER:PASS@IP:PORT`
- Live connection test showing exit IP, country, and latency
- Proxies are assigned per-profile for full isolation

### 🔐 App Lock
- PIN lock with configurable 4–8 digit length
- PIN stored in device secure storage (not AsyncStorage)
- Biometric unlock — Face ID and fingerprint support
- Shake animation on wrong PIN entry with haptic error feedback
- Auto-lock on app background

### 📥 Download Manager
- In-app download manager with real-time progress bars
- Download files from any website
- Share downloaded files via the native system share sheet

### 🔖 Bookmarks & History
- Save and manage bookmarks per profile
- Full browsing history with relative timestamps
- One-tap history clear
- Bookmarks and recent history shown on the home page

### ⚙️ Settings
- Per-profile privacy controls with live toggles
- Site permission controls: Camera, Microphone, Location
- Performance: pause inactive tabs
- JavaScript, DOM Storage, mixed content controls
- Full security section with PIN and biometric management

---

## 📸 Screenshots

> Test on a real device using Expo Go for the full browser experience.

| Home Screen | Browser | Tab Switcher |
|---|---|---|
| Privacy shield, quick links, recent sites | Full WebView with address bar | Safari-style card grid |

| Menu | Settings | Profiles |
|---|---|---|
| Colored icon badges | iOS-style grouped cards | Isolated profiles with color rings |

---

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 9+
- [Expo Go](https://expo.dev/go) app on your Android or iOS device

### Run locally

```bash
# Clone the repo
git clone https://github.com/kakarot-oncloud/null-trace.git
cd null-trace

# Install all workspace dependencies
pnpm install

# Start the Expo dev server
pnpm --filter @workspace/privacy-browser run dev
```

Then scan the QR code with **Expo Go** on your device.

---

## 🏗️ Build with EAS

This project uses [Expo Application Services (EAS)](https://expo.dev/eas) for cloud builds. Builds trigger automatically on every push to `main`.

### Manual build

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build a preview APK (Android)
cd artifacts/privacy-browser
eas build --platform android --profile preview

# Build for iOS simulator
eas build --platform ios --profile preview

# Production build (app store)
eas build --platform all --profile production
```

### CI/CD with GitHub Actions

Every push to `main` automatically:
1. Installs dependencies
2. Runs TypeScript type check
3. Builds a preview Android APK via EAS

You can also trigger a manual build from the **Actions** tab with a platform selector.

Add your `EXPO_TOKEN` secret to your GitHub repo:
> Settings → Secrets and variables → Actions → New repository secret

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo SDK 54](https://expo.dev) + [React Native 0.81](https://reactnative.dev) |
| Language | TypeScript 5 (strict mode) |
| Navigation | [Expo Router v6](https://expo.github.io/router) (file-based routing) |
| Storage | AsyncStorage (tabs, history, bookmarks) + SecureStore (PIN) |
| Biometrics | expo-local-authentication |
| Animations | react-native-reanimated |
| Icons | @expo/vector-icons (Ionicons) |
| Font | Inter (400 / 500 / 600 / 700) |
| Build | EAS Build (cloud) |
| CI/CD | GitHub Actions |
| Monorepo | pnpm workspaces |

---

## 🔐 Privacy Architecture

Null Trace uses a layered privacy model inside a WebView:

```
Request Layer          → Block ad/tracker domains before they load
JavaScript Layer       → Disable WebRTC, spoof navigator.language, inject DNT
HTTP Header Layer      → Set Referrer-Policy, Do-Not-Track
Cookie Layer           → Block third-party cookies, clear on exit
Profile Layer          → Isolated AsyncStorage namespace per profile
Secure Storage Layer   → PIN in device keychain via expo-secure-store
```

> **Transparency note:** This browser is built on the system WebView (Android Chromium / iOS WKWebView). It cannot modify TLS fingerprints, spoof Canvas/WebGL signals at a hardware level, or route all OS traffic through a proxy without a VPN. These are inherent WebView limitations shared by all WebView-based browsers.

---

## 📁 Project Structure

```
null-trace/
├── artifacts/
│   └── privacy-browser/          # Expo app
│       ├── app/                  # Expo Router screens
│       │   ├── index.tsx         # Main browser screen
│       │   ├── settings/         # Settings screen
│       │   ├── profiles/         # Profile management
│       │   ├── bookmarks/        # Bookmarks & history
│       │   ├── proxy/            # Proxy manager
│       │   └── downloads/        # Download manager
│       ├── components/           # Reusable UI components
│       │   ├── AddressBar.tsx    # Safari-style address bar
│       │   ├── BrowserToolbar.tsx
│       │   ├── BrowserWebView.tsx
│       │   ├── HomeScreen.tsx    # New tab page
│       │   ├── TabSwitcher.tsx
│       │   ├── MenuSheet.tsx
│       │   ├── PinLock.tsx
│       │   └── SettingsRow.tsx
│       ├── context/              # React context providers
│       │   ├── AppLockContext.tsx
│       │   ├── BrowserContext.tsx
│       │   ├── DownloadsContext.tsx
│       │   ├── ProfileContext.tsx
│       │   └── SettingsContext.tsx
│       ├── constants/
│       │   └── colors.ts         # Design tokens (light + dark)
│       ├── hooks/
│       │   └── useColors.ts
│       └── eas.json              # EAS build profiles
├── .github/
│   └── workflows/
│       └── eas-build.yml         # CI/CD pipeline
└── README.md
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-privacy-feature`
3. Commit your changes: `git commit -m 'Add amazing privacy feature'`
4. Push: `git push origin feature/amazing-privacy-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [kakarot-oncloud](https://github.com/kakarot-oncloud)

---

<div align="center">

Built with ❤️ using Expo + React Native

**Zero ads. Zero tracking. Zero trace.**

</div>
