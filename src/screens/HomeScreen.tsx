/**
 * ALoad - Home Screen
 * Dashboard: stats + active downloads + FAB
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ScrollView, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius, Spacing, Shadow } from '../theme/spacing';
import { useDownloadStore } from '../store/downloadStore';
import { DownloadCard } from '../components/DownloadCard';
import { UpdateBanner } from '../components/UpdateBanner';
import { checkForUpdate, Release } from '../services/UpdateService';
import { subscribeToProgress } from '../services/NodeBridge';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { downloads, loadDownloads, updateProgress, activeDownloads, pausedDownloads, completedDownloads } = useDownloadStore();
  const [updateRelease, setUpdateRelease] = useState<Release | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    loadDownloads();
    // Subscribe to progress events
    const unsub = subscribeToProgress(updateProgress);
    // Check for updates
    checkForUpdate().then(r => r && setUpdateRelease(r));
    return () => unsub();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDownloads();
    setRefreshing(false);
  }, []);

  const active = activeDownloads();
  const paused = pausedDownloads();
  const completed = completedDownloads();

  const totalSpeed = active.reduce((acc, d) => {
    const match = d.speed.match(/([\d.]+)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>ALoad</Text>
          <Text style={styles.subtitle}>by phoenix14</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Update Banner */}
      {updateRelease && (
        <UpdateBanner release={updateRelease} onDismiss={() => setUpdateRelease(null)} />
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Active" value={active.length.toString()} color={Colors.downloading} />
        <StatCard label="Paused" value={paused.length.toString()} color={Colors.paused} />
        <StatCard label="Done" value={completed.length.toString()} color={Colors.success} />
        {active.length > 0 && (
          <StatCard label="Speed" value={`${totalSpeed.toFixed(1)} MB/s`} color={Colors.primaryGlow} />
        )}
      </View>

      {/* Downloads List */}
      <FlatList
        data={downloads}
        keyExtractor={d => d.id}
        renderItem={({ item }) => <DownloadCard download={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={Colors.primary} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📥</Text>
            <Text style={styles.emptyTitle}>No downloads yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to start downloading from{'\n'}YouTube, Instagram, Pinterest, Torrents & more
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddDownload', { mode: 'single' })}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderColor: color + '30' }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  settingsBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: { fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  list: { paddingBottom: 100, paddingTop: 4 },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.glow(Colors.primary),
  },
  fabText: { fontSize: 30, color: '#fff', fontWeight: '300', lineHeight: 34 },
});
