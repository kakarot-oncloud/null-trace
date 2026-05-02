import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useBrowser } from '@/context/BrowserContext';
import { useSettings } from '@/context/SettingsContext';
import { useProfiles } from '@/context/ProfileContext';

interface HomeScreenProps {
  onNavigate: (url: string) => void;
  onFocusSearch: () => void;
}

const QUICK_LINKS = [
  { label: 'Google', url: 'https://www.google.com', icon: 'search' },
  { label: 'YouTube', url: 'https://www.youtube.com', icon: 'logo-youtube' },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'book-outline' },
  { label: 'GitHub', url: 'https://www.github.com', icon: 'logo-github' },
  { label: 'Reddit', url: 'https://www.reddit.com', icon: 'chatbubbles-outline' },
  { label: 'News', url: 'https://news.ycombinator.com', icon: 'newspaper-outline' },
];

export function HomeScreen({ onNavigate, onFocusSearch }: HomeScreenProps) {
  const colors = useColors();
  const { bookmarks, history } = useBrowser();
  const { currentSettings } = useSettings();
  const { activeProfile } = useProfiles();
  const s = styles(colors);

  const recentHistory = history.slice(0, 5);

  const privacyFeatures = [
    { label: 'Ad Blocker', on: currentSettings.adBlockerEnabled, icon: 'ban-outline' },
    { label: 'Tracker Block', on: currentSettings.trackerBlockingEnabled, icon: 'eye-off-outline' },
    { label: 'HTTPS First', on: currentSettings.httpsFirstMode, icon: 'lock-closed-outline' },
    { label: 'No WebRTC', on: !currentSettings.webrtcEnabled, icon: 'wifi-outline' },
  ];

  const activeCount = privacyFeatures.filter((f) => f.on).length;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={s.header}>
        <View style={[s.logoCircle, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
        </View>
        <Text style={s.appName}>Privacy Browser</Text>
        {activeProfile && (
          <View style={[s.profilePill, { backgroundColor: activeProfile.color + '20' }]}>
            <View style={[s.profileDot, { backgroundColor: activeProfile.color }]} />
            <Text style={[s.profileName, { color: activeProfile.color }]}>{activeProfile.name}</Text>
          </View>
        )}
      </View>

      {/* Search bar */}
      <TouchableOpacity style={s.searchBar} onPress={onFocusSearch} activeOpacity={0.8}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <Text style={s.searchPlaceholder}>Search or enter address</Text>
        <View style={[s.goBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Privacy shield card */}
      <View style={[s.shieldCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
        <View style={s.shieldRow}>
          <View style={s.shieldLeft}>
            <Text style={[s.shieldTitle, { color: colors.primary }]}>
              {activeCount === 4 ? 'Fully Protected' : activeCount >= 2 ? 'Partially Protected' : 'Low Protection'}
            </Text>
            <Text style={s.shieldSub}>{activeCount} of 4 shields active</Text>
          </View>
          <View style={[s.shieldBadge, { backgroundColor: activeCount === 4 ? colors.success : activeCount >= 2 ? colors.warning : colors.destructive }]}>
            <Text style={s.shieldBadgeText}>{activeCount}/4</Text>
          </View>
        </View>
        <View style={s.featureGrid}>
          {privacyFeatures.map((f) => (
            <View key={f.label} style={s.featureItem}>
              <Ionicons name={f.icon as any} size={14} color={f.on ? colors.primary : colors.mutedForeground} />
              <Text style={[s.featureLabel, { color: f.on ? colors.foreground : colors.mutedForeground }]}>{f.label}</Text>
              <View style={[s.featureDot, { backgroundColor: f.on ? colors.success : colors.border }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Quick links */}
      <Text style={s.sectionTitle}>Quick Links</Text>
      <View style={s.quickGrid}>
        {QUICK_LINKS.map((link) => (
          <Pressable
            key={link.url}
            style={({ pressed }) => [s.quickItem, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => onNavigate(link.url)}
          >
            <View style={[s.quickIcon, { backgroundColor: colors.card }]}>
              <Ionicons name={link.icon as any} size={22} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recent history */}
      {recentHistory.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Recently Visited</Text>
          <View style={[s.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {recentHistory.map((item, idx) => {
              let domain = item.url;
              try { domain = new URL(item.url).hostname.replace(/^www\./, ''); } catch {}
              return (
                <React.Fragment key={item.id}>
                  <Pressable
                    style={({ pressed }) => [s.recentRow, pressed && { backgroundColor: colors.secondary }]}
                    onPress={() => onNavigate(item.url)}
                  >
                    <View style={[s.recentIcon, { backgroundColor: colors.muted }]}>
                      <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                    </View>
                    <View style={s.recentInfo}>
                      <Text style={s.recentTitle} numberOfLines={1}>{item.title || domain}</Text>
                      <Text style={s.recentUrl} numberOfLines={1}>{domain}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={colors.border} />
                  </Pressable>
                  {idx < recentHistory.length - 1 && (
                    <View style={[s.separator, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Bookmarks</Text>
          <View style={[s.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {bookmarks.slice(0, 5).map((item, idx) => {
              let domain = item.url;
              try { domain = new URL(item.url).hostname.replace(/^www\./, ''); } catch {}
              return (
                <React.Fragment key={item.id}>
                  <Pressable
                    style={({ pressed }) => [s.recentRow, pressed && { backgroundColor: colors.secondary }]}
                    onPress={() => onNavigate(item.url)}
                  >
                    <View style={[s.recentIcon, { backgroundColor: colors.primary + '18' }]}>
                      <Ionicons name="bookmark" size={14} color={colors.primary} />
                    </View>
                    <View style={s.recentInfo}>
                      <Text style={s.recentTitle} numberOfLines={1}>{item.title || domain}</Text>
                      <Text style={s.recentUrl} numberOfLines={1}>{domain}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={colors.border} />
                  </Pressable>
                  {idx < Math.min(bookmarks.length, 5) - 1 && (
                    <View style={[s.separator, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
    header: { alignItems: 'center', marginBottom: 24 },
    logoCircle: {
      width: 68,
      height: 68,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    appName: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      marginBottom: 8,
    },
    profilePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    profileDot: { width: 8, height: 8, borderRadius: 4 },
    profileName: { fontSize: 12, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold' },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 13,
      gap: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchPlaceholder: {
      flex: 1,
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    goBtn: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shieldCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      marginBottom: 24,
    },
    shieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    shieldLeft: {},
    shieldTitle: { fontSize: 15, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
    shieldSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    shieldBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    shieldBadgeText: { fontSize: 13, fontWeight: '700' as const, color: '#FFFFFF', fontFamily: 'Inter_700Bold' },
    featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      flex: 1,
      minWidth: '45%',
    },
    featureLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1 },
    featureDot: { width: 6, height: 6, borderRadius: 3 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    quickGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    quickItem: {
      alignItems: 'center',
      width: '28%',
      gap: 6,
    },
    quickIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickLabel: {
      fontSize: 11,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      textAlign: 'center',
    },
    recentCard: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      marginBottom: 24,
    },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 12,
    },
    recentIcon: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recentInfo: { flex: 1 },
    recentTitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: colors.foreground,
      fontFamily: 'Inter_500Medium',
    },
    recentUrl: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginTop: 1,
    },
    separator: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
  });
