import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import * as Device from 'expo-device';
import ConfirmModal from './ConfirmModal';
import api from './api/api';
import messaging from '@react-native-firebase/messaging';

export default function SettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const enabled = fcmToken !== null;
      setNotificationsEnabled(enabled);
      console.log('📱 알림 설정:', enabled ? 'ON' : 'OFF');
    } catch (error) {
      console.error('❌ 알림 설정 로드 실패:', error);
    }
  };

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
    console.log('🔔 모달 표시:', action);
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

  const registerFCMToken = async () => {
    try {
      if (!Device.isDevice) {
        Alert.alert('실제 디바이스에서만 알림을 받을 수 있습니다.');
        return null;
      }

      const fcmToken = await messaging().getToken();
      if (!fcmToken) {
        Alert.alert('FCM 토큰을 가져올 수 없습니다.');
        return null;
      }

      await AsyncStorage.setItem('fcmToken', fcmToken);
      await AsyncStorage.setItem('notificationsEnabled', 'true');
      setNotificationsEnabled(true);
      console.log('✅ FCM 토큰 발급:', fcmToken.substring(0, 20) + '...');
      showToast();

      return fcmToken;
    } catch (error) {
      console.error('❌ FCM 토큰 발급 실패:', error);
      Alert.alert('알림 설정 중 오류가 발생했습니다.');
      return null;
    }
  };

  const deleteFCMToken = async () => {
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      if (fcmToken) {
        await messaging().deleteToken();
        await AsyncStorage.removeItem('fcmToken');
        await AsyncStorage.setItem('notificationsEnabled', 'false');
        console.log('🗑️ FCM 토큰 삭제 완료');
      }
      setNotificationsEnabled(false);
      showToast();
    } catch (error) {
      console.error('❌ FCM 토큰 삭제 실패:', error);
    }
  };

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

  const handleConfirm = async () => {
    console.log('\n=== 작업 시작:', modalAction, '===');
    setModalVisible(false);

    try {
      if (modalAction === 'logout') {
        console.log('🚪 로그아웃 처리 중...');
        
        // 1. FCM 토큰 삭제
        await deleteFCMToken();
        
        // 2. AsyncStorage 확인
        const beforeToken = await AsyncStorage.getItem('accessToken');
        console.log('🔑 삭제 전 토큰:', beforeToken ? '있음' : '없음');
        
        // 3. 토큰 삭제
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        
        // 4. 삭제 확인
        const afterToken = await AsyncStorage.getItem('accessToken');
        console.log('🔑 삭제 후 토큰:', afterToken ? '있음 (삭제실패!)' : '없음 (삭제성공)');
        
        // 5. 모든 키 확인
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('📦 남은 키들:', allKeys);
        
        console.log('➡️ /login으로 이동 시도');
        
        // 여러 방법 시도
        try {
          router.replace('/login');
          console.log('✅ router.replace 호출 완료');
        } catch (routerError) {
          console.error('❌ router.replace 실패:', routerError);
          // 대안
          router.push('/login');
        }
        
      } else if (modalAction === 'delete') {
        console.log('🗑️ 회원 탈퇴 처리 중...');
        
        const response = await api.delete('/kakao');
        console.log('📥 탈퇴 응답:', response.data);
        
        if (response.data.success) {
          await deleteFCMToken();
          await AsyncStorage.clear();
          
          const allKeys = await AsyncStorage.getAllKeys();
          console.log('📦 clear 후 남은 키:', allKeys);
          
          console.log('➡️ /login으로 이동 시도');
          router.replace('/login');
        } else {
          console.error('❌ 탈퇴 실패:', response.data);
          Alert.alert('회원 탈퇴 실패', response.data.error?.message || '알 수 없는 오류');
        }
        
      } else if (modalAction === 'notification') {
        await handleNotificationToggle(false);
      }
      
      console.log('=== 작업 완료 ===\n');
      
    } catch (err) {
      console.error('\n❌❌❌ 작업 실패 ❌❌❌');
      console.error('에러:', err);
      console.error('스택:', err.stack);
      Alert.alert('오류', err.message || '작업 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            console.log('⬅️ 뒤로가기');
            router.back();
          }}>
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
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              console.log('🖱️ 로그아웃 버튼 클릭');
              showModal('logout');
            }}
          >
            <Text style={styles.buttonText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              console.log('🖱️ 회원탈퇴 버튼 클릭');
              showModal('delete');
            }}
          >
            <Text style={styles.buttonText}>회원 탈퇴</Text>
          </TouchableOpacity>
        </View>

        {/* ConfirmModal */}
        <ConfirmModal
          title={modalAction === 'logout' ? '로그아웃' : modalAction === 'delete' ? '회원탈퇴' : '알림 끄기'}
          visible={modalVisible}
          onConfirm={() => {
            console.log('✅ 모달 확인 버튼 클릭');
            handleConfirm();
          }}
          onCancel={() => {
            console.log('❌ 모달 취소 버튼 클릭');
            setModalVisible(false);
          }}
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