import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface BrowserToolbarProps {
  tabCount: number;
  isBookmarked: boolean;
  profileColor: string;
  profileName: string;
  onBookmark: () => void;
  onShowTabs: () => void;
  onShowProfiles: () => void;
  onShowMenu: () => void;
  onNewTab: () => void;
}

export function BrowserToolbar({
  tabCount,
  isBookmarked,
  profileColor,
  profileName,
  onBookmark,
  onShowTabs,
  onShowProfiles,
  onShowMenu,
  onNewTab,
}: BrowserToolbarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[s.toolbar, { paddingBottom: bottomPad + 4 }]}>
      {/* Bookmark */}
      <Pressable
        style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
        onPress={onBookmark}
      >
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={23}
          color={isBookmarked ? colors.primary : colors.foreground}
        />
      </Pressable>

      {/* New tab */}
      <Pressable style={({ pressed }) => [s.btn, pressed && s.btnPressed]} onPress={onNewTab}>
        <Ionicons name="add" size={26} color={colors.foreground} />
      </Pressable>

      {/* Tab switcher — Safari-style square with count */}
      <Pressable style={({ pressed }) => [s.btn, pressed && s.btnPressed]} onPress={onShowTabs}>
        <View style={s.tabCountBox}>
          <Text style={[s.tabCountText, { color: colors.foreground }]}>
            {tabCount > 99 ? '99+' : tabCount}
          </Text>
        </View>
      </Pressable>

      {/* Profile indicator */}
      <Pressable
        style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
        onPress={onShowProfiles}
      >
        <View style={[s.profileRing, { borderColor: profileColor }]}>
          <View style={[s.profileDot, { backgroundColor: profileColor }]} />
        </View>
      </Pressable>

      {/* Menu */}
      <Pressable style={({ pressed }) => [s.btn, pressed && s.btnPressed]} onPress={onShowMenu}>
        <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: 8,
      paddingHorizontal: 4,
    },
    btn: {
      width: 52,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    btnPressed: {
      backgroundColor: colors.card,
      opacity: 0.7,
    },
    tabCountBox: {
      width: 26,
      height: 26,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: colors.foreground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabCountText: {
      fontSize: 12,
      fontWeight: '700' as const,
      fontFamily: 'Inter_700Bold',
    },
    profileRing: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
  });
