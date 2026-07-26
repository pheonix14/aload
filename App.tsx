/**
 * ALoad — The Free All-in-One Downloader
 * YouTube · Instagram · Facebook · Pinterest · TikTok · Torrents
 *
 * Author: phoenix14
 * GitHub: https://github.com/pheonix14/aload
 * License: MIT
 */

import React, { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/store/settingsStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function App() {
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
