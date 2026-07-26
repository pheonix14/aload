/**
 * ALoad - Add Download Screen
 * Tabs: Single URL | Bulk URLs | Pinterest Board
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius, Spacing, Shadow } from '../theme/spacing';
import { PlatformBadge } from '../components/PlatformBadge';
import { useDownloadStore } from '../store/downloadStore';
import { detectURLInfo, parseMultipleURLs } from '../services/URLDetector';
import { Quality, DownloadFormat } from '../types';

type Tab = 'single' | 'bulk' | 'pinterest';

const QUALITIES: Quality[] = ['best', '1080p', '720p', '480p', '360p', 'audio-only'];
const QUALITY_LABELS: Record<Quality, string> = {
  best: 'Best',
  '1080p': '1080p',
  '720p': '720p',
  '480p': '480p',
  '360p': '360p',
  'audio-only': '🎵 Audio',
};

export const AddDownloadScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addDownload, addBulkDownload, addPinterestBoard } = useDownloadStore();

  const [tab, setTab] = useState<Tab>('single');
  const [url, setUrl] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [boardUrl, setBoardUrl] = useState('');
  const [quality, setQuality] = useState<Quality>('best');
  const [format, setFormat] = useState<DownloadFormat>('video');
  const [loading, setLoading] = useState(false);

  const urlInfo = url ? detectURLInfo(url) : null;
  const bulkUrls = bulkText ? parseMultipleURLs(bulkText) : [];

  const pasteSingle = async () => {
    const text = await Clipboard.getString();
    setUrl(text.trim());
  };
  const pasteBoard = async () => {
    const text = await Clipboard.getString();
    setBoardUrl(text.trim());
  };
  const pasteBulk = async () => {
    const text = await Clipboard.getString();
    setBulkText(text.trim());
  };

  const handleSingleDownload = useCallback(async () => {
    if (!url.trim() || !urlInfo?.isValid) {
      Alert.alert('Invalid URL', 'Please enter a valid URL or magnet link.');
      return;
    }
    setLoading(true);
    try {
      const f: DownloadFormat = quality === 'audio-only' ? 'audio' : format;
      const q = quality === 'audio-only' ? 'best' : quality;
      const id = await addDownload(url.trim(), { format: f, quality: q as Quality });
      if (id) {
        Alert.alert('✅ Download Started', 'You can track progress on the home screen.');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to start download. Make sure the server is running.');
      }
    } finally {
      setLoading(false);
    }
  }, [url, urlInfo, quality, format]);

  const handleBulkDownload = useCallback(async () => {
    if (bulkUrls.length === 0) {
      Alert.alert('No valid URLs', 'Paste URLs separated by new lines.');
      return;
    }
    setLoading(true);
    try {
      await addBulkDownload(bulkUrls, format, quality);
      Alert.alert(`✅ ${bulkUrls.length} downloads started`, 'Tracking on home screen.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [bulkUrls, format, quality]);

  const handlePinterestBoard = useCallback(async () => {
    if (!boardUrl.trim()) {
      Alert.alert('Invalid URL', 'Enter a Pinterest board URL.');
      return;
    }
    const info = detectURLInfo(boardUrl.trim());
    if (info.platform !== 'pinterest') {
      Alert.alert('Not a Pinterest URL', 'Please enter a Pinterest board or pin URL.');
      return;
    }
    setLoading(true);
    try {
      await addPinterestBoard(boardUrl.trim(), format, quality);
      Alert.alert('✅ Pinterest Board queued', info.isBoardUrl ? 'All pins will be downloaded.' : 'Pin downloading...');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [boardUrl, format, quality]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Download</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([['single', '📥 Single'], ['bulk', '📋 Bulk'], ['pinterest', '📌 Pinterest']] as [Tab, string][]).map(([t, label]) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── Single Tab ── */}
        {tab === 'single' && (
          <>
            <Text style={styles.label}>URL / Magnet Link</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Paste YouTube, Instagram, Facebook, TikTok, Magnet..."
                placeholderTextColor={Colors.textMuted}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />
              <TouchableOpacity style={styles.pasteBtn} onPress={pasteSingle}>
                <Text style={styles.pasteBtnText}>Paste</Text>
              </TouchableOpacity>
            </View>
            {urlInfo && url.length > 5 && (
              <View style={styles.detectedRow}>
                <PlatformBadge platform={urlInfo.platform} />
                {urlInfo.isBoardUrl && <Text style={styles.hint}>📋 Full board — all pins will download</Text>}
                {urlInfo.isPlaylist && <Text style={styles.hint}>📋 Playlist detected</Text>}
                {!urlInfo.isValid && <Text style={[styles.hint, { color: Colors.error }]}>⚠️ Invalid URL</Text>}
              </View>
            )}
          </>
        )}

        {/* ── Bulk Tab ── */}
        {tab === 'bulk' && (
          <>
            <Text style={styles.label}>Paste Multiple URLs</Text>
            <Text style={styles.sublabel}>One URL per line, or comma-separated</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.bulkInput]}
                placeholder={'https://youtube.com/...\nhttps://instagram.com/...\nhttps://pinterest.com/...'}
                placeholderTextColor={Colors.textMuted}
                value={bulkText}
                onChangeText={setBulkText}
                multiline
                numberOfLines={8}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity style={styles.pasteBtnFull} onPress={pasteBulk}>
              <Text style={styles.pasteBtnText}>📋 Paste from Clipboard</Text>
            </TouchableOpacity>
            {bulkUrls.length > 0 && (
              <View style={styles.bulkCount}>
                <Text style={styles.bulkCountText}>✅ {bulkUrls.length} valid URLs detected</Text>
              </View>
            )}
          </>
        )}

        {/* ── Pinterest Tab ── */}
        {tab === 'pinterest' && (
          <>
            <Text style={styles.label}>📌 Pinterest URL</Text>
            <Text style={styles.sublabel}>Single pin, or an entire board</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="https://pinterest.com/username/board-name/"
                placeholderTextColor={Colors.textMuted}
                value={boardUrl}
                onChangeText={setBoardUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.pasteBtn} onPress={pasteBoard}>
                <Text style={styles.pasteBtnText}>Paste</Text>
              </TouchableOpacity>
            </View>
            {boardUrl.length > 5 && (() => {
              const info = detectURLInfo(boardUrl);
              return (
                <View style={styles.detectedRow}>
                  <PlatformBadge platform="pinterest" />
                  <Text style={styles.hint}>
                    {info.isBoardUrl ? '📋 Board — all pins will be downloaded' : '📌 Single pin'}
                  </Text>
                </View>
              );
            })()}
          </>
        )}

        {/* ── Quality & Format (shared) ── */}
        <Text style={styles.label}>Quality</Text>
        <View style={styles.qualityGrid}>
          {QUALITIES.map(q => (
            <TouchableOpacity
              key={q}
              style={[styles.qualityChip, quality === q && styles.qualityChipActive]}
              onPress={() => setQuality(q)}>
              <Text style={[styles.qualityText, quality === q && styles.qualityTextActive]}>
                {QUALITY_LABELS[q]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {quality !== 'audio-only' && (
          <>
            <Text style={styles.label}>Format</Text>
            <View style={styles.formatRow}>
              {([['video', '🎬 Video'], ['audio', '🎵 Audio']] as [DownloadFormat, string][]).map(([f, lbl]) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.formatChip, format === f && styles.qualityChipActive]}
                  onPress={() => setFormat(f)}>
                  <Text style={[styles.qualityText, format === f && styles.qualityTextActive]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── Download Button ── */}
        <TouchableOpacity
          style={[styles.downloadBtn, loading && styles.downloadBtnLoading]}
          onPress={tab === 'single' ? handleSingleDownload : tab === 'bulk' ? handleBulkDownload : handlePinterestBoard}
          disabled={loading}
          activeOpacity={0.8}>
          <Text style={styles.downloadBtnText}>
            {loading ? '⏳ Starting...' : tab === 'bulk' ? `⬇ Download ${bulkUrls.length || 'All'} URLs` : '⬇ Start Download'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 24, color: Colors.textPrimary },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  label: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8, marginTop: 20 },
  sublabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: -6, marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    padding: 12,
    minHeight: 48,
  },
  bulkInput: { minHeight: 160, textAlignVertical: 'top' },
  pasteBtn: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary + '44',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pasteBtnFull: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary + '44',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  pasteBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.sm },
  detectedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  hint: { fontSize: FontSize.xs, color: Colors.textSecondary },
  bulkCount: {
    backgroundColor: Colors.success + '15',
    borderColor: Colors.success + '40',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: 8,
  },
  bulkCountText: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '600' },
  qualityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qualityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  qualityChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  qualityText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  qualityTextActive: { color: '#fff' },
  formatRow: { flexDirection: 'row', gap: 8 },
  formatChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  downloadBtn: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.glow(Colors.primary),
  },
  downloadBtnLoading: { backgroundColor: Colors.primaryDark, opacity: 0.7 },
  downloadBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
