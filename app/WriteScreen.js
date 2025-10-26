import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import api from "./api/api";

export default function WriteScreen({ route, navigation }) {
const { posts = [], setPosts = () => {} } = route?.params || {};

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTag, setSelectedTag] = useState("TWO_POINT");

  // 더미 하이라이트 ID
  const dummyHighlight = { id: "8fa1a1E4-8f33-f725-f7dE-Acd95A5bFbba" };

  const handleSubmit = async () => {
    console.log("▶ handleSubmit 호출");
    console.log("제목:", title);
    console.log("내용:", description);
    console.log("선택 하이라이트:", dummyHighlight.id);

    if (!title.trim() || !description.trim()) {
      Alert.alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      console.log("▶ POST 요청 보내는 중...");
      const response = await api.post("/api/post", {
        highlightId: dummyHighlight.id,
        title,
        content: description,
        hashTag: selectedTag,
      });
      console.log("▶ 서버 응답:", response.data);

      if (response.data.success) {
        Alert.alert("업로드 완료", "게시물이 등록되었습니다.");

        const newPost = {
          postId: dummyHighlight.id,
          author: "익명",
          title,
          description,
          type: "image",
          media: "https://picsum.photos/400/300", // 임시 이미지
          likes: 0,
          likedByMe: false,
          hashTag: selectedTag,
        };

        setPosts([newPost, ...posts]);
        navigation.goBack();
      } else {
        Alert.alert("업로드 실패", response.data?.error?.message || "서버 오류");
      }
    } catch (err) {
      console.error("▶ POST 요청 실패:", err);
      Alert.alert("오류", "서버와 연결할 수 없습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="제목"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="내용"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 150, textAlignVertical: "top" }]}
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
  input: { backgroundColor: "#222", color: "#fff", padding: 12, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: "#ff6a33", padding: 15, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
