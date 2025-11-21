/*
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api/api';

// 알림 표시 방식 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  // FCM 토큰 가져오기 및 서버에 전송
  async registerForPushNotifications() {
    try {
      // 실제 디바이스 체크
      if (!Device.isDevice) {
        console.log('에뮬레이터에서는 푸시 알림을 사용할 수 없습니다.');
        return null;
      }

      // 알림 권한 요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('알림 권한이 거부되었습니다.');
        return null;
      }

      // FCM 토큰 가져오기
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'com.znao.finalapp', // app.json의 projectId
      });
      
      const fcmToken = tokenData.data;
      console.log('✅ FCM 토큰 획득:', fcmToken);

      // 로컬에 저장
      await AsyncStorage.setItem('fcmToken', fcmToken);

      // 서버에 토큰 전송
      await this.sendTokenToServer(fcmToken);

      return fcmToken;
    } catch (error) {
      console.error('❌ FCM 토큰 등록 실패:', error);
      return null;
    }
  }

  // 서버에 FCM 토큰 전송
  async sendTokenToServer(fcmToken) {
    try {
      const response = await api.post('/notifications/register', {
        fcmToken: fcmToken,
        platform: Platform.OS,
        deviceInfo: {
          brand: Device.brand,
          modelName: Device.modelName,
          osVersion: Device.osVersion,
        }
      });
      
      console.log('✅ 서버에 FCM 토큰 전송 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 서버에 FCM 토큰 전송 실패:', error);
      throw error;
    }
  }

  // 알림 리스너 설정
  setupNotificationListeners() {
    // 앱이 포어그라운드에 있을 때 알림 수신
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 알림 수신:', notification);
      // 여기서 알림 데이터를 처리할 수 있습니다
    });

    // 사용자가 알림을 탭했을 때
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 알림 탭:', response);
      const data = response.notification.request.content.data;
      
      // 알림 데이터에 따라 특정 화면으로 이동
      if (data.screen) {
        // 예: router.push(data.screen);
      }
    });

    return {
      notificationListener,
      responseListener,
    };
  }

  // 리스너 정리
  removeNotificationListeners(listeners) {
    if (listeners.notificationListener) {
      Notifications.removeNotificationSubscription(listeners.notificationListener);
    }
    if (listeners.responseListener) {
      Notifications.removeNotificationSubscription(listeners.responseListener);
    }
  }

  // 서버에서 알림 설정 업데이트
  async updateNotificationSettings(enabled) {
    try {
      const response = await api.patch('/notifications/settings', {
        enabled: enabled
      });
      
      console.log('✅ 알림 설정 업데이트 성공:', response.data);
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
      return response.data;
    } catch (error) {
      console.error('❌ 알림 설정 업데이트 실패:', error);
      throw error;
    }
  }

  // 저장된 FCM 토큰 가져오기
  async getSavedToken() {
    try {
      const token = await AsyncStorage.getItem('fcmToken');
      return token;
    } catch (error) {
      console.error('❌ FCM 토큰 가져오기 실패:', error);
      return null;
    }
  }

  // 알림 설정 상태 가져오기
  async getNotificationSettings() {
    try {
      const enabled = await AsyncStorage.getItem('notificationsEnabled');
      return enabled ? JSON.parse(enabled) : true; // 기본값 true
    } catch (error) {
      console.error('❌ 알림 설정 가져오기 실패:', error);
      return true;
    }
  }

  // 로그아웃 시 서버에서 토큰 제거
  async unregisterToken() {
    try {
      const fcmToken = await this.getSavedToken();
      if (fcmToken) {
        await api.delete('/notifications/unregister', {
          data: { fcmToken }
        });
        await AsyncStorage.removeItem('fcmToken');
        console.log('✅ FCM 토큰 제거 성공');
      }
    } catch (error) {
      console.error('❌ FCM 토큰 제거 실패:', error);
    }
  }
}

export default new NotificationService();*/
