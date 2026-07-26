/**
 * ALoad - Download Card Component
 * Swipeable card for each download with pause/resume/cancel
 */

import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Alert,
} from 'react-native';
import { Download } from '../types';
import { Colors, StatusColors } from '../theme/colors';
import { FontSize, BorderRadius, Spacing, Shadow } from '../theme/spacing';
import { ProgressBar } from './ProgressBar';
import { PlatformBadge } from './PlatformBadge';
import { useDownloadStore } from '../store/downloadStore';

interface Props {
  download: Download;
}

function formatDaysAgo(ts?: number): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff / (1000 * 60));
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

export const DownloadCard: React.FC<Props> = ({ download }) => {
  const { pauseDownload, resumeDownload, cancelDownload } = useDownloadStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const statusColor = StatusColors[download.status] || Colors.textSecondary;
  const isActive = download.status === 'downloading' || download.status === 'connecting';
  const isPaused = download.status === 'paused';
  const isExpired = download.status === 'expired';
  const daysLeft = download.pausedAt
    ? Math.max(0, 7 - Math.floor((Date.now() - download.pausedAt) / (1000 * 60 * 60 * 24)))
    : null;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 30 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handleCancel = () => {
    Alert.alert('Cancel Download', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => cancelDownload(download.id) },
    ]);
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/* Header Row */}
      <View style={styles.header}>
        <PlatformBadge platform={download.platform} size="sm" />
        <View style={styles.statusRow}>
          {daysLeft !== null && !isExpired && (
            <Text style={[styles.daysLeft, { color: daysLeft <= 1 ? Colors.error : Colors.warning }]}>
              {daysLeft}d left
            </Text>
          )}
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isExpired ? 'Expired' : download.status.charAt(0).toUpperCase() + download.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {download.title || download.url}
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <ProgressBar progress={download.progress} status={download.status} height={5} />
        <View style={styles.progressMeta}>
          <Text style={styles.progressText}>{download.progress.toFixed(1)}%</Text>
          {isActive && (
            <Text style={styles.progressText}>
              {download.speed} · {download.eta}
            </Text>
          )}
          {isPaused && download.pausedAt && (
            <Text style={styles.mutedText}>Paused {formatDaysAgo(download.pausedAt)}</Text>
          )}
          {download.size ? <Text style={styles.mutedText}>{download.size}</Text> : null}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isActive && (
          <TouchableOpacity
            style={[styles.btn, styles.btnPause]}
            onPress={() => pauseDownload(download.id)}
            onPressIn={onPressIn} onPressOut={onPressOut}>
            <Text style={styles.btnText}>⏸ Pause</Text>
          </TouchableOpacity>
        )}
        {isPaused && !isExpired && (
          <TouchableOpacity
            style={[styles.btn, styles.btnResume]}
            onPress={() => resumeDownload(download.id)}
            onPressIn={onPressIn} onPressOut={onPressOut}>
            <Text style={styles.btnText}>▶ Resume</Text>
          </TouchableOpacity>
        )}
        {(download.status === 'completed' || download.status === 'failed' || isExpired) && (
          <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={handleCancel}>
            <Text style={styles.btnText}>🗑 Remove</Text>
          </TouchableOpacity>
        )}
        {(isActive || isPaused) && (
          <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={handleCancel}>
            <Text style={[styles.btnText, { color: Colors.error }]}>✕ Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  daysLeft: { fontSize: FontSize.xs, fontWeight: '700', marginRight: 4 },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 20,
  },
  progressSection: { marginBottom: 10 },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '500' },
  mutedText: { color: Colors.textMuted, fontSize: FontSize.xs },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  btnPause: { borderColor: Colors.warning + '60', backgroundColor: Colors.warning + '15' },
  btnResume: { borderColor: Colors.success + '60', backgroundColor: Colors.success + '15' },
  btnCancel: { borderColor: Colors.error + '40', backgroundColor: 'transparent' },
  btnDelete: { borderColor: Colors.error + '40', backgroundColor: Colors.error + '15' },
  btnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textPrimary },
});
