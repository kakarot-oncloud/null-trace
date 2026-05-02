import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppLock } from '@/context/AppLockContext';
import { useBrowser } from '@/context/BrowserContext';
import { useProfiles } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { useColors } from '@/hooks/useColors';
import { Divider, SectionHeader, SettingsNav, SettingsSelect, SettingsToggle } from '@/components/SettingsRow';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeProfile } = useProfiles();
  const { currentSettings, updateSettings } = useSettings();
  const { clearHistory } = useBrowser();
  const { pinEnabled, biometricEnabled, biometricAvailable, setPIN, disablePIN, enableBiometric, lock } = useAppLock();
  const [pinModal, setPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const profileId = activeProfile?.id ?? '';

  const update = (patch: Parameters<typeof updateSettings>[1]) => {
    updateSettings(profileId, patch);
  };

  const handleSetPin = async () => {
    if (newPin.length < 4) { Alert.alert('Too short', 'PIN must be at least 4 digits.'); return; }
    if (newPin !== confirmPin) { Alert.alert('Mismatch', 'PINs do not match.'); return; }
    await setPIN(newPin);
    setPinModal(false);
    setNewPin('');
    setConfirmPin('');
    Alert.alert('PIN Set', 'App lock is now enabled.');
  };

  const handleDisablePin = () => {
    Alert.alert('Disable App Lock', 'Remove PIN and disable app lock?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Disable', style: 'destructive', onPress: disablePIN },
    ]);
  };

  const handleClearData = () => {
    Alert.alert('Clear Profile Data', 'This will clear all cookies, cache, and history for this profile.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: async () => { await clearHistory(); Alert.alert('Done', 'Profile data cleared.'); } },
    ]);
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {activeProfile && (
          <View style={s.profileBanner}>
            <View style={[s.profileDot, { backgroundColor: activeProfile.color }]} />
            <Text style={s.profileLabel}>Settings for: <Text style={{ color: activeProfile.color }}>{activeProfile.name}</Text></Text>
          </View>
        )}

        {/* General */}
        <SectionHeader title="General" />
        <View style={s.section}>
          <SettingsToggle
            icon="code-slash-outline"
            title="JavaScript"
            description="Enable JavaScript on all pages"
            value={currentSettings.javascriptEnabled}
            onValueChange={(v) => update({ javascriptEnabled: v })}
          />
          <Divider />
          <SettingsToggle
            icon="server-outline"
            title="DOM Storage"
            description="Allow sites to use localStorage and IndexedDB"
            value={currentSettings.domStorageEnabled}
            onValueChange={(v) => update({ domStorageEnabled: v })}
          />
          <Divider />
          <SettingsToggle
            icon="lock-open-outline"
            iconColor={colors.success}
            title="HTTPS-First Mode"
            description="Automatically upgrade connections to HTTPS"
            value={currentSettings.httpsFirstMode}
            onValueChange={(v) => update({ httpsFirstMode: v })}
          />
        </View>


        {/* Privacy */}
        <SectionHeader title="Privacy" />
        <View style={s.section}>
          <SettingsToggle
            icon="ban-outline"
            iconColor="#F85149"
            title="Ad Blocker"
            description="Block common ad networks and trackers"
            value={currentSettings.adBlockerEnabled}
            onValueChange={(v) => update({ adBlockerEnabled: v })}
          />
          <Divider />
          <SettingsToggle
            icon="eye-off-outline"
            iconColor="#F85149"
            title="Tracker Blocking"
            description="Block analytics and user tracking scripts"
            value={currentSettings.trackerBlockingEnabled}
            onValueChange={(v) => update({ trackerBlockingEnabled: v })}
          />
          <Divider />
          <SettingsToggle
            icon="hand-right-outline"
            title="Do Not Track"
            description="Send DNT header with every request"
            value={currentSettings.dntEnabled}
            onValueChange={(v) => update({ dntEnabled: v })}
          />
          <Divider />
          <SettingsToggle
            icon="cookie-outline"
            title="Cookies"
            description="Allow sites to store cookies"
            value={currentSettings.cookiesEnabled}
            onValueChange={(v) => update({ cookiesEnabled: v })}
          />
          <Divider />
          <SettingsToggle
            icon="link-outline"
            title="Block Third-Party Cookies"
            description="Only allow cookies from the visited site"
            value={currentSettings.blockThirdPartyCookies}
            onValueChange={(v) => update({ blockThirdPartyCookies: v })}
          />
          <Divider />
          <SettingsSelect
            icon="arrow-back-outline"
            title="Referrer Policy"
            description="Controls what referrer header is sent"
            value={currentSettings.referrerPolicy}
            options={[
              { id: 'default', label: 'Default' },
              { id: 'same-origin', label: 'Same-origin' },
              { id: 'no-referrer', label: 'No referrer' },
            ]}
            onSelect={(v) => update({ referrerPolicy: v as any })}
          />
          <Divider />
          <SettingsToggle
            icon="videocam-off-outline"
            iconColor="#D29922"
            title="Disable WebRTC"
            description="Prevent IP leaks via WebRTC connections"
            value={!currentSettings.webrtcEnabled}
            onValueChange={(v) => update({ webrtcEnabled: !v })}
          />
        </View>

        {/* Permissions */}
        <SectionHeader title="Site Permissions" />
        <View style={s.section}>
          <SettingsSelect
            icon="camera-outline"
            title="Camera"
            value={currentSettings.cameraPermission}
            options={[{ id: 'ask', label: 'Ask' }, { id: 'allow', label: 'Allow' }, { id: 'block', label: 'Block' }]}
            onSelect={(v) => update({ cameraPermission: v as any })}
          />
          <Divider />
          <SettingsSelect
            icon="mic-outline"
            title="Microphone"
            value={currentSettings.microphonePermission}
            options={[{ id: 'ask', label: 'Ask' }, { id: 'allow', label: 'Allow' }, { id: 'block', label: 'Block' }]}
            onSelect={(v) => update({ microphonePermission: v as any })}
          />
          <Divider />
          <SettingsSelect
            icon="location-outline"
            title="Location"
            value={currentSettings.locationPermission}
            options={[{ id: 'ask', label: 'Ask' }, { id: 'allow', label: 'Allow' }, { id: 'block', label: 'Block' }]}
            onSelect={(v) => update({ locationPermission: v as any })}
          />
        </View>

        {/* Clear on Exit */}
        <SectionHeader title="Clear on Exit" />
        <View style={s.section}>
          <SettingsToggle
            icon="trash-outline"
            title="Clear Cookies on Exit"
            value={currentSettings.clearCookiesOnExit}
            onValueChange={(v) => update({ clearCookiesOnExit: v })}
          />
          <Divider />
          <SettingsToggle
            icon="trash-outline"
            title="Clear Cache on Exit"
            value={currentSettings.clearCacheOnExit}
            onValueChange={(v) => update({ clearCacheOnExit: v })}
          />
          <Divider />
          <SettingsToggle
            icon="trash-outline"
            title="Clear History on Exit"
            value={currentSettings.clearHistoryOnExit}
            onValueChange={(v) => update({ clearHistoryOnExit: v })}
          />
        </View>

        {/* Performance */}
        <SectionHeader title="Performance" />
        <View style={s.section}>
          <SettingsToggle
            icon="pause-circle-outline"
            title="Pause Inactive Tabs"
            description="Reduce resource usage of background tabs"
            value={currentSettings.pauseInactiveTabs}
            onValueChange={(v) => update({ pauseInactiveTabs: v })}
          />
        </View>

        {/* Security */}
        <SectionHeader title="Security" />
        <View style={s.section}>
          <SettingsNav
            icon="lock-closed-outline"
            iconColor={colors.success}
            title={pinEnabled ? 'Change / Disable PIN' : 'Set App PIN'}
            description={pinEnabled ? 'App lock is enabled' : 'Lock the app with a PIN'}
            onPress={() => pinEnabled ? handleDisablePin() : setPinModal(true)}
          />
          <Divider />
          {Platform.OS !== 'web' && biometricAvailable && (
            <>
              <SettingsToggle
                icon="finger-print-outline"
                iconColor={colors.primary}
                title="Biometric Unlock"
                description="Use fingerprint or face to unlock"
                value={biometricEnabled}
                onValueChange={enableBiometric}
                disabled={!pinEnabled}
              />
              <Divider />
            </>
          )}
          <SettingsNav
            icon="lock-closed"
            title="Lock App Now"
            onPress={() => lock()}
            disabled={!pinEnabled}
          />
          <Divider />
          <SettingsNav
            icon="trash-outline"
            iconColor={colors.destructive}
            title="Clear Profile Data"
            description="Remove cookies, cache, and history"
            onPress={handleClearData}
            destructive
          />
        </View>

        <SectionHeader title="About" />
        <View style={s.section}>
          <SettingsNav
            icon="information-circle-outline"
            title="WebView Limitations"
            description="This browser uses Android/iOS WebView. True fingerprint spoofing, canvas fingerprinting, and cross-process proxy isolation are not available."
            onPress={() => Alert.alert('WebView Limitations', 'This browser is built on the system WebView (Chromium). It cannot:\n\n• Modify TLS fingerprints\n• Spoof Canvas/WebGL signals\n• Route traffic via proxy at the OS level without VPN\n• Achieve browser undetectability\n\nThese are inherent WebView limitations.')}
          />
        </View>
      </ScrollView>

      <Modal visible={pinModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Set App PIN</Text>
              <TouchableOpacity onPress={() => { setPinModal(false); setNewPin(''); setConfirmPin(''); }}>
                <Ionicons name="close" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <View style={s.modalContent}>
              <Text style={s.fieldLabel}>New PIN (min 4 digits)</Text>
              <TextInput
                style={s.input}
                value={newPin}
                onChangeText={setNewPin}
                placeholder="Enter PIN"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
              />
              <Text style={[s.fieldLabel, { marginTop: 12 }]}>Confirm PIN</Text>
              <TextInput
                style={s.input}
                value={confirmPin}
                onChangeText={setConfirmPin}
                placeholder="Confirm PIN"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
              />
              <TouchableOpacity style={[s.setBtn, { backgroundColor: colors.primary }]} onPress={handleSetPin}>
                <Text style={[s.setBtnText, { color: colors.primaryForeground }]}>Set PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    profileBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    profileDot: { width: 10, height: 10, borderRadius: 5 },
    profileLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    section: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden', marginHorizontal: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: 17, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    modalContent: { padding: 20 },
    fieldLabel: { fontSize: 12, fontWeight: '600' as const, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    input: { backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12, fontSize: 15, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    setBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
    setBtnText: { fontSize: 16, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold' },
  });
