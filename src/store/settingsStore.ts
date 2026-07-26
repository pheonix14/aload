/**
 * ALoad - Settings Store (Zustand)
 */

import { create } from 'zustand';
import { AppSettings, DEFAULT_SETTINGS } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  settings: AppSettings;
  loaded: boolean;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const STORAGE_KEY = 'aload_settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ settings: { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  updateSetting: async (key, value) => {
    const settings = { ...get().settings, [key]: value };
    set({ settings });
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
  },
}));
