// notification.js
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

// 알림이 수신되었을 때 어떻게 처리할지 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * FCM 토큰 등록 함수
 * @returns {Object|null} { expoToken, fcmToken } 또는 null
 */
export async function registerForPushNotificationsAsync() {
  console.log("📱 알림 권한 요청 시작...");

  // Android 알림 채널 설정 (필수)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#ff6a33",
      sound: true,
    });
    console.log("✅ Android 알림 채널 생성 완료");
  }

  // 실제 디바이스인지 확인
  if (!Device.isDevice) {
    alert("실제 디바이스에서만 알림을 사용할 수 있습니다!");
    console.log("❌ 에뮬레이터에서는 FCM 사용 불가");
    return null;
  }

  try {
    // 1. 알림 권한 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    console.log("현재 권한 상태:", existingStatus);

    // 2. 권한이 없으면 요청
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("권한 요청 결과:", status);
    }

    // 3. 권한이 거부되면 종료
    if (finalStatus !== "granted") {
      alert("알림 권한이 필요합니다. 설정에서 권한을 허용해주세요.");
      console.log("❌ 알림 권한 거부됨");
      return null;
    }

    console.log("✅ 알림 권한 승인됨");

    // 4. Expo Push Token 가져오기
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    console.log("Project ID:", projectId);

    const expoTokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    console.log("📩 Expo Push Token:", expoTokenData.data);

    // 5. FCM Token 가져오기 (Android만)
    let fcmToken = null;
    if (Platform.OS === "android") {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      fcmToken = deviceToken.data;
      console.log("🔥 FCM Token:", fcmToken);
    }

    return {
      expoToken: expoTokenData.data,
      fcmToken: fcmToken || expoTokenData.data, // iOS는 expo token 사용
    };
  } catch (error) {
    console.error("❌ 토큰 등록 실패:", error);
    alert("알림 등록 중 오류가 발생했습니다: " + error.message);
    return null;
  }
}

/**
 * 로컬 알림 테스트용 (개발 중 테스트)
 */
export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "테스트 알림 📬",
      body: "FCM 토큰이 정상적으로 등록되었습니다!",
      data: { test: true },
    },
    trigger: { seconds: 2 },
  });
  console.log("✅ 테스트 알림 예약됨 (2초 후)");
}