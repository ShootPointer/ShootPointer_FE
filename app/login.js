import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function KakaoLoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/kakaowebview');
  };

  return (
    <View style={styles.container}>
      {/* 로고 추가 */}
      <Image
        source={require('../assets/images/logo.png')} // Figma에서 저장한 로고 경로
        style={styles.logo}
        resizeMode="contain"
      />
     <View>
  <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'center' }}>
    나만의 하이라이트를 생성하고
  </Text>
  <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'center' }}>
    친구들과 공유해보세요.
  </Text>
</View>

      {/* 카카오 로그인 버튼 */}
      <TouchableOpacity onPress={handleLogin} style={styles.kakaoButton}>
        <Text style={styles.kakaoText}>카카오톡으로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111111'
  },
  logo: {
    width: 300,
    height: 300,
    
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 6,
    marginTop:100
  },
  kakaoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C1E1E',
  },
});
