import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenModule from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { useAppStore } from './src/store/useAppStore';
import { colors } from './src/theme/colors';
import {
  addNotificationResponseListener,
  getLastNotificationResponse,
  scheduleDailyNotifications,
} from './src/notifications/scheduleNotifications';

SplashScreenModule.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.warmWhite },
        animation: 'fade',
      }}
      initialRouteName={hasOnboarded ? 'Home' : 'Onboarding'}
    >
      {!hasOnboarded && (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const showMessageById = useAppStore((s) => s.showMessageById);
  const schedule = useAppStore((s) => s.schedule);
  const notificationsPermission = useAppStore(
    (s) => s.notificationsPermission,
  );

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreenModule.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    (async () => {
      const messageId = await getLastNotificationResponse();
      if (messageId) {
        showMessageById(messageId);
      }
    })();

    const cleanup = addNotificationResponseListener((messageId) => {
      if (messageId) {
        showMessageById(messageId);
      }
    });
    return cleanup;
  }, []);

  useEffect(() => {
    if (notificationsPermission === 'granted') {
      scheduleDailyNotifications(schedule).catch(() => {});
    }
  }, [notificationsPermission]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.pink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.darkText} />
      </View>
    );
  }

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
