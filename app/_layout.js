import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded) setReady(true);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {ready && (
        <Stack>
          {/* Tab Navigator */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* 글쓰기 화면 */}
          <Stack.Screen
            name="WriteScreen"
            options={{
              title: '새 게시물',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#111' },
              headerTintColor: '#fff',
            }}
          />

          {/* 기타 화면 */}
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="settings"
            options={{
              title: '설정',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#000' },
              headerTintColor: '#fff',
            }}
          />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
