import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  const goToLogin = () => {
    router.push('/login');  // '/login' 경로로 이동
  };

  return (
    <View style={styles.container}>
      <Text>🏀 농구 하이라이트 앱 홈 화면</Text>
      <Button title="로그인 페이지로 가기" onPress={goToLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' }
});
