/**
 * ALoad - Progress Bar Component
 * Animated shimmer progress bar
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { StatusColors, Colors } from '../theme/colors';
import { DownloadStatus } from '../types';

interface Props {
  progress: number;       // 0-100
  status: DownloadStatus;
  height?: number;
}

export const ProgressBar: React.FC<Props> = ({ progress, status, height = 4 }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (status === 'downloading') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      shimmerAnim.stopAnimation();
    }
  }, [status]);

  const color = StatusColors[status] || Colors.primary;
  const width = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const shimmerOpacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.0] });

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color, opacity: shimmerOpacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
});
