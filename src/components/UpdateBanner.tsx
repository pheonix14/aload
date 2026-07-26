/**
 * ALoad - Update Banner Component
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius } from '../theme/spacing';
import { Release } from '../services/UpdateService';

interface Props {
  release: Release;
  onDismiss: () => void;
}

export const UpdateBanner: React.FC<Props> = ({ release, onDismiss }) => (
  <View style={styles.banner}>
    <View style={styles.left}>
      <Text style={styles.title}>🚀 Update Available — v{release.version}</Text>
      <Text style={styles.sub} numberOfLines={2}>{release.name}</Text>
    </View>
    <View style={styles.right}>
      <TouchableOpacity
        style={styles.updateBtn}
        onPress={() => Linking.openURL(release.downloadUrl)}>
        <Text style={styles.updateText}>Update</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss}>
        <Text style={styles.dismiss}>✕</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary + '55',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
  },
  left: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: Colors.primaryGlow, fontSize: FontSize.sm, fontWeight: '700' },
  sub: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  updateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  updateText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  dismiss: { color: Colors.textMuted, fontSize: 16, paddingHorizontal: 4 },
});
