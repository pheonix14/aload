/**
 * ALoad - Queue Screen
 * Shows all downloads tabbed: Active / Paused / Completed / Failed
 */

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius } from '../theme/spacing';
import { DownloadCard } from '../components/DownloadCard';
import { useDownloadStore } from '../store/downloadStore';
import { Download } from '../types';

type QTab = 'active' | 'paused' | 'completed' | 'failed';

export const QueueScreen: React.FC = () => {
  const [tab, setTab] = useState<QTab>('active');
  const { downloads, clearCompleted, activeDownloads, pausedDownloads, completedDownloads, failedDownloads } = useDownloadStore();

  const tabData: Record<QTab, Download[]> = {
    active:    activeDownloads(),
    paused:    pausedDownloads(),
    completed: completedDownloads(),
    failed:    failedDownloads(),
  };

  const tabLabels: Record<QTab, string> = {
    active:    `Active (${tabData.active.length})`,
    paused:    `Paused (${tabData.paused.length})`,
    completed: `Done (${tabData.completed.length})`,
    failed:    `Failed (${tabData.failed.length})`,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Queue</Text>
        {tab === 'completed' && tabData.completed.length > 0 && (
          <TouchableOpacity onPress={() => {
            Alert.alert('Clear Completed', 'Remove all completed downloads?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearCompleted },
            ]);
          }}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(Object.keys(tabLabels) as QTab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {tabLabels[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tabData[tab]}
        keyExtractor={d => d.id}
        renderItem={({ item }) => <DownloadCard download={item} />}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 4 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              {tab === 'active' ? '⏳' : tab === 'paused' ? '⏸' : tab === 'completed' ? '✅' : '❌'}
            </Text>
            <Text style={styles.emptyText}>
              No {tab} downloads
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  clearBtn: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    gap: 2,
  },
  tab: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
