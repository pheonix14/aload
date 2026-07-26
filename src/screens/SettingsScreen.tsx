/**
 * ALoad - Settings Screen
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ScrollView, Alert, Linking,
} from 'react-native';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius, Shadow } from '../theme/spacing';
import { useSettingsStore } from '../store/settingsStore';
import { CURRENT_VERSION } from '../services/UpdateService';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, updateSetting, resetSettings } = useSettingsStore();

  const handleReset = () => {
    Alert.alert('Reset Settings', 'Restore all settings to default?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetSettings },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Downloads */}
      <Section title="Downloads">
        <SettingRow
          label="Max Concurrent Downloads"
          sub={`Currently: ${settings.maxConcurrent}`}>
          <View style={styles.stepper}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.stepBtn, settings.maxConcurrent === n && styles.stepBtnActive]}
                onPress={() => updateSetting('maxConcurrent', n)}>
                <Text style={[styles.stepText, settings.maxConcurrent === n && styles.stepTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingRow>

        <SettingRow label="Auto-pause on Metered Connection" sub="Save data on mobile networks">
          <Switch
            value={settings.autoPauseOnMetered}
            onValueChange={v => updateSetting('autoPauseOnMetered', v)}
            trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
            thumbColor="#fff"
          />
        </SettingRow>

        <SettingRow label="Seed After Complete" sub="Upload to help torrent swarm">
          <Switch
            value={settings.seedAfterComplete}
            onValueChange={v => updateSetting('seedAfterComplete', v)}
            trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
            thumbColor="#fff"
          />
        </SettingRow>
      </Section>

      {/* Storage */}
      <Section title="Storage">
        <SettingRow label="Download Location" sub={settings.downloadPath}>
          <View />
        </SettingRow>
      </Section>

      {/* About */}
      <Section title="About">
        <SettingRow label="App Version" sub={`v${CURRENT_VERSION}`}><View /></SettingRow>
        <SettingRow label="Developer" sub="phoenix14"><View /></SettingRow>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL(`https://github.com/${settings.githubRepo}`)}>
          <Text style={styles.linkText}>⭐ View on GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL(`https://github.com/${settings.githubRepo}/releases`)}>
          <Text style={styles.linkText}>📦 All Releases</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL(`https://github.com/${settings.githubRepo}/issues`)}>
          <Text style={styles.linkText}>🐛 Report Issue</Text>
        </TouchableOpacity>
      </Section>

      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetText}>⚠️ Reset to Defaults</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const SettingRow: React.FC<{ label: string; sub?: string; children: React.ReactNode }> = ({ label, sub, children }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingLeft}>
      <Text style={styles.settingLabel}>{label}</Text>
      {sub && <Text style={styles.settingSub} numberOfLines={1}>{sub}</Text>}
    </View>
    <View style={styles.settingRight}>{children}</View>
  </View>
);

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
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  settingLeft: { flex: 1, marginRight: 12 },
  settingLabel: { color: Colors.textPrimary, fontSize: FontSize.base, fontWeight: '500' },
  settingSub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  settingRight: {},
  stepper: { flexDirection: 'row', gap: 4 },
  stepBtn: {
    width: 28, height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnActive: { backgroundColor: Colors.primary },
  stepText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  stepTextActive: { color: '#fff' },
  linkRow: {
    paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  linkText: { color: Colors.primary, fontSize: FontSize.base, fontWeight: '500' },
  resetBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    backgroundColor: Colors.error + '15',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
    alignItems: 'center',
  },
  resetText: { color: Colors.error, fontWeight: '600', fontSize: FontSize.base },
});
