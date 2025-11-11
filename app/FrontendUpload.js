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
      // 로그 찍으면서 값이 들어가는지 확인 ㄱㄱ -> ok
      const videoAsset = result.assets[0];
      setVideoName(videoAsset.fileName || videoAsset.uri.split("/").pop());
      setVideoSize(
        videoAsset.fileSize ??
          (await FileSystem.getInfoAsync(videoAsset.uri)).size
      );
      setVideoFile(videoAsset);
    }
    console.log("선택된 비디오:", videoFile);
    console.log("비디오 이름:", videoName);
    console.log("비디오 크기:", videoSize);
    setVideoSetting(false);
  };

  //pre-signed 발급 함수
  const getPresignedUrlFromServer = async () => {
    console.log("Presigned URL 요청 중...");
    try {
      console.log("비디오 이름:", videoName);
      console.log("비디오 크기:", videoSize);

      const response = await api.post("https://tkv00.ddns.net/api/pre-signed", {
        fileName: videoName,
        fileSize: videoSize,
      });
      if (response.status === 200) {
        console.log("Presigned URL 받음:", response.data.data.presignedUrl);
        return response.data.data.presignedUrl;
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
      const chunk = base64.slice(offset, offset + chunkSize);
      // console.log("chunk:", chunk);
      console.log(`청크 생성: ${offset} ~ ${offset + chunkSize}`);
      yield chunk;
      offset += chunkSize;
    }
  }

  // 영상 파이썬 서버로 전송하는 함스
  const uploadVideoToPython = async (presignedUrl, video) => {
    if (!video || !presignedUrl) return;
    console.log("비디오 업로드 시작...");

    let chunkIndex = 1;
    const videoInfo = await FileSystem.getInfoAsync(video.uri, { size: true });
    const totalParts = Math.ceil(videoInfo.size / (1024 * 1024 * 5));

    for await (const chunk of readFileInChunks(video.uri)) {
      console.log("업로드할 청크 길이:", chunk.length);
      const formData = new FormData();
      // chunk를 data URI 형식으로 넣기

      // formData.append("presignedToken", JSON.stringify(presignedUrl));
      formData.append("presignedToken", presignedUrl);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalParts", totalParts.toString());
      formData.append("fileName", videoName);
      console.log("python으로 보내는 formData:", formData);
      formData.append("file", chunk);
      // console.log("python으로 보내는 formData:", formData);
      try {
        // Axios로 전송
        const response = await fetch("http://tkv0011.ddns.net:8000/chunk", {
          method: "POST",

          body: formData,
        });
        console.log("서버 응답:", response);
        if (response.ok) {
          console.log(`Chunk ${chunkIndex} 업로드 완료 !`);
        } else {
          console.error(`Chunk ${chunkIndex} 서버 오류: `, response.status);
          break;
        }
      } catch (err) {
        console.error("업로드 실패", err);
        return { status: "error", message: err.message };
      }
      chunkIndex++;
    }
  };

  //비디오 업로드 함수
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

      // SSE 연결 => 리액트 네이티브에서 되는지 확인필요 합니다잉
      // const sse = new RNEventSource("https://tkv00.ddns.net/api/events");

      // sse.addEventListener("message", (event) => {
      //   console.log("서버 메시지:", event.data);
      // });

      // 파이썬 서버로 업로드, 전송 데이터는 얘기 맞춰봐야할듯
      const response = await uploadVideoToPython(presignedUrl, videoFile);
      if (response && response.status === "error") {
        Alert.alert("업로드 실패", response.message || "오류 발생");
      }
    } catch (error) {
      console.error("비디오 업로드 실패:", error);
      Alert.alert("업로드 실패", "비디오 업로드 중 오류발생ㅜ");
    } finally {
      setVideoUpload(false);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      const formData = new FormData();

      // if (Platform.OS === "web") {
      //   const response = await fetch(videoFile.uri);
      //   const blob = await response.blob();
      //   formData.append("video", blob, "video.mp4");
      // } else {
      //   formData.append("video", {
      //     uri: videoFile.uri,
      //     name: "video.mp4",
      //     type: "video/mp4",
      //   });
      // }

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
        console.log(res.data);
        Alert.alert("업로드 실패" || "오류 발생");
      }
    } catch (error) {
      console.error("❌ 오류:", error);
      console.log("catch문 안");
      Alert.alert("업로드 실패", error || "오류 발생");
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
                backgroundColor: videoSetting ? "#555" : "#ff6a33", // 비활성화시 어두운 회색, 활성화시 주황색
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

      {/* {uploadResult && (
        <View style={{ marginTop: 20 }}>
          <Text>서버 응답:</Text>
          <Text>{uploadResult}</Text>
        </View>
      )} */}
    </View>
  );
};

export default FrontendUpload;
