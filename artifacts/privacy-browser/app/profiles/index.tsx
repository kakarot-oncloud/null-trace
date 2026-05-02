import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBrowser } from '@/context/BrowserContext';
import { useProfiles } from '@/context/ProfileContext';
import { useSettings } from '@/context/SettingsContext';
import { useColors } from '@/hooks/useColors';
import { type Profile } from '@/types';

export default function ProfilesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profiles, activeProfile, setActiveProfile, deleteProfile, createProfile } = useProfiles();
  const { loadProfile } = useBrowser();
  const { setCurrentProfileId } = useSettings();

  const handleSelect = async (profile: Profile) => {
    await setActiveProfile(profile.id);
    await loadProfile(profile.id);
    setCurrentProfileId(profile.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDelete = (profile: Profile) => {
    if (profiles.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one profile.');
      return;
    }
    Alert.alert(
      'Delete Profile',
      `Delete "${profile.name}"? This will remove all associated tabs and history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProfile(profile.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ],
    );
  };

  const handleCreate = async () => {
    const profile = await createProfile({ name: 'New Profile' });
    router.push(`/profiles/${profile.id}`);
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Profiles</Text>
        <TouchableOpacity onPress={handleCreate} style={s.addBtn}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={profiles}
        keyExtractor={(p) => p.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const isActive = item.id === activeProfile?.id;
          return (
            <Pressable
              style={({ pressed }) => [s.profileCard, isActive && s.profileCardActive, pressed && s.pressed]}
              onPress={() => handleSelect(item)}
            >
              <View style={[s.profileAvatar, { backgroundColor: item.color }]}>
                <Text style={s.avatarLetter}>{item.name[0]?.toUpperCase()}</Text>
              </View>
              <View style={s.profileInfo}>
                <Text style={s.profileName}>{item.name}</Text>
                <Text style={s.profileMeta}>
                  {item.language} · {item.timezone}
                  {item.proxyId ? ' · Proxy enabled' : ''}
                </Text>
              </View>
              <View style={s.profileActions}>
                {isActive && (
                  <View style={[s.activeBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[s.activeText, { color: colors.primary }]}>Active</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => router.push(`/profiles/${item.id}`)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={s.editBtn}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
                {!isActive && (
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={s.editBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                  </TouchableOpacity>
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="person-circle-outline" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No profiles yet</Text>
          </View>
        }
      />
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
    addBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    list: { padding: 16, gap: 10 },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 14,
    },
    profileCardActive: { borderColor: colors.primary, borderWidth: 2 },
    pressed: { opacity: 0.7 },
    profileAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: '#fff',
      fontFamily: 'Inter_700Bold',
    },
    profileInfo: { flex: 1 },
    profileName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    profileMeta: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginTop: 2,
    },
    profileActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    activeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    activeText: { fontSize: 11, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold' },
    editBtn: { padding: 4 },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 15, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
  });
