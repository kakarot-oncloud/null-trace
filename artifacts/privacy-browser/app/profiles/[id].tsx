import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { useProfiles } from '@/context/ProfileContext';
import { useColors } from '@/hooks/useColors';
import { PROFILE_COLORS, type Profile, type ProxyConfig } from '@/types';
import { COMMON_LANGUAGES, COMMON_TIMEZONES, USER_AGENTS } from '@/constants/userAgents';

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profiles, proxies, updateProfile, createProfile } = useProfiles();

  const existing = profiles.find((p) => p.id === id);
  const [name, setName] = useState(existing?.name ?? 'New Profile');
  const [color, setColor] = useState(existing?.color ?? PROFILE_COLORS[0]);
  const [userAgent, setUserAgent] = useState(existing?.userAgent ?? USER_AGENTS[0].value);
  const [language, setLanguage] = useState(existing?.language ?? 'en-US');
  const [timezone, setTimezone] = useState(existing?.timezone ?? 'UTC');
  const [proxyId, setProxyId] = useState<string | null>(existing?.proxyId ?? null);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a profile name.');
      return;
    }
    const data: Partial<Profile> = { name: name.trim(), color, userAgent, language, timezone, proxyId };
    if (existing) {
      await updateProfile(existing.id, data);
    } else {
      await createProfile(data);
    }
    router.back();
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const selectedUA = USER_AGENTS.find((u) => u.value === userAgent);
  const selectedLang = COMMON_LANGUAGES.find((l) => l.id === language);
  const selectedTZ = COMMON_TIMEZONES.find((t) => t.id === timezone);
  const selectedProxy = proxies.find((p) => p.id === proxyId);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{existing ? 'Edit Profile' : 'New Profile'}</Text>
        <TouchableOpacity onPress={handleSave} style={s.saveBtn}>
          <Text style={[s.saveText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Avatar preview */}
        <View style={s.avatarPreview}>
          <View style={[s.avatarLarge, { backgroundColor: color }]}>
            <Text style={s.avatarLetter}>{name[0]?.toUpperCase() ?? '?'}</Text>
          </View>
        </View>

        {/* Name */}
        <View style={s.section}>
          <Text style={s.label}>Profile Name</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="My Profile"
            placeholderTextColor={colors.mutedForeground}
            maxLength={32}
          />
        </View>

        {/* Color */}
        <View style={s.section}>
          <Text style={s.label}>Color</Text>
          <View style={s.colorRow}>
            {PROFILE_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[s.colorSwatch, { backgroundColor: c }, color === c && s.colorSwatchActive]}
              >
                {color === c && <Ionicons name="checkmark" size={14} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* User Agent */}
        <View style={s.section}>
          <Text style={s.label}>User Agent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
            {USER_AGENTS.map((ua) => (
              <TouchableOpacity
                key={ua.id}
                onPress={() => setUserAgent(ua.value)}
                style={[s.chip, userAgent === ua.value && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={[s.chipText, userAgent === ua.value && { color: colors.primaryForeground }]}>
                  {ua.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Language */}
        <View style={s.section}>
          <Text style={s.label}>Language / Locale</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
            {COMMON_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                onPress={() => setLanguage(lang.id)}
                style={[s.chip, language === lang.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={[s.chipText, language === lang.id && { color: colors.primaryForeground }]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Timezone */}
        <View style={s.section}>
          <Text style={s.label}>Timezone</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
            {COMMON_TIMEZONES.map((tz) => (
              <TouchableOpacity
                key={tz.id}
                onPress={() => setTimezone(tz.id)}
                style={[s.chip, timezone === tz.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={[s.chipText, timezone === tz.id && { color: colors.primaryForeground }]}>
                  {tz.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Proxy */}
        <View style={s.section}>
          <Text style={s.label}>Proxy</Text>
          <TouchableOpacity
            style={[s.proxySelector, proxyId && { borderColor: colors.primary }]}
            onPress={() => setProxyId(null)}
          >
            <Ionicons
              name={proxyId ? 'shield-checkmark' : 'globe-outline'}
              size={18}
              color={proxyId ? colors.primary : colors.mutedForeground}
            />
            <Text style={[s.proxySelectorText, { color: proxyId ? colors.primary : colors.mutedForeground }]}>
              {selectedProxy ? selectedProxy.name : 'No proxy (direct connection)'}
            </Text>
          </TouchableOpacity>
          {proxies.length > 0 && (
            <View style={s.proxyList}>
              {proxies.map((proxy) => (
                <TouchableOpacity
                  key={proxy.id}
                  style={[s.proxyOption, proxyId === proxy.id && { borderColor: colors.primary }]}
                  onPress={() => setProxyId(proxy.id)}
                >
                  <Ionicons name="server-outline" size={16} color={proxyId === proxy.id ? colors.primary : colors.mutedForeground} />
                  <Text style={[s.proxyOptionText, proxyId === proxy.id && { color: colors.primary }]}>
                    {proxy.name} ({proxy.type} {proxy.host}:{proxy.port})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    saveBtn: { padding: 4 },
    saveText: { fontSize: 16, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold' },
    content: { padding: 20, gap: 24 },
    avatarPreview: { alignItems: 'center', marginBottom: 8 },
    avatarLarge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    avatarLetter: { fontSize: 28, fontWeight: '700' as const, color: '#fff', fontFamily: 'Inter_700Bold' },
    section: { gap: 10 },
    label: { fontSize: 13, fontWeight: '600' as const, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.6 },
    input: {
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
    colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    colorSwatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorSwatchActive: { borderWidth: 3, borderColor: '#fff' },
    chipScroll: { flexGrow: 0 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
      backgroundColor: colors.card,
    },
    chipText: { fontSize: 13, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    proxySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    proxySelectorText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
    proxyList: { gap: 8, marginTop: 4 },
    proxyOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    proxyOptionText: { fontSize: 13, color: colors.foreground, fontFamily: 'Inter_400Regular', flex: 1 },
  });
