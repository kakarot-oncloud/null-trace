import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
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
import { type ProxyConfig } from '@/types';

async function testProxy(proxy: ProxyConfig): Promise<{ ip: string; country: string; latency: number } | null> {
  const start = Date.now();
  try {
    const res = await fetch('https://ip-api.com/json', { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const latency = Date.now() - start;
    return { ip: data.query, country: data.country, latency };
  } catch {
    return null;
  }
}

function parseProxyInput(input: string, type: ProxyConfig['type']): Partial<ProxyConfig> | null {
  const trimmed = input.trim();
  const withCreds = /^(.+):(.+)@(.+):(\d+)$/.exec(trimmed);
  if (withCreds) {
    return { username: withCreds[1], password: withCreds[2], host: withCreds[3], port: parseInt(withCreds[4], 10), type };
  }
  const basic = /^(.+):(\d+)$/.exec(trimmed);
  if (basic) {
    return { host: basic[1], port: parseInt(basic[2], 10), type, username: '', password: '' };
  }
  return null;
}

export default function ProxyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { proxies, createProxy, deleteProxy } = useProfiles();
  const [modalVisible, setModalVisible] = useState(false);
  const [proxyInput, setProxyInput] = useState('');
  const [proxyName, setProxyName] = useState('');
  const [proxyType, setProxyType] = useState<ProxyConfig['type']>('HTTP');
  const [testResults, setTestResults] = useState<Record<string, { ip: string; country: string; latency: number } | 'testing' | 'failed'>>({});

  const handleAdd = async () => {
    const parsed = parseProxyInput(proxyInput, proxyType);
    if (!parsed) {
      Alert.alert('Invalid Format', 'Use: IP:PORT or USER:PASS@IP:PORT');
      return;
    }
    await createProxy({
      name: proxyName.trim() || `${parsed.host}:${parsed.port}`,
      type: proxyType,
      host: parsed.host ?? '',
      port: parsed.port ?? 0,
      username: parsed.username ?? '',
      password: parsed.password ?? '',
    });
    setModalVisible(false);
    setProxyInput('');
    setProxyName('');
  };

  const handleTest = async (proxy: ProxyConfig) => {
    setTestResults((prev) => ({ ...prev, [proxy.id]: 'testing' }));
    const result = await testProxy(proxy);
    setTestResults((prev) => ({ ...prev, [proxy.id]: result ?? 'failed' }));
  };

  const handleDelete = (proxy: ProxyConfig) => {
    Alert.alert('Delete Proxy', `Remove "${proxy.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProxy(proxy.id) },
    ]);
  };

  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Proxy Manager</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={s.addBtn}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={s.notice}>
        <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
        <Text style={s.noticeText}>
          Proxy settings are stored per profile. Full proxy routing requires VPN integration for complete traffic routing.
        </Text>
      </View>

      <FlatList
        data={proxies}
        keyExtractor={(p) => p.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const result = testResults[item.id];
          return (
            <View style={s.proxyCard}>
              <View style={s.proxyHeader}>
                <View style={[s.typeBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[s.typeText, { color: colors.primary }]}>{item.type}</Text>
                </View>
                <Text style={s.proxyName}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleDelete(item)} style={s.iconBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
              <Text style={s.proxyAddr}>
                {item.username ? `${item.username}:***@` : ''}{item.host}:{item.port}
              </Text>
              <View style={s.proxyFooter}>
                {result === 'testing' ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : result && result !== 'failed' ? (
                  <Text style={[s.testResult, { color: colors.success }]}>
                    {result.ip} · {result.country} · {result.latency}ms
                  </Text>
                ) : result === 'failed' ? (
                  <Text style={[s.testResult, { color: colors.destructive }]}>Connection failed</Text>
                ) : null}
                <TouchableOpacity style={s.testBtn} onPress={() => handleTest(item)}>
                  <Ionicons name="pulse-outline" size={14} color={colors.primary} />
                  <Text style={[s.testBtnText, { color: colors.primary }]}>Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="server-outline" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyTitle}>No proxies configured</Text>
            <Text style={s.emptySubtitle}>Add a proxy to route browser traffic</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Proxy</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={s.modalContent}>
              <Text style={s.fieldLabel}>Name (optional)</Text>
              <TextInput
                style={s.input}
                value={proxyName}
                onChangeText={setProxyName}
                placeholder="My Proxy"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={s.fieldLabel}>Type</Text>
              <View style={s.typeRow}>
                {(['HTTP', 'HTTPS', 'SOCKS5'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[s.typeBtn, proxyType === t && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    onPress={() => setProxyType(t)}
                  >
                    <Text style={[s.typeBtnText, proxyType === t && { color: colors.primaryForeground }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.fieldLabel}>Address</Text>
              <TextInput
                style={s.input}
                value={proxyInput}
                onChangeText={setProxyInput}
                placeholder="IP:PORT  or  USER:PASS@IP:PORT"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity style={s.addProxyBtn} onPress={handleAdd}>
                <Text style={s.addProxyBtnText}>Add Proxy</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    addBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    notice: { flexDirection: 'row', gap: 8, backgroundColor: colors.warning + '15', borderRadius: 10, margin: 16, padding: 12, alignItems: 'flex-start' },
    noticeText: { flex: 1, fontSize: 12, color: colors.warning, fontFamily: 'Inter_400Regular', lineHeight: 18 },
    list: { padding: 16, gap: 12 },
    proxyCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 },
    proxyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    typeText: { fontSize: 11, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
    proxyName: { flex: 1, fontSize: 15, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    iconBtn: { padding: 4 },
    proxyAddr: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    proxyFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    testResult: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
    testBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.primary },
    testBtnText: { fontSize: 13, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold' },
    empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
    emptyTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    emptySubtitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: 17, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    modalContent: { padding: 20, gap: 10 },
    fieldLabel: { fontSize: 13, fontWeight: '600' as const, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
    input: { backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12, fontSize: 15, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    typeRow: { flexDirection: 'row', gap: 8 },
    typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    typeBtnText: { fontSize: 14, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    addProxyBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
    addProxyBtnText: { fontSize: 16, fontWeight: '600' as const, color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' },
  });
