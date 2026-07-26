/**
 * ALoad - Video Player Screen
 * Full-screen video player for downloaded files
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius } from '../theme/spacing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── react-native-video is installed separately ──
// We render a fallback if not available (safe for TypeScript compilation)
let Video: any = null;
try { Video = require('react-native-video').default; } catch {}

export const VideoPlayerScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { filePath, title } = route.params || {};

  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [rate, setRate] = useState(1.0);
  const videoRef = useRef<any>(null);

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  const seek = useCallback((value: number) => {
    videoRef.current?.seek(value);
  }, []);

  const cycleRate = useCallback(() => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = rates.indexOf(rate);
    setRate(rates[(idx + 1) % rates.length]);
  }, [rate]);

  if (!Video) {
    return (
      <View style={styles.fallback}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🎬</Text>
        <Text style={styles.fallbackTitle}>{title}</Text>
        <Text style={styles.fallbackSub}>react-native-video not linked.{'\n'}Run: npx react-native link react-native-video</Text>
        <TouchableOpacity style={styles.backFab} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchableOpacity style={styles.videoArea} onPress={toggleControls} activeOpacity={1}>
        <Video
          ref={videoRef}
          source={{ uri: filePath ? `file://${filePath}` : '' }}
          style={styles.video}
          paused={paused}
          rate={rate}
          resizeMode="contain"
          onProgress={({ currentTime: t }: any) => setCurrentTime(t)}
          onLoad={({ duration: d }: any) => setDuration(d)}
        />

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.overlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.videoTitle} numberOfLines={1}>{title}</Text>
              <TouchableOpacity onPress={cycleRate} style={styles.rateBtn}>
                <Text style={styles.rateBtnText}>{rate}x</Text>
              </TouchableOpacity>
            </View>

            {/* Center Play/Pause */}
            <TouchableOpacity onPress={() => setPaused(p => !p)} style={styles.playBtn}>
              <Text style={styles.playBtnText}>{paused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>

            {/* Bottom Controls */}
            <View style={styles.bottomBar}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.seekBar}>
                {/* Simple seek bar — Slider if available */}
                <View style={styles.seekTrack}>
                  <View style={[styles.seekFill, { width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }]} />
                </View>
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoArea: { flex: 1 },
  video: { width: SCREEN_W, height: SCREEN_H },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  videoTitle: { flex: 1, color: '#fff', fontSize: FontSize.base, fontWeight: '600' },
  rateBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rateBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
  playBtn: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 40,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: { fontSize: 28, color: '#fff' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  timeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600', minWidth: 36 },
  seekBar: { flex: 1 },
  seekTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2, overflow: 'hidden',
  },
  seekFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  // Fallback
  fallback: {
    flex: 1, backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  fallbackTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  fallbackSub: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  backFab: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
});
