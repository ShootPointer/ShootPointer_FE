import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import api from "./api/api";

const FrontendUpload = ({ jerseyNumber, frontImage }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [videoSize, setVideoSize] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [videoOk, setVideoOk] = useState(false);
  const [videoUpload, setVideoUpload] = useState(false);
  const [videoSetting, setVideoSetting] = useState(true);

  // frontImage 유효성 검사
  useEffect(() => {
    console.log("=== FrontendUpload 마운트 ===");
    console.log("등번호:", jerseyNumber);
    console.log("이미지:", frontImage);
    
    if (!frontImage) {
      console.error("❌ frontImage가 없습니다!");
      Alert.alert("오류", "촬영된 이미지가 없습니다.");
    } else if (!frontImage.uri) {
      console.error("❌ frontImage.uri가 없습니다!");
      Alert.alert("오류", "이미지 URI가 없습니다.");
    } else {
      console.log("✅ 이미지 URI:", frontImage.uri);
    }
  }, []);

  const pickVideo = async () => {
    try {
      console.log("📹 비디오 선택 시작");
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoAsset = result.assets[0];
        const fileName = videoAsset.fileName || videoAsset.uri.split("/").pop();
        
        // 파일 크기 확인
        let fileSize = videoAsset.fileSize;
        if (!fileSize) {
          const fileInfo = await FileSystem.getInfoAsync(videoAsset.uri);
          fileSize = fileInfo.size || 0;
        }

        console.log("✅ 비디오 선택:", fileName, fileSize, "bytes");
        setVideoName(fileName);
        setVideoSize(fileSize);
        setVideoFile(videoAsset);
        setVideoSetting(false);
      } else {
        console.log("⚠️ 비디오 선택 취소됨");
      }
    } catch (error) {
      console.error("❌ 비디오 선택 실패:", error);
      Alert.alert("오류", "비디오 선택 중 오류가 발생했습니다.");
    }
  };

  // pre-signed 발급 함수
  const getPresignedUrlFromServer = async () => {
    console.log("📤 Presigned URL 요청 중...");
    try {
      const response = await api.post("/api/pre-signed", {
        fileName: videoName,
        fileSize: videoSize,
      });
      
      if (response.status === 200 && response.data?.data?.signature) {
        console.log("✅ Presigned URL 받음");
        return response.data.data.signature;
      } else {
        throw new Error("Presigned URL 응답이 올바르지 않습니다");
      }
    } catch (error) {
      console.error("❌ Presigned URL 요청 실패:", error);
      throw error;
    }
  };

  const chunkSize = 5 * 1024 * 1024;

  // 파일 청크단위로 읽는 비동기 제너레이터
    async function* readFileInChunks(fileUri) {
        console.log("전체 파일 Base64 읽는 중...");
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'base64',
        });
        console.log("전체 Base64 읽기 완료:", base64.length, "bytes");
        let offset = 0;
        while (offset < base64.length) {
            let chunk = base64.slice(offset, offset + chunkSize);
            // 마지막 청크 padding 보정
            const pad = 4 - (chunk.length % 4);
            if (pad < 4) chunk += "=".repeat(pad);
            yield chunk;
            offset += chunkSize;
        }
    }

  // 영상 파이썬 서버로 전송하는 함수
    const uploadVideoToPython = async (presignedUrl, video) => {
        if (!video || !presignedUrl) return;
        console.log("비디오 업로드 시작...");

        // 청크를 먼저 배열로 읽기
        const chunks = [];
        for await (const chunk of readFileInChunks(video.uri)) {
            chunks.push(chunk);
        }

        const totalParts = chunks.length;
        console.log(`총 ${totalParts}개 청크 생성됨`);

        // 각 청크 업로드
        for (let chunkIndex = 1; chunkIndex <= totalParts; chunkIndex++) {
            const chunk = chunks[chunkIndex - 1];

            console.log(`업로드 중: ${chunkIndex}/${totalParts}`);
            const formData = new FormData();
            formData.append("presignedToken", presignedUrl);
            formData.append("chunkIndex", chunkIndex.toString());
            formData.append("totalParts", totalParts.toString());
            formData.append("fileName", videoName);
            formData.append("file", chunk);

            try {
                const response = await fetch("http://tkv0011.ddns.net:8000/chunk", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    console.log(`Chunk ${chunkIndex}/${totalParts} 업로드 완료!`);
                } else {
                    const errorText = await response.text();
                    console.error(
                        `Chunk ${chunkIndex} 오류:`,
                        response.status,
                        errorText
                    );
                    throw new Error(`Chunk ${chunkIndex} 업로드 실패`);
                }
            } catch (err) {
                console.error(`Chunk ${chunkIndex} 실패:`, err);
                throw err;
            }
        }

        // 🔥 모든 청크 업로드 완료 후 병합 요청
        console.log("모든 청크 업로드 완료, 병합 요청 중...");
        return await completeUpload(presignedUrl, totalParts);
    };

    // 청크 업로드 완료 및 병합 트리거 API
  const completeUpload = async (presignedToken, totalParts) => {
    try {
      const params = new URLSearchParams();
      params.append("presignedToken", presignedToken);
      params.append("totalParts", totalParts.toString());

      console.log("📤 Complete API 호출:", { presignedToken: presignedToken.substring(0, 20) + "...", totalParts });

      const response = await fetch("http://tkv0011.ddns.net:8000/complete", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: params.toString(),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ 병합 완료:", result);
        return { status: "success", data: result };
      } else {
        const errorText = await response.text();
        console.error("❌ 병합 요청 실패:", response.status, errorText);
        return { status: "error", message: errorText };
      }
    } catch (err) {
      console.error("❌ 병합 요청 중 오류:", err);
      return { status: "error", message: err.message };
    }
  };

  // 비디오 업로드 함수
    const handleVideoUpload = async () => {
        setVideoUpload(true);
        if (!videoFile) {
            Alert.alert("업로드 실패", "업로드할 비디오가 선택되지 않았습니다.");
            setVideoUpload(false);
            return;
        }

        try {
            // pre-signed URL 발급
            const presignedUrl = await getPresignedUrlFromServer();

            if (!presignedUrl) {
                Alert.alert("업로드 실패", "Pre-signed URL 못받음ㅜ");
                setVideoUpload(false);
                return;
            }

            // 파이썬 서버로 업로드 (청크 전송 + 병합 완료)
            const response = await uploadVideoToPython(presignedUrl, videoFile);

            if (response && response.status === "error") {
                Alert.alert("업로드 실패", response.message || "오류 발생");
            } else if (response && response.status === "success") {
                Alert.alert("업로드 완료", "비디오 처리가 시작되었습니다!");
                console.log("서버 응답:", response.data);
            }
        } catch (error) {
            console.error("비디오 업로드 실패:", error);
            Alert.alert(
                "업로드 실패",
                error.message || "비디오 업로드 중 오류발생ㅜ"
            );
        } finally {
            setVideoUpload(false);
        }
    };

  // 이미지 업로드 함수
  const handleUpload = async () => {
    if (isUploading) {
      console.log("⚠️ 이미 업로드 중");
      return;
    }

    // 이미지 유효성 재확인
    if (!frontImage || !frontImage.uri) {
      console.error("❌ frontImage가 유효하지 않습니다");
      Alert.alert("오류", "촬영된 이미지가 없습니다. 다시 촬영해주세요.");
      return;
    }

    setIsUploading(true);

    try {
      console.log("=== 이미지 업로드 시작 ===");
      console.log("등번호:", jerseyNumber);
      console.log("이미지 URI:", frontImage.uri);

      const formData = new FormData();

      // 이미지 객체 생성
      const img = {
        uri: Platform.OS === 'ios' ? frontImage.uri.replace('file://', '') : frontImage.uri,
        name: frontImage.fileName || "photo.jpg",
        type: frontImage.type || "image/jpeg",
      };

      const backNumberData = {
        backNumber: Number(jerseyNumber),
      };

      console.log("📤 전송 데이터:", backNumberData);
      
      formData.append("backNumberRequestDto", {
        string: JSON.stringify(backNumberData),
        type: "application/json",
      });

      formData.append("image", img);
      
      console.log("📤 업로드 시작...");
      const res = await api.post("/api/backNumber", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30초 타임아웃
      });

      console.log("📥 응답:", res.status, res.data);

      if (res.status === 200 && res.data.success === true) {

        console.log(res.data);
        Alert.alert("번호, 등 사진 업로드 성공");

        setVideoOk(true);
        Alert.alert("성공", "등번호 사진이 업로드되었습니다!");
      } else {
        const errorMsg = res.data?.error?.message || "업로드 실패 (서버 응답 없음)";
        console.error("❌ 서버 응답 오류:", res.data);
        Alert.alert("업로드 실패", errorMsg);
      }
    } catch (error) {
      console.error("❌ 업로드 오류:", error);
      console.error("상세:", error.response?.data || error.message);
      Alert.alert("업로드 실패", error.message || "업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // frontImage가 없으면 에러 표시
  if (!frontImage || !frontImage.uri) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>
          ❌ 촬영된 이미지가 없습니다
        </Text>
        <Text style={{ color: '#fff', marginTop: 10 }}>
          다시 시작 버튼을 눌러 재촬영해주세요
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      {!videoOk && (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10, color: '#fff' }}>
            등번호: {jerseyNumber}
          </Text>
          <Image
            source={{ uri: frontImage.uri }}
            style={{ width: 330, height: 500, marginBottom: 10, borderRadius: 8 }}
            resizeMode="cover"
          />

          <View style={{ height: 10 }} />
          <TouchableOpacity
            style={[
              styles.uploadButton,
              isUploading && styles.disabledButton
            ]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>업로드</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {videoOk && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#fff', fontSize: 16, marginBottom: 10 }}>
            ✅ 등번호 사진 업로드 완료!
          </Text>
          <Text style={{ color: '#aaa', fontSize: 14, marginBottom: 20 }}>
            이제 하이라이트 영상을 선택해주세요
          </Text>
          
          <TouchableOpacity 
            style={styles.videoPickButton} 
            onPress={pickVideo}
          >
            <Text style={styles.videoPickButtonText}>
              {videoFile ? "다른 영상 선택" : "영상 선택"}
            </Text>
          </TouchableOpacity>

          {videoFile && (
            <Text style={{ color: '#fff', marginTop: 10, textAlign: 'center' }}>
              선택된 영상: {videoName}
            </Text>
          )}

          <View style={{ height: 10 }} />
          <TouchableOpacity
            style={[
              styles.uploadButton,
              (videoSetting || videoUpload) && styles.disabledButton
            ]}
            disabled={videoSetting || videoUpload}
            onPress={handleVideoUpload}
          >
            {videoUpload ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>영상 업로드</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: "#ff6a33",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#ff6a33",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  disabledButton: { 
    backgroundColor: "#555",
    opacity: 0.6,
  },
  videoPickButton: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#3498db",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 5,
  },
  videoPickButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600" 
  },
});

export default FrontendUpload;