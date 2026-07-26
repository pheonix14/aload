/**
 * ALoad - Music Player Screen
 * Full-screen audio player for downloaded music files
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius, Shadow } from '../theme/spacing';

const { width: W } = Dimensions.get('window');

export const MusicPlayerScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { filePath, title, thumbnail } = route.params || {};

  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(240); // mock
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const progress = duration > 0 ? currentTime / duration : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⌄</Text>
      </TouchableOpacity>

      <Text style={styles.miniLabel}>NOW PLAYING</Text>

      {/* Album Art */}
      <View style={styles.artWrapper}>
        <View style={[styles.artPlaceholder, !thumbnail && styles.artPlaceholderFill]}>
          {thumbnail ? (
            <Image source={{ uri: `file://${thumbnail}` }} style={styles.art} />
          ) : (
            <Text style={styles.artIcon}>🎵</Text>
          )}
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>{title || 'Unknown Track'}</Text>
        <Text style={styles.trackArtist}>ALoad Music</Text>
      </View>

      {/* Seek Bar */}
      <View style={styles.seekContainer}>
        <View style={styles.seekTrack}>
          <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
          <View style={[styles.seekThumb, { left: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setShuffle(s => !s)}>
          <Text style={[styles.ctrlIcon, shuffle && styles.ctrlIconActive]}>🔀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn}>
          <Text style={styles.skipText}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={() => setPaused(p => !p)}>
          <Text style={styles.playBtnText}>{paused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn}>
          <Text style={styles.skipText}>⏭</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRepeat(r => !r)}>
          <Text style={[styles.ctrlIcon, repeat && styles.ctrlIconActive]}>🔁</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  backBtn: { alignSelf: 'center', paddingTop: 52, paddingBottom: 12 },
  backText: { fontSize: 28, color: Colors.textSecondary },
  miniLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2,
    color: Colors.textMuted, marginBottom: 24,
  },
  artWrapper: {
    marginBottom: 32,
    ...Shadow.glow(Colors.primary),
    borderRadius: BorderRadius.xl,
  },
  artPlaceholder: {
    width: W - 100,
    height: W - 100,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artPlaceholderFill: { backgroundColor: Colors.surfaceHigh },
  art: { width: '100%', height: '100%' },
  artIcon: { fontSize: 80 },
  trackInfo: { alignItems: 'center', marginBottom: 28, paddingHorizontal: 16 },
  trackTitle: {
    fontSize: FontSize['2xl'], fontWeight: '700',
    color: Colors.textPrimary, textAlign: 'center', lineHeight: 30,
  },
  trackArtist: {
    fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 6,
  },
  seekContainer: { width: '100%', marginBottom: 24 },
  seekTrack: {
    height: 4, backgroundColor: Colors.surfaceBorder,
    borderRadius: 2, overflow: 'visible', position: 'relative',
  },
  seekFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: 2,
  },
  seekThumb: {
    position: 'absolute', top: -6,
    width: 16, height: 16,
    borderRadius: 8, backgroundColor: Colors.primary,
    marginLeft: -8,
    ...Shadow.glow(Colors.primary),
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { fontSize: FontSize.xs, color: Colors.textMuted },
  controls: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', width: '100%',
  },
  ctrlIcon: { fontSize: 22, color: Colors.textMuted },
  ctrlIconActive: { color: Colors.primary },
  skipBtn: { padding: 8 },
  skipText: { fontSize: 28, color: Colors.textPrimary },
  playBtn: {
    width: 68, height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.glow(Colors.primary),
  },
  playBtnText: { fontSize: 26, color: '#fff' },
});
