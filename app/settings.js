import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import ConfirmModal from './ConfirmModal';
import api from "./api/api";

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showToast = () => {
    setToastVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 1500);
    });
  };

  const showModal = (action) => {
    if (action === 'notification') {
      if (notificationsEnabled) {
        setModalAction('notification');
        setModalVisible(true);
      } else {
        setNotificationsEnabled(true);
        showToast();
      }
    } else {
      setModalAction(action);
      setModalVisible(true);
    }
  };

  const handleConfirm = async () => {
  setModalVisible(false);

  try {
    if (modalAction === 'logout') {
      // 로그아웃 처리
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      router.replace('/login');
    } else if (modalAction === 'delete') {
      // ✅ 회원 탈퇴 API 호출
      const response = await api.delete('/kakao'); // DELETE 형식, 엔드포인트 확인 필요
      console.log("✅ 회원탈퇴 API 성공:", response.data);

      if (response.data.success) {
        // 탈퇴 성공 시 로컬 데이터 삭제 후 로그인 화면 이동
        await AsyncStorage.clear();
        router.replace('/login');
      } else {
        alert("회원 탈퇴 실패: " + response.data.error?.message);
      }
    } else if (modalAction === 'notification') {
      setNotificationsEnabled(false);
      showToast();
    }
  } catch (err) {
    console.error("❌ 회원탈퇴 API 실패:", err);
    alert("회원 탈퇴 중 오류가 발생했습니다.");
  }
};
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

    <View style={styles.container}>
      {/* ✅ 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require("../assets/images/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 28 }} />
      </View>
        {/* 알림 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>
          <View style={styles.row}>
            <Text style={styles.label}>알림 받기</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={() => showModal('notification')}
              trackColor={{ false: '#ccc', true: '#FF7F50' }}
              thumbColor="#fff"
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

        {/* ConfirmModal */}
        <ConfirmModal
          title={
            modalAction === 'logout'
              ? '로그아웃'
              : modalAction === 'delete'
              ? '회원탈퇴'
              : '알림 끄기'
          }
          visible={modalVisible}
          onConfirm={handleConfirm}
          onCancel={() => setModalVisible(false)}
          message={
            modalAction === 'logout'
              ? '정말 로그아웃 하시겠습니까?'
              : modalAction === 'delete'
              ? '회원님의 하이라이트를 더는 볼 수 없다니 너무 아쉬워요...'
              : '다양한 소식과 각종 정보를 받지 못할 수 있어요'
          }
        />

        {/* ✅ 메시지 이미지 토스트 */}
        {toastVisible && (
          <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
            <Image
              source={
                notificationsEnabled
                  ? require('../assets/images/bell_on.png')
                  : require('../assets/images/bell_off.png')
              }
              style={styles.toastImage}
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    marginTop: 40,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  button: {
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  buttonText: {
    color: '#FF5A5F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toastImage: {
    width: 350,
  },
});
