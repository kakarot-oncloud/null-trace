import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';

interface MenuSheetProps {
  visible: boolean;
  onClose: () => void;
  onShare?: () => void;
  onCopyUrl?: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  iconColor?: string;
}

export function MenuSheet({ visible, onClose, onShare, onCopyUrl }: MenuSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = styles(colors);

  const items: MenuItem[] = [
    {
      icon: 'person-circle-outline',
      label: 'Profiles',
      iconColor: colors.primary,
      onPress: () => { onClose(); router.push('/profiles'); },
    },
    {
      icon: 'shield-outline',
      label: 'Proxy Manager',
      iconColor: '#34C759',
      onPress: () => { onClose(); router.push('/proxy'); },
    },
    {
      icon: 'bookmark-outline',
      label: 'Bookmarks & History',
      iconColor: '#FF9500',
      onPress: () => { onClose(); router.push('/bookmarks'); },
    },
    {
      icon: 'cloud-download-outline',
      label: 'Downloads',
      iconColor: '#5E5CE6',
      onPress: () => { onClose(); router.push('/downloads'); },
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      iconColor: colors.mutedForeground,
      onPress: () => { onClose(); router.push('/settings'); },
    },
    ...(onShare
      ? [{ icon: 'share-outline', label: 'Share Page', iconColor: colors.primary, onPress: () => { onClose(); onShare(); } }]
      : []),
    ...(onCopyUrl
      ? [{ icon: 'copy-outline', label: 'Copy URL', iconColor: colors.mutedForeground, onPress: () => { onClose(); onCopyUrl(); } }]
      : []),
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={[s.sheet, { paddingBottom: insets.bottom + 8 }]}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Menu</Text>

          <View style={s.itemsContainer}>
            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                <TouchableOpacity style={s.item} onPress={item.onPress} activeOpacity={0.7}>
                  <View style={[s.iconWrap, { backgroundColor: (item.iconColor ?? colors.primary) + '18' }]}>
                    <Ionicons
                      name={item.icon as any}
                      size={19}
                      color={item.destructive ? colors.destructive : (item.iconColor ?? colors.primary)}
                    />
                  </View>
                  <Text style={[s.label, item.destructive && { color: colors.destructive }]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.border} />
                </TouchableOpacity>
                {idx < items.length - 1 && <View style={s.separator} />}
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
      paddingHorizontal: 16,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 12,
    },
    sheetTitle: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 4,
      marginBottom: 10,
    },
    itemsContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 8,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 14,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: 58,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
  });
