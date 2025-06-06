import { View, Text, StyleSheet } from 'react-native';

export default function CaptureScreen() {
  return (
    <View style={styles.container}>
      <Text>마이페이지지 화면입니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
