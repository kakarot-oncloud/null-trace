import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  loadingProgress: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isSecure: boolean;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onStop: () => void;
}

function formatDisplayUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    return host + (u.pathname !== '/' ? u.pathname : '');
  } catch {
    return url;
  }
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return 'https://www.google.com';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.includes('.') && !trimmed.includes(' ')) return 'https://' + trimmed;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export function AddressBar({
  url,
  isLoading,
  loadingProgress,
  canGoBack,
  canGoForward,
  isSecure,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onStop,
}: AddressBarProps) {
  const colors = useColors();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(loadingProgress, { duration: 200 });
  }, [loadingProgress, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%` as any,
    opacity: isLoading ? 1 : withTiming(0, { duration: 500 }),
  }));

  const handleFocus = useCallback(() => {
    setEditing(true);
    setInputValue(
      url.startsWith('https://www.google.com/search?q=')
        ? decodeURIComponent(url.split('q=')[1] ?? '')
        : url,
    );
    setTimeout(() => inputRef.current?.selectAll?.(), 50);
  }, [url]);

  const handleBlur = useCallback(() => {
    setEditing(false);
  }, []);

  const handleSubmit = useCallback(() => {
    const normalized = normalizeUrl(inputValue);
    onNavigate(normalized);
    setEditing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [inputValue, onNavigate]);

  const s = styles(colors);
  const isHome = url === 'about:blank' || url === '' || url === 'https://www.google.com';

  return (
    <View style={s.wrapper}>
      {/* Back / Forward */}
      <TouchableOpacity
        style={[s.sideBtn, !canGoBack && s.btnDisabled]}
        onPress={onGoBack}
        disabled={!canGoBack}
      >
        <Ionicons name="chevron-back" size={24} color={canGoBack ? colors.foreground : colors.mutedForeground} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.sideBtn, !canGoForward && s.btnDisabled]}
        onPress={onGoForward}
        disabled={!canGoForward}
      >
        <Ionicons name="chevron-forward" size={24} color={canGoForward ? colors.foreground : colors.mutedForeground} />
      </TouchableOpacity>

      {/* URL pill */}
      <Pressable style={[s.urlPill, editing && s.urlPillFocused]} onPress={() => inputRef.current?.focus()}>
        {editing ? (
          <TextInput
            ref={inputRef}
            style={s.urlInput}
            value={inputValue}
            onChangeText={setInputValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            selectTextOnFocus
            placeholderTextColor={colors.mutedForeground}
            placeholder="Search or enter address"
          />
        ) : (
          <View style={s.urlDisplay}>
            {!isHome && (
              <Ionicons
                name={isSecure ? 'lock-closed' : 'warning-outline'}
                size={11}
                color={isSecure ? colors.success : colors.warning}
                style={s.lockIcon}
              />
            )}
            {isHome ? (
              <Ionicons name="search" size={13} color={colors.mutedForeground} style={s.lockIcon} />
            ) : null}
            <Text style={s.urlText} numberOfLines={1}>
              {isHome ? 'Search or enter address' : formatDisplayUrl(url)}
            </Text>
          </View>
        )}
        <Animated.View style={[s.progressBar, progressStyle]} />
      </Pressable>

      {/* Reload / Stop */}
      <TouchableOpacity style={s.sideBtn} onPress={isLoading ? onStop : onReload}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="refresh" size={20} color={colors.foreground} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 6,
      paddingVertical: 8,
      gap: 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    sideBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnDisabled: { opacity: 0.3 },
    urlPill: {
      flex: 1,
      height: 38,
      backgroundColor: colors.card,
      borderRadius: 12,
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    urlPillFocused: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    urlDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    lockIcon: {
      marginRight: 4,
    },
    urlText: {
      fontSize: 14,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      textAlign: 'center',
      flexShrink: 1,
    },
    urlInput: {
      fontSize: 14,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      paddingHorizontal: 12,
      textAlign: 'center',
    },
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 2,
      backgroundColor: colors.primary,
      borderRadius: 1,
    },
  });
