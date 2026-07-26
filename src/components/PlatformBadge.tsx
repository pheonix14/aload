/**
 * ALoad - Platform Badge Component
 * Shows colored pill with platform icon + name
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Platform } from '../types';
import { PlatformColors } from '../theme/colors';
import { FontSize, BorderRadius, Spacing } from '../theme/spacing';

const PLATFORM_ICONS: Record<string, string> = {
  youtube:   '▶',
  instagram: '📸',
  facebook:  '👤',
  pinterest: '📌',
  tiktok:    '🎵',
  twitter:   '🐦',
  vimeo:     '🎬',
  reddit:    '🤖',
  torrent:   '🧲',
  direct:    '🔗',
};

const PLATFORM_NAMES: Record<string, string> = {
  youtube:   'YouTube',
  instagram: 'Instagram',
  facebook:  'Facebook',
  pinterest: 'Pinterest',
  tiktok:    'TikTok',
  twitter:   'X/Twitter',
  vimeo:     'Vimeo',
  reddit:    'Reddit',
  torrent:   'Torrent',
  direct:    'Direct',
};

interface Props {
  platform: Platform;
  showName?: boolean;
  size?: 'sm' | 'md';
}

export const PlatformBadge: React.FC<Props> = ({ platform, showName = true, size = 'md' }) => {
  const color = PlatformColors[platform] || '#A0A0B8';
  const icon = PLATFORM_ICONS[platform] || '🔗';
  const name = PLATFORM_NAMES[platform] || platform;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '44' }, isSmall && styles.badgeSm]}>
      <Text style={[styles.icon, isSmall && styles.iconSm]}>{icon}</Text>
      {showName && (
        <Text style={[styles.name, { color }, isSmall && styles.nameSm]} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  icon: { fontSize: 12 },
  iconSm: { fontSize: 10 },
  name: { fontSize: FontSize.xs, fontWeight: '600' },
  nameSm: { fontSize: 10 },
});
