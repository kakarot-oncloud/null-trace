import React from 'react';
import { Pressable, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface SettingsToggleProps {
  icon?: string;
  iconColor?: string;
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggle({
  icon,
  iconColor,
  title,
  description,
  value,
  onValueChange,
  disabled,
}: SettingsToggleProps) {
  const colors = useColors();
  const s = styles(colors);
  return (
    <View style={s.row}>
      {icon && (
        <View style={[s.iconBg, { backgroundColor: (iconColor ?? colors.primary) + '20' }]}>
          <Ionicons name={icon as any} size={18} color={iconColor ?? colors.primary} />
        </View>
      )}
      <View style={s.info}>
        <Text style={s.title}>{title}</Text>
        {description && <Text style={s.desc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.muted, true: colors.primary }}
        thumbColor={colors.primaryForeground}
        disabled={disabled}
        ios_backgroundColor={colors.muted}
      />
    </View>
  );
}

interface SettingsSelectProps {
  icon?: string;
  iconColor?: string;
  title: string;
  description?: string;
  value: string;
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
}

export function SettingsSelect({
  icon,
  iconColor,
  title,
  description,
  value,
  options,
  onSelect,
}: SettingsSelectProps) {
  const colors = useColors();
  const s = styles(colors);
  const selectedLabel = options.find((o) => o.id === value)?.label ?? value;

  return (
    <View style={s.selectContainer}>
      <View style={s.row}>
        {icon && (
          <View style={[s.iconBg, { backgroundColor: (iconColor ?? colors.primary) + '20' }]}>
            <Ionicons name={icon as any} size={18} color={iconColor ?? colors.primary} />
          </View>
        )}
        <View style={s.info}>
          <Text style={s.title}>{title}</Text>
          {description && <Text style={s.desc}>{description}</Text>}
        </View>
        <Text style={[s.desc, { color: colors.primary }]}>{selectedLabel}</Text>
      </View>
      <View style={s.optionsRow}>
        {options.map((opt) => (
          <Pressable
            key={opt.id}
            style={[s.optionBtn, value === opt.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => onSelect(opt.id)}
          >
            <Text style={[s.optionText, value === opt.id && { color: colors.primaryForeground }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface SettingsNavProps {
  icon?: string;
  iconColor?: string;
  title: string;
  description?: string;
  badge?: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function SettingsNav({
  icon,
  iconColor,
  title,
  description,
  badge,
  onPress,
  destructive,
  disabled,
}: SettingsNavProps) {
  const colors = useColors();
  const s = styles(colors);
  return (
    <TouchableOpacity style={[s.row, disabled && { opacity: 0.4 }]} onPress={disabled ? undefined : onPress} activeOpacity={0.7}>
      {icon && (
        <View style={[s.iconBg, { backgroundColor: (iconColor ?? colors.primary) + '20' }]}>
          <Ionicons name={icon as any} size={18} color={destructive ? colors.destructive : (iconColor ?? colors.primary)} />
        </View>
      )}
      <View style={s.info}>
        <Text style={[s.title, destructive && { color: colors.destructive }]}>{title}</Text>
        {description && <Text style={s.desc}>{description}</Text>}
      </View>
      {badge && (
        <Text style={[s.desc, { color: colors.mutedForeground, marginRight: 6 }]}>{badge}</Text>
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={{
      fontSize: 12,
      fontWeight: '600' as const,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 8,
    }}>
      {title}
    </Text>
  );
}

export function Divider() {
  const colors = useColors();
  return <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginLeft: 56 }} />;
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 13,
      gap: 12,
      backgroundColor: colors.card,
    },
    iconBg: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1 },
    title: {
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
    desc: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginTop: 2,
    },
    selectContainer: {
      backgroundColor: colors.card,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    optionBtn: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionText: {
      fontSize: 13,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
  });
