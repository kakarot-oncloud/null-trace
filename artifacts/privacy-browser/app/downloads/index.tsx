import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
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
import { useDownloads } from '@/context/DownloadsContext';
import { useProfiles } from '@/context/ProfileContext';
import { useColors } from '@/hooks/useColors';
import { type Download } from '@/types';

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DownloadsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { downloads, addDownload, updateDownload, removeDownload, clearCompleted } = useDownloads();
  const { activeProfile } = useProfiles();
  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  // Process pending downloads
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const pending = downloads.filter((d) => d.status === 'pending');
    pending.forEach(async (d) => {
      const docDir = (FileSystem as any).documentDirectory as string | null;
      if (!docDir) return;
      const dest = docDir + d.filename;
      await updateDownload(d.id, { status: 'downloading', progress: 0 });
      try {
        const downloadRes = FileSystem.createDownloadResumable(d.url, dest, {}, (prog) => {
          const progress = prog.totalBytesWritten / (prog.totalBytesExpectedToWrite || 1);
          updateDownload(d.id, { progress });
        });
        const result = await downloadRes.downloadAsync();
        if (result) {
          await updateDownload(d.id, { status: 'completed', progress: 1, localPath: result.uri });
        } else {
          await updateDownload(d.id, { status: 'failed', error: 'Download failed' });
        }
      } catch (e: any) {
        await updateDownload(d.id, { status: 'failed', error: e.message ?? 'Unknown error' });
      }
    });
  }, []);

  const handleOpen = async (d: Download) => {
    if (d.localPath && Platform.OS !== 'web') {
      await Linking.openURL(d.localPath);
    }
  };

  const handleShare = async (d: Download) => {
    if (!d.localPath || Platform.OS === 'web') return;
    try {
      const Sharing = require('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(d.localPath);
      }
    } catch {
      Alert.alert('Cannot share', 'Sharing is not available on this device.');
    }
  };

  const handleDelete = (d: Download) => {
    Alert.alert('Remove Download', `Remove "${d.filename}" from the list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeDownload(d.id) },
    ]);
  };

  const statusIcon = (status: Download['status']) => {
    switch (status) {
      case 'completed': return { name: 'checkmark-circle', color: colors.success };
      case 'failed': return { name: 'close-circle', color: colors.destructive };
      case 'downloading': return { name: 'cloud-download', color: colors.primary };
      default: return { name: 'hourglass-outline', color: colors.mutedForeground };
    }
  };

  const renderItem = ({ item }: { item: Download }) => {
    const icon = statusIcon(item.status);
    return (
      <Pressable
        style={({ pressed }) => [s.row, pressed && s.pressed]}
        onPress={() => item.status === 'completed' && handleOpen(item)}
      >
        <Ionicons name={icon.name as any} size={28} color={icon.color} />
        <View style={s.info}>
          <Text style={s.filename} numberOfLines={1}>{item.filename}</Text>
          <Text style={s.meta}>
            {item.status === 'downloading'
              ? `${Math.round(item.progress * 100)}%`
              : item.status === 'failed'
              ? item.error ?? 'Failed'
              : item.status === 'completed'
              ? `Completed · ${formatSize(item.size)}`
              : 'Waiting...'}
          </Text>
          {item.status === 'downloading' && (
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${item.progress * 100}%` as any, backgroundColor: colors.primary }]} />
            </View>
          )}
        </View>
        <View style={s.actions}>
          {item.status === 'completed' && Platform.OS !== 'web' && (
            <TouchableOpacity onPress={() => handleShare(item)} style={s.actionBtn}>
              <Ionicons name="share-outline" size={18} color={colors.foreground} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDelete(item)} style={s.actionBtn}>
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Downloads</Text>
        {downloads.some((d) => d.status === 'completed') ? (
          <TouchableOpacity onPress={clearCompleted} style={s.backBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {Platform.OS === 'web' && (
        <View style={s.notice}>
          <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
          <Text style={s.noticeText}>Downloads are fully functional on Android devices. Use Expo Go on your device to test.</Text>
        </View>
      )}

      <FlatList
        data={downloads}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="cloud-download-outline" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No downloads</Text>
            <Text style={s.emptySubtitle}>Files you download while browsing will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    notice: { flexDirection: 'row', gap: 8, backgroundColor: colors.warning + '15', borderRadius: 10, margin: 16, padding: 12, alignItems: 'flex-start' },
    noticeText: { flex: 1, fontSize: 12, color: colors.warning, fontFamily: 'Inter_400Regular', lineHeight: 18 },
    listContent: { paddingVertical: 4 },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    pressed: { backgroundColor: colors.secondary },
    info: { flex: 1 },
    filename: { fontSize: 14, fontWeight: '500' as const, color: colors.foreground, fontFamily: 'Inter_500Medium' },
    meta: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 3 },
    progressTrack: { height: 3, backgroundColor: colors.muted, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
    progressFill: { height: 3, borderRadius: 2 },
    actions: { flexDirection: 'row', gap: 4 },
    actionBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    empty: { alignItems: 'center', paddingTop: 80, gap: 10, paddingHorizontal: 40 },
    emptyText: { fontSize: 16, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    emptySubtitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  });
