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
  // const [uploadResult, setUploadResult] = useState(null);
  const [videoOk, setVideoOk] = useState(false);
  const [videoUpload, setVideoUpload] = useState(false);
  const [videoSetting, setVideoSetting] = useState(true);
  // const [presignedURL, setPresignedURL] = useState<String>("");
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

  // 파일 청크단위로 읽는 비동기 제너레이터
  async function* readFileInChunks(filePath) {
    const fileStat = await RNFS.stat(filePath);
    let offset = 0;

    while (offset < fileStat.size) {
      const length = Math.min(CHUNK_SIZE, fileStat.size - offset);
      const chunk = await RNFS.read(filePath, length, offset, "base64");
      yield chunk;
      offset += length;
    }
  }

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
      // 로그 찍으면서 값이 들어가는지 확인 필요
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
        return response.data.presignedUrl;
      }
    } catch (error) {
      console.error("Presigned URL 요청 실패:", error);
      throw error;
    }
  };

  const uploadVideoToPython = async (presignedUrl, video) => {
    if (!video || !presignedUrl) return;

    let chunkIndex = 0;

    for await (const chunk of readFileInChunks(video.uri)) {
      const buffer = Buffer.from(chunk, "base64");

      const formData = new FormData();
      formData.append("file", {
        uri: video.uri,
        type: video.type,
        name: video.name,
      });
      formData.append("presigned", JSON.stringify(presignedUrl));
      formData.append("chunkIndex", chunkIndex.toString());

      try {
        await axios.post("파이썬 주소 알고 넣기 ㄱㄱ", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(`Chunk ${chunkIndex} offset 업로드 완료 ㅎㅎ`);
      } catch (err) {
        console.error(`Chunk ${chunkIndex} offset 업로드 실패 ㅜ`, err);
        break;
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

      // 파이썬 서버로 업로드, 전송 데이터는 얘기 맞춰봐야할듯
      const response = await uploadVideoToPython(presignedUrl, videoData);
      if (response.status === 200) {
        console.log("비디오 업로드 완료");
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

      // 등번호와 촬영 사진도 같이
      formData.append(
        "backNumberRequestDto",
        JSON.stringify({ backNumber: Number(jerseyNumber) })
      );
      if (frontImage) {
        formData.append("image", {
          uri: frontImage,
          name: "photo.jpg",
          type: "image/jpeg",
        });
      }
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
      if (res.status === 200) {
        console.log("번호, 등 사진 업로드 성공:");
        setVideoOk(true);
      }

      // setUploadResult("✅ 업로드 성공: " + JSON.stringify(res.data));
    } catch (error) {
      console.error("❌ 오류:", error);
      Alert.alert("업로드 실패", error?.message || "오류 발생");
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
              source={{ uri: frontImage }}
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
