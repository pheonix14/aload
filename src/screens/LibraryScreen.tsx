/**
 * ALoad - Library Screen
 * Browse all completed downloaded files (Videos / Music / Files)
 */

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Share, Linking,
} from 'react-native';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius, Shadow } from '../theme/spacing';
import { useDownloadStore } from '../store/downloadStore';
import { PlatformBadge } from '../components/PlatformBadge';
import { Download } from '../types';
import { useNavigation } from '@react-navigation/native';

type LibTab = 'all' | 'video' | 'audio' | 'torrent';

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { completedDownloads, cancelDownload } = useDownloadStore();
  const [tab, setTab] = useState<LibTab>('all');

  const completed = completedDownloads();
  const filtered = tab === 'all'
    ? completed
    : completed.filter(d =>
        tab === 'torrent' ? d.platform === 'torrent' : d.format === tab,
      );

  const handleOpen = (item: Download) => {
    if (item.format === 'video' || item.format === 'file') {
      navigation.navigate('VideoPlayer', { filePath: item.filePath, title: item.title });
    } else if (item.format === 'audio') {
      navigation.navigate('MusicPlayer', { filePath: item.filePath, title: item.title });
    }
  };

  const handleShare = (item: Download) => {
    if (item.filePath) {
      Share.share({ url: `file://${item.filePath}`, title: item.title });
    }
  };

  const handleDelete = (item: Download) => {
    Alert.alert('Delete', `Remove "${item.title}" from library?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => cancelDownload(item.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.count}>{completed.length} files</Text>
      </View>

      <View style={styles.tabBar}>
        {([['all', '📁 All'], ['video', '🎬 Video'], ['audio', '🎵 Audio'], ['torrent', '🧲 Torrent']] as [LibTab, string][]).map(([t, lbl]) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleOpen(item)}
            onLongPress={() => handleDelete(item)}
            activeOpacity={0.8}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Text style={styles.iconEmoji}>
                  {item.format === 'audio' ? '🎵' : item.platform === 'torrent' ? '🧲' : '🎬'}
                </Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.badgeRow}>
                  <PlatformBadge platform={item.platform} size="sm" showName={false} />
                  {item.size && <Text style={styles.size}>{item.size}</Text>}
                  <Text style={styles.quality}>{item.quality}</Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(item)}>
                <Text style={styles.actionIcon}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.actionIcon}>🗑</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📂</Text>
            <Text style={styles.emptyText}>No downloaded files yet</Text>
            <Text style={{ color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', marginTop: 6 }}>
              Downloads appear here when complete
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
  count: { fontSize: FontSize.sm, color: Colors.textMuted },
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadow.sm,
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
  meta: { flex: 1 },
  itemTitle: { color: Colors.textPrimary, fontSize: FontSize.base, fontWeight: '600', marginBottom: 5 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  size: { fontSize: FontSize.xs, color: Colors.textMuted },
  quality: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.surfaceBorder, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },
  actionIcon: { fontSize: 16 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: '600' },
});
