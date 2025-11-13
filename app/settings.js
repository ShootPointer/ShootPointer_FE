// app/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image, Animated, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import * as Device from 'expo-device';
import ConfirmModal from './ConfirmModal';
import api from './api/api';
import messaging from '@react-native-firebase/messaging';

// SettingsScreen
export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // 초기 알림 설정 로드
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const enabled = fcmToken !== null;
      setNotificationsEnabled(enabled);
      console.log('📱 알림 설정 로드:', enabled ? 'ON' : 'OFF');
      if (fcmToken) console.log('🔑 저장된 FCM 토큰:', fcmToken);
    } catch (error) {
      console.error('❌ 알림 설정 로드 실패:', error);
    }
  };

  // 토스트 표시
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

  // 모달 표시
  const showModal = (action) => {
    if (action === 'notification') {
      if (notificationsEnabled) {
        setModalAction('notification');
        setModalVisible(true);
      } else {
        handleNotificationToggle(true);
      }
    } else {
      setModalAction(action);
      setModalVisible(true);
    }
  };

  // FCM 토큰 발급 (Android 전용)
const registerFCMToken = async () => {
  try {
    if (!Device.isDevice) {
      Alert.alert('실제 디바이스에서만 알림을 받을 수 있습니다.');
      return null;
    }

    // FCM 토큰 발급
    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      Alert.alert('FCM 토큰을 가져올 수 없습니다.');
      return null;
    }

    await AsyncStorage.setItem('fcmToken', fcmToken);
    await AsyncStorage.setItem('notificationsEnabled', 'true');
    setNotificationsEnabled(true);
    console.log('✅ FCM 토큰 발급 완료:', fcmToken);
    showToast();

    return fcmToken;
  } catch (error) {
    console.error('❌ FCM 토큰 발급 실패:', error);
    Alert.alert('알림 설정 중 오류가 발생했습니다.');
    return null;
  }
};

// FCM 토큰 삭제 (Android 전용)
const deleteFCMToken = async () => {
  try {
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    if (fcmToken) {
      await messaging().deleteToken();
      await AsyncStorage.removeItem('fcmToken');
      await AsyncStorage.setItem('notificationsEnabled', 'false');
      console.log('🗑️ FCM 토큰 삭제 완료');
    } else {
      console.log('⚠️ 삭제할 FCM 토큰 없음');
    }
    setNotificationsEnabled(false);
    showToast();
  } catch (error) {
    console.error('❌ FCM 토큰 삭제 실패:', error);
  }
};

  // 알림 켜기/끄기
  const handleNotificationToggle = async (enable) => {
    try {
      if (enable) {
        await registerFCMToken();
      } else {
        await deleteFCMToken();
      }
    } catch (error) {
      console.error('❌ 알림 토글 실패:', error);
      Alert.alert('알림 설정 변경 실패');
    }
  };

  // ConfirmModal 확인 처리
  const handleConfirm = async () => {
    setModalVisible(false);

    try {
      if (modalAction === 'logout') {
        await deleteFCMToken();
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        router.replace('/login');
      } else if (modalAction === 'delete') {
        const response = await api.delete('/kakao');
        if (response.data.success) {
          await deleteFCMToken();
          await AsyncStorage.clear();
          router.replace('/login');
        } else {
          Alert.alert('회원 탈퇴 실패', response.data.error?.message || '');
        }
      } else if (modalAction === 'notification') {
        await handleNotificationToggle(false);
      }
    } catch (err) {
      console.error('❌ 작업 실패:', err);
      Alert.alert('작업 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
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
          title={modalAction === 'logout' ? '로그아웃' : modalAction === 'delete' ? '회원탈퇴' : '알림 끄기'}
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

        {/* 토스트 */}
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
  container: { flex: 1, backgroundColor: '#111111', paddingHorizontal: 20, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25, marginTop: 40 },
  backIcon: { width: 28, height: 28, tintColor: '#fff' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#FFFFFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#1A1A1A', borderRadius: 8 },
  label: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  button: { borderRadius: 8, marginBottom: 15, alignItems: 'flex-start' },
  buttonText: { color: '#FF5A5F', fontWeight: 'bold', fontSize: 16 },
  toastContainer: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
  toastImage: { width: 350 },
});
