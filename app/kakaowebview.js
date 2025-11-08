import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const REST_API_KEY = "2d02b80c257c10b0bcd5f762ba607f0d";
const REDIRECT_URI = "https://tkv00.ddns.net"; // 필요시 실제 도메인으로 교체
const API_URL = "https://tkv00.ddns.net/kakao/callback";

export default function KakaoWebViewLogin() {
  const [loading, setLoading] = useState(false);
  const [isHandled, setIsHandled] = useState(false);
  const [loginFinished, setLoginFinished] = useState(false); // ✅ WebView 언마운트용
  const iframeRef = useRef(null);
  const router = useRouter();
  const isHandledRef = useRef(false);

  const handleKakaoCode = async (code) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}?code=${code}`);
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

      const result = parsed?.result || parsed;
      const accessToken = result?.accessToken ?? null;
      const refreshToken = result?.refreshToken ?? null;

      console.log("🟢 Access Token:", accessToken);
      console.log("🟢 Refresh Token:", refreshToken);

      if (!accessToken) {
        Alert.alert("로그인 실패", "토큰 발급에 실패했습니다.");
        return;
      }

      await Promise.all([
        AsyncStorage.setItem("accessToken", String(accessToken)),
        AsyncStorage.setItem("refreshToken", String(refreshToken)),
      ]);

      setLoginFinished(true); // WebView 언마운트
      router.replace("/"); // 홈 화면으로 이동
    } catch (error) {
      console.error("❌ 토큰 요청 에러:", error);
      Alert.alert("로그인 실패", error.message || "토큰 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 웹 플랫폼에서 메시지 이벤트 처리
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

  // WebView 언마운트 후에는 아무것도 렌더링하지 않음
  if (loginFinished) return null;

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
          if (!isHandledRef.current && url.startsWith(REDIRECT_URI)) {
            const match = url.match(/[?&]code=([^&]+)/);
            if (match) {
              const code = match[1];
              console.log("✅ 네이티브에서 받은 인가 코드:", code);

              isHandledRef.current = true; // ✅ 즉시 true로 막음
              setIsHandled(true); // 상태도 갱신 (UI용)
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
