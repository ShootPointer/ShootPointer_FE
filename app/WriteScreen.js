import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Video } from "expo-av";

export default function WriteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { posts, setPosts } = route.params;

  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null); // 이미지/영상 URI
  const [mediaType, setMediaType] = useState("image"); // image | video

  // 화면 진입 시 갤러리 자동 실행
  useEffect(() => {
    pickMedia();
  }, []);

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
      setMediaType(result.assets[0].type || "image");
    }
  };

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert("내용을 입력해주세요.");
      return;
    }

    try {
      const highlightId = "D33B27C7-DFF9-4D1a-EcFA-2A92EF25c1d7"; // 서버에서 발급받은 ID

      const response = await fetch("http://tkv00.ddns.net:9000/api/post", {
        method: "POST", // POST 방식으로 변경
        headers: {
          "Content-Type": "application/json",
          // 필요 시 Authorization 헤더 추가
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          highlightId: highlightId,
          title: "테스트 업로드",
          content: description,
          hashTag: "TWO_POINT",
        }),
      });

      const result = await response.json();
      console.log("서버 응답:", result);

      if (!result.success) {
        const message = result?.error?.message || "업로드 실패";
        Alert.alert("업로드 실패", message);
        return;
      }

      Alert.alert("업로드 완료", "서버에 성공적으로 업로드되었습니다.");

      // 로컬 posts 업데이트
      const newPost = {
        id: highlightId,
        author: "익명",
        type: mediaType === "video" ? "video" : "image",
        media: media || "https://picsum.photos/400/300",
        description,
        likes: 0,
        liked: false,
      };

      setPosts([newPost, ...posts]);
      navigation.goBack();
    } catch (error) {
      console.error("네트워크 에러:", error);
      Alert.alert("오류", "서버와 연결할 수 없습니다.");
    }
  };

  return (
    <View style={styles.container}>
      {media && (
        mediaType === "image" ? (
          <Image source={{ uri: media }} style={styles.preview} />
        ) : (
          <Video
            source={{ uri: media }}
            style={styles.preview}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )
      )}

      <TextInput
        placeholder="내용"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>등록</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#111" },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 350,
    textAlignVertical: "top",
  },
  preview: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff6a33",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
