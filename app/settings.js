import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import ConfirmModal from './ConfirmModal'; // 모달 import

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // 알림 토글 상태

  const toggleSwitch = () => setNotificationsEnabled(previousState => !previousState);

  const showModal = (action) => {
    setModalAction(action);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    setModalVisible(false);
    if (modalAction === 'logout') {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      router.replace('/login');
    } else if (modalAction === 'delete') {
      await AsyncStorage.clear();
      router.replace('/login');
      // TODO: 서버 회원탈퇴 API 호출
    }
  };

  return (
    <View style={styles.container}>
      {/* 알림 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>
        <View style={styles.row}>
          <Text style={styles.label}>알림 받기</Text>
          <Switch
  value={notificationsEnabled}
  onValueChange={toggleSwitch}
  trackColor={{ false: '#ccc', true: '#FF7F50' }}
  thumbColor={notificationsEnabled ? '#fff' : '#fff'} // 켜도 끄도 흰색
/>

        </View>
      </View>

      {/* 기타 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기타</Text>
        <TouchableOpacity style={styles.button} onPress={() => showModal('logout')}>
          <Text style={styles.buttonText}>로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => showModal('delete')}>
          <Text style={styles.buttonText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </View>

      {/* 커스텀 모달 */}
      <ConfirmModal
        title={modalAction === 'logout' ? '로그아웃' : '회원탈퇴'}
        visible={modalVisible}
        onConfirm={handleConfirm}
        onCancel={() => setModalVisible(false)}
        message={
          modalAction === 'logout'
            ? '정말 로그아웃 하시겠습니까?'
            : '회원님의 하이라이트를 더는 볼 수 없다니 너무 아쉬워요...'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color:'#FFFFFF'
  },
 button: {
  borderRadius: 8,
  marginBottom: 15,
  alignItems: 'flex-start', // 왼쪽 정렬
},
buttonText: {
  color: '#FF5A5F', // 글자 색 강조
  fontWeight: 'bold',
  fontSize: 16,
},

});
