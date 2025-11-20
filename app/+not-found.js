import { Link, Stack } from 'expo-router';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        {/* 중앙 이미지 */}
        <Image
          source={require('../assets/images/404.png')} // 업로드한 이미지 경로
          style={styles.image}
        />
        {/* 홈으로 돌아가기 버튼 */}
        <Link href="/">
          <TouchableOpacity style={styles.button}>
            <ThemedText type="button" style={styles.buttonText}>
              홈으로 돌아가기
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 245,
    height: 375,
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ff6a33',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
