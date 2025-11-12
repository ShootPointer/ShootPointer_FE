import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Button,
  Image,
  Text,
  TouchableOpacity,
  View,
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

  const pickVideo = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Videos",
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const videoAsset = result.assets[0];
      setVideoName(videoAsset.fileName || videoAsset.uri.split("/").pop());
      setVideoSize(
        videoAsset.fileSize ??
          (await FileSystem.getInfoAsync(videoAsset.uri)).size
      );
      setVideoFile(videoAsset);
      setVideoSetting(false);
    }
  };

  //pre-signed 발급 함수
  const getPresignedUrlFromServer = async () => {
    console.log("Presigned URL 요청 중...");
    try {
      const response = await api.post("https://tkv00.ddns.net/api/pre-signed", {
        fileName: videoName,
        fileSize: videoSize,
      });
      if (response.status === 200) {
        console.log("Presigned URL 받음:", response.data.data.presignedUrl);
        return response.data.data.signature;
      }
    } catch (error) {
      console.error("Presigned URL 요청 실패:", error);
      throw error;
    }
  };

  const chunkSize = 5 * 1024 * 1024;

  // 파일 청크단위로 읽는 비동기 제너레이터
  async function* readFileInChunks(fileUri) {
    console.log("전체 파일 Base64 읽는 중...");
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
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

  // 🆕 청크 업로드 완료 및 병합 트리거 API
  const completeUpload = async (presignedToken, totalParts) => {
    try {
      // application/x-www-form-urlencoded 형식으로 데이터 준비
      const params = new URLSearchParams();
      params.append("presignedToken", presignedToken);
      params.append("totalParts", totalParts.toString());
      // params.append("fileName", videoName); // 선택적 파라미터

      console.log("Complete API 호출:", {
        presignedToken,
        totalParts,
      });

      const response = await fetch("http://tkv0011.ddns.net:8000/complete", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // ✅ 반드시 추가!
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

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      const formData = new FormData();

      const img = {
        uri: frontImage.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      };
      const backNumberData = {
        backNumber: Number(jerseyNumber),
      };
      console.log(backNumberData);
      formData.append("backNumberRequestDto", {
        string: JSON.stringify(backNumberData),
        type: "application/json",
      });

      formData.append("image", img);
      console.log("폼 데이터 준비 완료, 업로드 시작", formData);
      const res = await api.post(
        "https://tkv00.ddns.net/api/backNumber",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200 && res.data.success === true) {
        console.log(res.data);
        console.log("번호, 등 사진 업로드 성공");
        setVideoOk(true);
      } else {
        const errorMsg =
          res.data?.error?.message || "업로드 실패 (서버 응답 없음)";
        console.log("서버 응답 오류:", res.data);
        Alert.alert(errorMsg);
      }
    } catch (error) {
      console.error("❌ 오류:", error);
      console.log("catch문 안");
      Alert.alert(error.message || "업로드 실패");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {!videoOk && (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            등번호: {jerseyNumber}
          </Text>
          {frontImage && (
            <Image
              source={{ uri: frontImage.uri }}
              style={{ width: 330, height: 500, marginBottom: 10 }}
            />
          )}

          <View style={{ height: 10 }} />
          <Button
            title={isUploading ? "업로드 중..." : "업로드"}
            onPress={handleUpload}
            disabled={isUploading}
          />
        </>
      )}
      {videoOk && (
        <View style={{ marginTop: 20 }}>
          <Button title="🎥 영상 선택" onPress={pickVideo} />
          <View style={{ height: 10 }} />
          <TouchableOpacity
            style={[
              {
                backgroundColor: videoSetting ? "#555" : "#ff6a33",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              },
            ]}
            disabled={videoSetting}
            onPress={handleVideoUpload}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {videoUpload ? "업로드 중..." : "업로드"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default FrontendUpload;
