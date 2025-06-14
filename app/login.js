import React, { useEffect } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';
import { useRouter } from 'expo-router'; // 화면 전환용

const kakaoClientId = '2d02b80c257c10b0bcd5f762ba607f0d'; // 카카오 JavaScript 키

// 앱으로 돌아오는 리디렉션 URI
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'basketballhighlightapp', // app.json scheme과 동일하게 설정
  useProxy: true,
});

// 백엔드 API 주소
const API_URL = 'http://tkv00.ddns.net:9000';

// 카카오 API에서 이메일, 닉네임 등 프로필 가져오기 (카카오 액세스 토큰 필요)
const getUserInfo = async (accessToken) => {
  try {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('카카오 사용자 정보 조회 실패:', error);
    return null;
  }
};

export default function KakaoLogin() {
  const router = useRouter();

  useEffect(() => {
    // 앱이 리디렉션 URI로 실행됐을 때 쿼리 파라미터로 code 받아 처리
    const checkRedirect = async () => {
      const redirectUrl = await Linking.getInitialURL();
      console.log('리디렉션 URL (useEffect):', redirectUrl);
      if (!redirectUrl) return;

      const parsed = Linking.parse(redirectUrl);
      const code = parsed.queryParams?.code;
      console.log('인가 코드 (useEffect):', code);

      Alert.alert('인가 코드 (useEffect)', code || '인가 코드가 없습니다');

      if (code) {
        try {
          // 서버에 code 전달해 로그인 처리 및 토큰 발급 요청
          const response = await axios.get(
  `${API_URL}/kakao/callback?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
);

          console.log('서버 응답 (useEffect):', response.data);
          Alert.alert('로그인 성공 (useEffect)', JSON.stringify(response.data));

          const token = response.data.data.token; // 자체 발급 토큰 (예)
          const kakaoAccessToken = response.data.data.kakaoAccessToken; // 백엔드가 함께 내려준 카카오 액세스 토큰

          if (kakaoAccessToken) {
            const userInfo = await getUserInfo(kakaoAccessToken);
            console.log('카카오 사용자 정보:', userInfo);
            if (userInfo) {
              const email = userInfo.kakao_account.email;
              const nickname = userInfo.kakao_account.profile.nickname;
              console.log('Email:', email);
              console.log('Nickname:', nickname);
              // 필요시 상태에 저장하거나 AsyncStorage 등에 저장 가능
            }
          }

          router.replace('/'); // 홈 화면 이동
        } catch (err) {
          console.error('로그인 실패:', err.response || err);
          Alert.alert('로그인 실패', '다시 시도해주세요.');
        }
      }
    };

    checkRedirect();
  }, []);

  const handleKakaoLogin = async () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(kakaoAuthUrl, redirectUri);
      console.log('WebBrowser 결과:', result);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const code = parsed.queryParams?.code;
        console.log('인가 코드 (handleKakaoLogin):', code);
        Alert.alert('인가 코드 (handleKakaoLogin)', code || '인가 코드가 없습니다');

        if (code) {
          const response = await axios.get(
            `${API_URL}/auth/login/kakao?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
          );
          console.log('서버 응답 (handleKakaoLogin):', response.data);
          Alert.alert('로그인 성공 (handleKakaoLogin)', JSON.stringify(response.data));

          const token = response.data.data.token;
          const kakaoAccessToken = response.data.data.kakaoAccessToken;

          if (kakaoAccessToken) {
            const userInfo = await getUserInfo(kakaoAccessToken);
            console.log('카카오 사용자 정보:', userInfo);
            if (userInfo) {
              const email = userInfo.kakao_account.email;
              const nickname = userInfo.kakao_account.profile.nickname;
              console.log('Email:', email);
              console.log('Nickname:', nickname);
              // 저장 처리 가능
            }
          }

          router.replace('/');
        }
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      Alert.alert('로그인 실패', '다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Image
          source={{
            uri: 'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png',
          }}
          style={styles.kakaoLogo}
        />
        <Text style={styles.kakaoText}>카카오톡으로 로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  kakaoButton: {
    flexDirection: 'row',
    backgroundColor: '#FEE500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
  },
  kakaoLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  kakaoText: {
    color: '#391B1B',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
