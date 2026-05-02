import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBrowser } from '@/context/BrowserContext';
import { useColors } from '@/hooks/useColors';
import { type BrowserTab } from '@/types';

interface TabSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

export function TabSwitcher({ visible, onClose }: TabSwitcherProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tabs, activeTabId, createTab, closeTab, switchTab } = useBrowser();
  const s = styles(colors);

  const handleSwitch = (id: string) => {
    switchTab(id);
    onClose();
  };

  const handleNewTab = () => {
    createTab();
    onClose();
  };

  const renderTab = ({ item }: { item: BrowserTab }) => {
    const isActive = item.id === activeTabId;
    let domain = item.url;
    try {
      domain = new URL(item.url).hostname.replace(/^www\./, '');
    } catch {}

    return (
      <Pressable
        style={({ pressed }) => [
          s.tabCard,
          isActive && s.tabCardActive,
          pressed && s.tabCardPressed,
        ]}
        onPress={() => handleSwitch(item.id)}
      >
        {/* Close button */}
        <TouchableOpacity
          style={s.closeBtn}
          onPress={() => closeTab(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Favicon placeholder */}
        <View style={[s.favicon, { backgroundColor: isActive ? colors.primary + '18' : colors.muted }]}>
          <Ionicons
            name="globe-outline"
            size={18}
            color={isActive ? colors.primary : colors.mutedForeground}
          />
        </View>

        <Text style={[s.tabTitle, isActive && { color: colors.primary }]} numberOfLines={2}>
          {item.title === 'New Tab' || !item.title ? domain || 'New Tab' : item.title}
        </Text>
        <Text style={s.tabDomain} numberOfLines={1}>{domain}</Text>

        {isActive && <View style={[s.activeLine, { backgroundColor: colors.primary }]} />}
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={s.overlay}>
        <View style={[s.sheet, { paddingBottom: insets.bottom + 8 }]}>
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>{tabs.length} {tabs.length === 1 ? 'Tab' : 'Tabs'}</Text>
            <TouchableOpacity onPress={onClose} style={s.doneBtn}>
              <Text style={[s.doneText, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Tab grid */}
          <FlatList
            data={tabs}
            keyExtractor={(t) => t.id}
            renderItem={renderTab}
            numColumns={2}
            columnWrapperStyle={s.columnWrapper}
            contentContainerStyle={s.listContent}
            scrollEnabled={tabs.length > 4}
            showsVerticalScrollIndicator={false}
          />

          {/* New Tab button */}
          <TouchableOpacity style={[s.newTabBtn, { backgroundColor: colors.primary }]} onPress={handleNewTab}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={s.newTabText}>New Tab</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '88%',
      paddingTop: 8,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    doneBtn: { paddingHorizontal: 4, paddingVertical: 4 },
    doneText: {
      fontSize: 16,
      fontWeight: '600' as const,
      fontFamily: 'Inter_600SemiBold',
    },
    listContent: {
      paddingHorizontal: 14,
      paddingTop: 4,
      paddingBottom: 12,
      gap: 12,
    },
    columnWrapper: { gap: 12 },
    tabCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      minHeight: 120,
      borderWidth: 1.5,
      borderColor: 'transparent',
      overflow: 'hidden',
    },
    tabCardActive: {
      borderColor: colors.primary,
    },
    tabCardPressed: { opacity: 0.75 },
    closeBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    favicon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    tabTitle: {
      fontSize: 13,
      fontWeight: '500' as const,
      color: colors.foreground,
      fontFamily: 'Inter_500Medium',
      lineHeight: 18,
      marginBottom: 4,
    },
    tabDomain: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    activeLine: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      borderRadius: 0,
    },
    newTabBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 8,
      height: 50,
      borderRadius: 16,
    },
    newTabText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#FFFFFF',
      fontFamily: 'Inter_600SemiBold',
    },
  });
