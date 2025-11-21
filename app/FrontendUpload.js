import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "./api/api";

import { useRouter } from "expo-router";
import DataLoader from "../components/ui/DataLoader.js";
import usePreview from "../hooks/usePreview.js";

// ⭐ SSE 대신 Polling 훅 사용
import { useProgressPolling } from "../hooks/useProgressPolling";

import { useVideoChunkUpload } from "../hooks/useVideoChunkUpload";

export default function FrontendUpload({ frontImage, jerseyNumber }) {
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState(null);
  const [videoSize, setVideoSize] = useState(null);
  const [videoUpload, setVideoUpload] = useState(false);
  const [videoOk, setVideoOk] = useState(false);
  const [jobId, setJobId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Polling 훅
  const { running, progressData, startPolling, stopPolling, reset } =
    useProgressPolling();

  const {
    loading: loadingHighlights,
    highlights,
    fetchHighlights,
  } = usePreview();

  const { uploading, progress, uploadVideoChunksExpo } = useVideoChunkUpload();

  /*───────────────────────────────
   * 초기 이미지 체크
   *───────────────────────────────*/
  useEffect(() => {
    if (!frontImage?.uri) {
      Alert.alert("오류", "촬영된 이미지가 없습니다.");
    }
  }, []);

  /*───────────────────────────────
   * Polling 완료 감지
   *───────────────────────────────*/
  useEffect(() => {
    if (progressData.type === "COMPLETE") {
      const loadHighlights = async () => {
        try {
          const highlightData = await fetchHighlights(jobId);

          setTimeout(() => {
            Alert.alert(
              "완료 🎬",
              `하이라이트 영상 ${highlightData.length}개가 생성되었습니다!\n\n미리보시겠습니까?`,
              [
                {
                  text: "아니요",
                  style: "cancel",
                  onPress: () => {
                    setShowModal(false);
                    stopPolling();
                    reset();
                  },
                },
                {
                  text: "예",
                  onPress: () => {
                    setShowModal(false);
                    stopPolling();
                    reset();

                    router.push({
                      pathname: "/HighlightCardModal",
                      params: {
                        post: false,
                        highlights: JSON.stringify(highlightData),
                      },
                    });
                  },
                },
              ]
            );
          }, 1000);
        } catch (err) {
          console.error("하이라이트 조회 실패:", err);
          Alert.alert("오류", "하이라이트 조회에 실패했습니다.");
        }
      };

      loadHighlights();
    }
  }, [progressData.type, jobId]);

  /*───────────────────────────────
   * 비디오 선택
   *───────────────────────────────*/
  const pickVideo = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileName = asset.fileName || asset.uri.split("/").pop();
        const stat = await FileSystem.getInfoAsync(asset.uri);
        const fileSize = stat.size;

        setVideoName(fileName);
        setVideoSize(fileSize);
        setVideoFile(asset);
      }
    } catch (err) {
      Alert.alert("비디오 오류", err.message);
    }
  };

  /*───────────────────────────────
   * Presigned URL
   *───────────────────────────────*/
  const getPresignedUrlFromServer = async () => {
    const res = await api.post("/api/pre-signed", {
      fileName: videoName,
      fileSize: videoSize,
    });

    const responseJobId = res.data.data.jobId;
    setJobId(responseJobId);

    return {
      signature: res.data.data.signature,
      jobId: responseJobId,
    };
  };

  /*───────────────────────────────
   * 비디오 업로드
   *───────────────────────────────*/
  const handleVideoUpload = async () => {
    if (!videoFile) {
      Alert.alert("오류", "비디오를 선택하세요.");
      return;
    }

    setVideoUpload(true);

    try {
      const { signature, jobId: newJobId } = await getPresignedUrlFromServer();

      // Polling 시작
      setShowModal(true);
      startPolling(newJobId);

      const response = await uploadVideoChunksExpo(
        videoFile,
        signature,
        videoName
      );

      if (!response.ok) {
        const text = await response.text();
        Alert.alert("오류", text);
        setShowModal(false);
        stopPolling();
      }
    } catch (err) {
      Alert.alert("업로드 실패", err.message);
      setShowModal(false);
      stopPolling();
    } finally {
      setVideoUpload(false);
    }
  };

  /*───────────────────────────────
   * 이미지 업로드
   *───────────────────────────────*/
  const handleUpload = async () => {
    if (!frontImage?.uri) {
      Alert.alert("오류", "촬영된 이미지가 없습니다.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("backNumberRequestDto", {
        string: JSON.stringify({ backNumber: Number(jerseyNumber) }),
        type: "application/json",
      });
      formData.append("image", {
        uri:
          Platform.OS === "ios"
            ? frontImage.uri.replace("file://", "")
            : frontImage.uri,
        name: frontImage.fileName || "photo.jpg",
        type: "image/jpeg",
      });

      const res = await api.post("/api/backNumber", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        Alert.alert("성공", "등번호 업로드 완료!");
        setVideoOk(true);
      }
    } catch (err) {
      Alert.alert("오류", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  /*───────────────────────────────
   * Progress 값
   *───────────────────────────────*/
  const progressValue = (() => {
    switch (progressData.type) {
      case "UPLOADING":
        return progressData.uploadProgress;
      case "UPLOAD_COMPLETE":
        return 100;
      case "PROCESSING":
        return progressData.highlightProgress;
      case "COMPLETE":
        return 100;
      default:
        return 0;
    }
  })();

  /*───────────────────────────────
   * 진행률 모달
   *───────────────────────────────*/
  if (showModal) {
    return <DataLoader type={progressData.type} progress={progressValue} />;
  }

  /*───────────────────────────────
   * 화면 렌더링
   *───────────────────────────────*/
  return (
    <View style={{ padding: 20 }}>
      {!videoOk && (
        <>
          <Text style={{ color: "#fff", marginBottom: 10 }}>
            등번호: {jerseyNumber}
          </Text>

          <Image
            source={{ uri: frontImage.uri }}
            style={{
              width: 330,
              height: 500,
              marginBottom: 10,
              borderRadius: 8,
            }}
          />

          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.disabledButton]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>업로드</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {videoOk && (
        <>
          <TouchableOpacity style={styles.videoPickButton} onPress={pickVideo}>
            <Text style={styles.videoPickButtonText}>
              {videoFile ? "영상 변경" : "영상 선택"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, videoUpload && styles.disabledButton]}
            onPress={handleVideoUpload}
            disabled={videoUpload}
          >
            {videoUpload || uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>영상 업로드</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: "#ff6a33",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  uploadButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  disabledButton: { opacity: 0.5 },
  videoPickButton: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  videoPickButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
