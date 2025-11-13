import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "../hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  // 초기 인증 확인
  useEffect(() => {
    if (loaded) {
      checkAuth();
    }
  }, [loaded]);

  // 인증 상태 체크
  const checkAuth = async () => {
    try {
      console.log("=== 인증 체크 시작 ===");
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      
      console.log("🔑 accessToken:", accessToken ? "존재함" : "없음");
      console.log("🔑 refreshToken:", refreshToken ? "존재함" : "없음");
      
      const authenticated = !!accessToken;
      setIsAuthenticated(authenticated);
      setIsReady(true);
      
      console.log("✅ 인증 상태:", authenticated ? "로그인됨" : "로그아웃됨");
      console.log("=== 인증 체크 완료 ===\n");
    } catch (error) {
      console.error("❌ 인증 확인 실패:", error);
      setIsAuthenticated(false);
      setIsReady(true);
    }
  };

  // 인증 상태 변경 감지 (다른 화면에서 로그아웃 시)
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const currentAuth = !!token;
      
      if (currentAuth !== isAuthenticated) {
        console.log("🔄 인증 상태 변경 감지:", currentAuth ? "로그인" : "로그아웃");
        setIsAuthenticated(currentAuth);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // 라우팅 로직
  useEffect(() => {
    if (!isReady || isAuthenticated === null) {
      console.log("⏳ 아직 준비 안됨:", { isReady, isAuthenticated });
      return;
    }

    console.log("=== 라우팅 체크 ===");
    console.log("📍 현재 경로:", pathname);
    console.log("📂 세그먼트:", segments);
    console.log("🔐 인증 상태:", isAuthenticated ? "로그인" : "비로그인");

    const inAuthGroup = segments[0] === "login" || segments[0] === "kakaowebview";
    console.log("🚪 인증 화면 여부:", inAuthGroup);

    // 비로그인 + 보호된 페이지 접근 -> 로그인으로
    if (!isAuthenticated && !inAuthGroup) {
      console.log("➡️ 로그인 필요 -> /login 이동");
      setTimeout(() => router.replace("/login"), 50);
    } 
    // 로그인됨 + 인증 화면 -> 홈으로
    else if (isAuthenticated && inAuthGroup) {
      console.log("➡️ 이미 로그인됨 -> /(tabs) 이동");
      setTimeout(() => router.replace("/(tabs)"), 50);
    } else {
      console.log("✅ 현재 위치 유지");
    }
    
    console.log("=== 라우팅 체크 완료 ===\n");
  }, [isAuthenticated, segments, isReady, pathname]);

  // 로딩 화면
  if (!loaded || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
        <Text style={{ color: '#fff' }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ animation: 'none' }}>
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
        <Stack.Screen name="settings" options={{ headerShown: false }} />
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