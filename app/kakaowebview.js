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
  Text,
} from "react-native";
import { WebView } from "react-native-webview";

const REST_API_KEY = "2d02b80c257c10b0bcd5f762ba607f0d";
const REDIRECT_URI = "https://tkv00.ddns.net";
const API_URL = "https://tkv00.ddns.net/kakao/callback";

export default function KakaoWebViewLogin() {
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const isHandledRef = useRef(false);

  const handleKakaoCode = async (code) => {
    if (isHandledRef.current) {
      console.log("⚠️ 이미 처리 중인 요청 무시");
      return;
    }
    
    console.log("\n=== 카카오 로그인 처리 시작 ===");
    isHandledRef.current = true;
    setLoading(true);

    try {
      console.log("📤 백엔드 요청:", `${API_URL}?code=${code.substring(0, 10)}...`);
      
      const response = await axios.get(`${API_URL}?code=${code}`, {
        timeout: 10000,
      });
      
      console.log("📥 응답 상태:", response.status);
      console.log("📥 응답 데이터:", JSON.stringify(response.data).substring(0, 200));

      let parsed = response.data;
      if (typeof parsed === "string") {
        console.log("🔄 문자열 응답 파싱 시도");
        try {
          parsed = JSON.parse(parsed);
        } catch (parseError) {
          console.error("❌ JSON 파싱 실패:", parseError);
          Alert.alert("서버 응답 오류", "응답을 처리할 수 없습니다.");
          setError("JSON 파싱 실패");
          isHandledRef.current = false;
          setLoading(false);
          return;
        }
      }

      const result = parsed?.result || parsed;
      const accessToken = result?.accessToken ?? null;
      const refreshToken = result?.refreshToken ?? null;

      console.log("🔑 Access Token:", accessToken ? `${accessToken.substring(0, 20)}...` : "없음");
      console.log("🔑 Refresh Token:", refreshToken ? `${refreshToken.substring(0, 20)}...` : "없음");

      if (!accessToken) {
        console.error("❌ 토큰 없음");
        Alert.alert("로그인 실패", "토큰 발급에 실패했습니다.");
        setError("토큰 발급 실패");
        isHandledRef.current = false;
        setLoading(false);
        return;
      }

      // 토큰 저장
      console.log("💾 토큰 저장 시작");
      await AsyncStorage.setItem("accessToken", String(accessToken));
      await AsyncStorage.setItem("refreshToken", String(refreshToken));
      
      // 저장 확인
      const saved = await AsyncStorage.getItem("accessToken");
      console.log("✅ 토큰 저장 확인:", saved ? "성공" : "실패");

      console.log("🏠 홈 화면으로 이동 시도");
      
      // 여러 방법 시도
      router.replace("/(tabs)");
      
      console.log("=== 카카오 로그인 처리 완료 ===\n");
      
    } catch (error) {
      console.error("\n❌❌❌ 토큰 요청 에러 ❌❌❌");
      console.error("에러 메시지:", error.message);
      console.error("에러 응답:", error.response?.data);
      console.error("에러 상태:", error.response?.status);
      
      setError(error.message);
      Alert.alert("로그인 실패", error.message || "토큰 요청에 실패했습니다.");
      isHandledRef.current = false;
      setLoading(false);
    }
  };

  // 웹 플랫폼
  useEffect(() => {
    if (Platform.OS === "web") {
      const listener = (event) => {
        if (
          !isHandledRef.current &&
          typeof event.data === "string" &&
          event.data.startsWith("code=")
        ) {
          const code = event.data.replace("code=", "");
          console.log("✅ 웹에서 인가 코드 수신:", code.substring(0, 10) + "...");
          handleKakaoCode(code);
        }
      };
      window.addEventListener("message", listener);
      return () => window.removeEventListener("message", listener);
    }
  }, []);

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;

  console.log("🔗 카카오 인증 URL:", kakaoAuthUrl);

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, backgroundColor: "#111" }}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FEE500" />
            <Text style={{ color: '#fff', marginTop: 10 }}>로그인 중...</Text>
          </View>
        )}
        {error && (
          <View style={{ padding: 20, backgroundColor: '#f00' }}>
            <Text style={{ color: '#fff' }}>에러: {error}</Text>
          </View>
        )}
        <iframe
          src={kakaoAuthUrl}
          style={{ flex: 1, width: "100%", height: "100%", border: "none" }}
          title="kakao-login"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FEE500" />
          <Text style={{ color: '#fff', marginTop: 10 }}>로그인 중...</Text>
        </View>
      )}
      
      {error && (
        <View style={{ padding: 20, backgroundColor: '#f00', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <Text style={{ color: '#fff' }}>에러: {error}</Text>
        </View>
      )}

      <View style={{ padding: 10, backgroundColor: '#333' }}>
        <Text style={{ color: '#fff', fontSize: 10 }}>현재 URL: {currentUrl.substring(0, 50)}...</Text>
      </View>

      <WebView
        source={{ uri: kakaoAuthUrl }}
        onNavigationStateChange={(navState) => {
          const { url } = navState;
          setCurrentUrl(url);
          
          console.log("🌐 WebView URL 변경:", url.substring(0, 50) + "...");
          
          if (!isHandledRef.current && url.startsWith(REDIRECT_URI)) {
            console.log("✅ 리다이렉트 URI 감지!");
            
            const match = url.match(/[?&]code=([^&]+)/);
            if (match) {
              const code = match[1];
              console.log("✅ 인가 코드 추출:", code.substring(0, 10) + "...");
              handleKakaoCode(code);
            } else {
              console.log("⚠️ 인가 코드 없음");
            }
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("⚠️ WebView 에러:", nativeEvent);
          setError(`WebView 에러: ${nativeEvent.description}`);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("⚠️ HTTP 에러:", nativeEvent.statusCode);
        }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});