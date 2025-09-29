import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
const REST_API_KEY = "2d02b80c257c10b0bcd5f762ba607f0d";
const REDIRECT_URI = "http://192.168.76.167:8081";
const API_URL = "http://tkv00.ddns.net:9000/kakao/callback";

export default function KakaoWebViewLogin() {
  const [loading, setLoading] = useState(false);
  const [isHandled, setIsHandled] = useState(false); // ✅ 여기가 정상이야
  const iframeRef = useRef(null);
  const router = useRouter();
  const handleKakaoCode = async (code) => { 
  setLoading(true);
  try {
    const response = await axios.get(
      `${API_URL}?code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    );
    console.log("✅ 백엔드 응답:", response.data);

    let parsed = response.data;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        Alert.alert("서버 응답 오류", "응답을 처리할 수 없습니다.");
        return;
      }
    }

    const { accessToken, refreshToken } = parsed.result || {};

    if (!accessToken) {
      Alert.alert("로그인 실패", "토큰 발급에 실패했습니다.");
      return;
    }

    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
    Alert.alert("로그인 성공", "카카오 로그인에 성공했습니다.");
    router.replace('/')
  } catch (error) {
    Alert.alert("로그인 실패", error.message || "토큰 요청에 실패했습니다.");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    if (Platform.OS === "web") {
      const listener = (event) => {
        if (
          !isHandled &&
          typeof event.data === "string" &&
          event.data.startsWith("code=")
        ) {
          const code = event.data.replace("code=", "");
          console.log("✅ 웹에서 받은 인가 코드:", code);
          setIsHandled(true);
          handleKakaoCode(code);
        }
      };
      window.addEventListener("message", listener);
      return () => window.removeEventListener("message", listener);
    }
  }, [isHandled]);

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1 }}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FEE500" />
          </View>
        )}
        <iframe
          ref={iframeRef}
          src={kakaoAuthUrl}
          style={{ flex: 1, width: "100%", height: "100%", border: "none" }}
          title="kakao-login"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FEE500" />
        </View>
      )}
      <WebView
        source={{ uri: kakaoAuthUrl }}
        onNavigationStateChange={(navState) => {
          const { url } = navState;
          if (!isHandled && url.startsWith(REDIRECT_URI)) {
            const match = url.match(/[?&]code=([^&]+)/);
            if (match) {
              const code = match[1];
              console.log("✅ 네이티브에서 받은 인가 코드:", code);
              setIsHandled(true);
              handleKakaoCode(code);
            }
          }
        }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
