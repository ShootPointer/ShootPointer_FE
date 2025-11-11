// app/_layout.js
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "../hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();
  const segments = useSegments();

  // 토큰 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("토큰 확인 실패:", error);
        setIsAuthenticated(false);
      }
    };

    if (loaded) {
      checkAuth();
    }
  }, [loaded]);

  // 인증 상태에 따라 리다이렉트
  useEffect(() => {
    if (isAuthenticated === null || !loaded) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inAuthGroup) {
      // 토큰 없으면 로그인 화면으로
      router.replace("/login");
    } else if (isAuthenticated && segments[0] === "login") {
      // 토큰 있으면 홈 화면으로
      router.replace("/(tabs)");
    }

    setReady(true);
  }, [isAuthenticated, segments, loaded]);

  if (!loaded || !ready) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="WriteScreen"
          options={{
            title: "새 게시물",
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#111" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            title: "설정",
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen name="kakaowebview" options={{ headerShown: false }} />
        <Stack.Screen
          name="CommentScreen"
          options={{
            title: "댓글",
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#111" },
            headerTintColor: "#fff",
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}