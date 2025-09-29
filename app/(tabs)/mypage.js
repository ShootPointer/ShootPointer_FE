// app/(tabs)/mypage.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

// 더미 유저 데이터
const dummyUser = {
  id: 1,
  name: '홍길동',
  email: 'test@example.com',
  nickname: '슛포인터',
  profileImage: 'https://picsum.photos/200', // 랜덤 프로필
};

export default function MyPageScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 서버 대신 더미데이터 불러오기
    setUser(dummyUser);
  }, []);

  if (!user) return <Text style={{ color: '#fff' }}>로딩 중...</Text>;

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 + 설정 버튼 */}
      <View style={styles.header}>
        <Text style={styles.title}>마이페이지</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsText}>설정</Text>
        </TouchableOpacity>
      </View>

      {/* 프로필 섹션 */}
      <View style={styles.section}>
        <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        <Text style={styles.infoText}>이름: {user.name}</Text>
        <Text style={styles.infoText}>닉네임: {user.nickname}</Text>
        <Text style={styles.infoText}>이메일: {user.email}</Text>
      </View>

      {/* 활동 버튼 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 활동</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>좋아요한 글</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>저장한 글</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>게시한 글</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 히스토리 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>히스토리</Text>
        <Text style={styles.infoText}>최근 활동 기록 (예: 3시간 전 업로드)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#111111' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ccc' },
  settingsButton: { paddingHorizontal: 10, paddingVertical: 5 },
  settingsText: { color: '#6C63FF', fontWeight: 'bold', fontSize: 16 },
  section: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#FFFFFF' },
  infoText: { fontSize: 16, marginBottom: 5, color: '#FFFFFF' },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#333',
  },
  actionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});
