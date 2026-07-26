/**
 * ALoad - App Navigator
 * Bottom tab navigation + Stack screens
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../theme/colors';
import { FontSize, BorderRadius } from '../theme/spacing';

import { HomeScreen }          from '../screens/HomeScreen';
import { QueueScreen }         from '../screens/QueueScreen';
import { LibraryScreen }       from '../screens/LibraryScreen';
import { SettingsScreen }      from '../screens/SettingsScreen';
import { AddDownloadScreen }   from '../screens/AddDownloadScreen';
import { VideoPlayerScreen }   from '../screens/VideoPlayerScreen';
import { MusicPlayerScreen }   from '../screens/MusicPlayerScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Home:    '🏠',
  Queue:   '⏳',
  Library: '📁',
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Queue" component={QueueScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="AddDownload" component={AddDownloadScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.surfaceBorder,
    borderTopWidth: 1,
    height: 62,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
