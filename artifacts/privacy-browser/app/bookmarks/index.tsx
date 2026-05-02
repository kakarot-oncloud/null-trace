import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { useColors } from '@/hooks/useColors';
import { type Bookmark, type HistoryEntry } from '@/types';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

export default function BookmarksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookmarks, removeBookmark, history, clearHistory, createTab } = useBrowser();
  const [tab, setTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleOpenUrl = (url: string) => {
    createTab(url);
    router.back();
  };

  const handleDeleteBookmark = (id: string) => {
    removeBookmark(id);
  };

  const handleClearHistory = () => {
    Alert.alert('Clear History', 'Remove all browsing history for this profile?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <Pressable style={({ pressed }) => [s.row, pressed && s.pressed]} onPress={() => handleOpenUrl(item.url)}>
      <View style={[s.favicon, { backgroundColor: colors.muted }]}>
        <Ionicons name="bookmark" size={14} color={colors.primary} />
      </View>
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>{item.title}</Text>
        <Text style={s.url} numberOfLines={1}>{item.url}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteBookmark(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
    </Pressable>
  );

  const renderHistory = ({ item }: { item: HistoryEntry }) => (
    <Pressable style={({ pressed }) => [s.row, pressed && s.pressed]} onPress={() => handleOpenUrl(item.url)}>
      <View style={[s.favicon, { backgroundColor: colors.muted }]}>
        <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
      </View>
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>{item.title}</Text>
        <Text style={s.url} numberOfLines={1}>{item.url}</Text>
      </View>
      <Text style={s.time}>{formatTime(item.visitedAt)}</Text>
    </Pressable>
  );

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{tab === 'bookmarks' ? 'Bookmarks' : 'History'}</Text>
        {tab === 'history' ? (
          <TouchableOpacity onPress={handleClearHistory} style={s.actionBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tabBtn, tab === 'bookmarks' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('bookmarks')}
        >
          <Text style={[s.tabText, tab === 'bookmarks' && { color: colors.primary }]}>Bookmarks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, tab === 'history' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('history')}
        >
          <Text style={[s.tabText, tab === 'history' && { color: colors.primary }]}>History</Text>
        </TouchableOpacity>
      </View>

      {tab === 'bookmarks' ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(b) => b.id}
          renderItem={renderBookmark}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="bookmark-outline" size={48} color={colors.mutedForeground} />
              <Text style={s.emptyText}>No bookmarks yet</Text>
              <Text style={s.emptySubtitle}>Tap the bookmark icon while browsing to save pages</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(h) => h.id}
          renderItem={renderHistory}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="time-outline" size={48} color={colors.mutedForeground} />
              <Text style={s.emptyText}>No browsing history</Text>
              <Text style={s.emptySubtitle}>Visited pages will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    actionBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
    tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabText: { fontSize: 15, fontWeight: '500' as const, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' },
    listContent: { paddingVertical: 4 },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    pressed: { backgroundColor: colors.secondary },
    favicon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    title: { fontSize: 14, fontWeight: '500' as const, color: colors.foreground, fontFamily: 'Inter_500Medium' },
    url: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    time: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    empty: { alignItems: 'center', paddingTop: 80, gap: 10, paddingHorizontal: 40 },
    emptyText: { fontSize: 16, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    emptySubtitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  });
