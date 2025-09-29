import React, { useState } from "react";
import { View, Text, Button, Alert, Image, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const FrontendUpload = ({ jerseyNumber, frontImage }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // 실제 JWT 토큰과 멤버 ID 값으로 바꾸세요
  const JWT_TOKEN = "Bearer YOUR_JWT_TOKEN_HERE";
  const MEMBER_ID = "123";

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) setVideoFile(result.assets[0]);
  };

  const handleUpload = async () => {
  if (!videoFile) return Alert.alert("오류", "영상을 선택해주세요.");

  setIsUploading(true);
  setUploadResult(null);

  try {
    const formData = new FormData();

    if (Platform.OS === "web") {
      // 웹에서는 fetch로 blob 만들기
      const response = await fetch(videoFile.uri);
      const blob = await response.blob();
      formData.append("video", blob, "video.mp4");
    } else {
      // 모바일에서는 그대로 uri 사용
      formData.append("video", {
        uri: videoFile.uri,
        name: "video.mp4",
        type: "video/mp4",
      });
    }

    // 등번호와 촬영 사진도 같이
    formData.append("jerseyNumber", jerseyNumber);
    if (frontImage) {
      formData.append("frontImage", {
        uri: frontImage,
        name: "photo.jpg",
        type: "image/jpeg",
      });
    }

    const res = await axios.post(
      "http://your-server-address/upload",
      formData,
      {
        headers: {
          Authorization: JWT_TOKEN,
          "X-Member-Id": MEMBER_ID,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setUploadResult("✅ 업로드 성공: " + JSON.stringify(res.data));
  } catch (error) {
    console.error("❌ 오류:", error);
    Alert.alert("업로드 실패", error?.message || "오류 발생");
  } finally {
    setIsUploading(false);
  }
};


  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>등번호: {jerseyNumber}</Text>
      {frontImage && <Image source={{ uri: frontImage }} style={{ width: 330, height: 500, marginBottom: 10 }} />}
      
      <Button title="🎥 영상 선택" onPress={pickVideo} />
      <View style={{ height: 10 }} />
      <Button
        title={isUploading ? "업로드 중..." : "업로드"}
        onPress={handleUpload}
        disabled={isUploading}
      />

      {uploadResult && (
        <View style={{ marginTop: 20 }}>
          <Text>서버 응답:</Text>
          <Text>{uploadResult}</Text>
        </View>
      )}
    </View>
  );
};

export default FrontendUpload;
