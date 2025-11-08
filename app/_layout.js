import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "../hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded) setReady(true);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {ready && (
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
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
