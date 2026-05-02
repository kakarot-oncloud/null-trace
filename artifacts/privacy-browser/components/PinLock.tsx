import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppLock } from '@/context/AppLockContext';
import { useColors } from '@/hooks/useColors';

const PIN_LENGTH = 6;

export function PinLock() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { unlock, biometricEnabled, biometricAvailable } = useAppLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeX = useSharedValue(0);

  const shake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-14, { duration: 55 }),
      withTiming(14, { duration: 55 }),
      withTiming(-10, { duration: 55 }),
      withTiming(10, { duration: 55 }),
      withTiming(0, { duration: 55 }),
    );
  }, [shakeX]);

  const tryBiometric = useCallback(async () => {
    if (Platform.OS === 'web') return;
    await unlock();
  }, [unlock]);

  useEffect(() => {
    if (biometricEnabled && biometricAvailable) {
      tryBiometric();
    }
  }, [biometricEnabled, biometricAvailable, tryBiometric]);

  const handleDigit = useCallback(
    async (digit: string) => {
      if (pin.length >= PIN_LENGTH) return;
      const newPin = pin + digit;
      setPin(newPin);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (newPin.length === PIN_LENGTH) {
        const ok = await unlock(newPin);
        if (!ok) {
          setError('Incorrect PIN. Try again.');
          shake();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setTimeout(() => {
            setPin('');
            setError('');
          }, 900);
        }
      }
    },
    [pin, unlock, shake],
  );

  const handleDelete = useCallback(() => {
    if (pin.length === 0) return;
    setPin((p) => p.slice(0, -1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [pin]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const s = styles(colors);

  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['bio', '0', 'del'],
  ];

  return (
    <View style={[s.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}>
      {/* Logo area */}
      <View style={s.logoWrap}>
        <View style={[s.logoCircle, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="shield-checkmark" size={38} color={colors.primary} />
        </View>
        <Text style={s.title}>Privacy Browser</Text>
        <Text style={s.subtitle}>Enter your PIN to unlock</Text>
      </View>

      {/* PIN dots */}
      <Animated.View style={[s.dotsRow, shakeStyle]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor: i < pin.length ? colors.primary : 'transparent',
                borderColor: i < pin.length ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </Animated.View>

      {error ? (
        <Text style={s.error}>{error}</Text>
      ) : (
        <View style={{ height: 20 }} />
      )}

      {/* Keypad */}
      <View style={s.keypad}>
        {keypad.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map((key) => {
              if (key === 'bio') {
                const canUse = biometricEnabled && biometricAvailable && Platform.OS !== 'web';
                return (
                  <TouchableOpacity
                    key="bio"
                    style={[s.key, s.keySpecial, !canUse && { opacity: 0 }]}
                    onPress={tryBiometric}
                    disabled={!canUse}
                  >
                    <Ionicons name="finger-print" size={30} color={colors.primary} />
                  </TouchableOpacity>
                );
              }
              if (key === 'del') {
                return (
                  <TouchableOpacity key="del" style={[s.key, s.keySpecial]} onPress={handleDelete}>
                    <Ionicons name="backspace-outline" size={26} color={colors.foreground} />
                  </TouchableOpacity>
                );
              }
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [s.key, pressed && { backgroundColor: colors.secondary, opacity: 0.8 }]}
                  onPress={() => handleDigit(key)}
                >
                  <Text style={s.keyText}>{key}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    logoWrap: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    dotsRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 12,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
    },
    error: {
      fontSize: 14,
      color: colors.destructive,
      fontFamily: 'Inter_500Medium',
      height: 20,
    },
    keypad: {
      marginTop: 36,
      width: '100%',
      maxWidth: 320,
      gap: 14,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 14,
    },
    key: {
      flex: 1,
      height: 70,
      borderRadius: 18,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    keySpecial: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    keyText: {
      fontSize: 26,
      fontWeight: '300' as const,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
  });
