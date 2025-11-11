import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "./api/api";

export default function WriteScreen() {
  const router = useRouter();
  const { selectedHighlight } = useLocalSearchParams();

  const [highlight, setHighlight] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashTag, setHashTag] = useState("TWO_POINT");

  // ✅ 더미 하이라이트 (임시 테스트용)
  useEffect(() => {
    if (selectedHighlight) {
      try {
        setHighlight(JSON.parse(selectedHighlight));
      } catch (e) {
        console.error("하이라이트 파싱 오류:", e);
      }
    } else {
      // ✅ 하이라이트가 없을 때 더미값 자동 지정
      setHighlight({
        highlightId: 999,
        thumbnailUrl: "https://picsum.photos/400/300", // 테스트용 이미지
        highlightUrl: "https://picsum.photos/400/300",
      });
    }
  }, [selectedHighlight]);

  const handlePost = async () => {
    if (!highlight)
      return Alert.alert("오류", "하이라이트를 선택해주세요!");
    if (!title.trim() || !content.trim())
      return Alert.alert("입력 오류", "제목과 내용을 모두 입력해주세요.");

    try {
      const body = {
        highlightId: highlight.highlightId,
        title,
        content,
        hashTag,
      };
      const response = await api.post("/api/post", body);
      if (response.data?.success) {
        Alert.alert("성공", "게시글이 등록되었습니다!");
        router.push("/community");
      } else throw new Error("응답 실패");
    } catch (error) {
      console.error("게시 실패:", error);
      Alert.alert("오류", "게시글 등록 실패");
    }
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}

      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>새 게시물</Text>
            <View style={{ width: 20 }} />
          </View>

          {/* 하이라이트 이미지 */}
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => router.push("/HighlightScreen")}
            >
              <Text style={styles.buttonText}>하이라이트 선택하기</Text>
            </TouchableOpacity>
          

          {/* 제목 */}
          <TextInput
            placeholder="제목을 입력하세요"
            placeholderTextColor="#999"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          {/* 내용 */}
          <TextInput
            placeholder="내용을 입력하세요"
            placeholderTextColor="#999"
            style={[styles.input, { height: 120 }]}
            value={content}
            onChangeText={setContent}
            multiline
          />

          {/* 해시태그 */}
          <View style={styles.hashTagContainer}>
            {["TWO_POINT", "THREE_POINT"].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  hashTag === tag && styles.selectedTag,
                ]}
                onPress={() => setHashTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    hashTag === tag && styles.selectedTagText,
                  ]}
                >
                  #{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ✅ 하단 버튼이 키보드 위로 따라 올라감 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>게시하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    marginBottom: 10,
  },
  closeText: { color: "#fff", fontSize: 20 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginVertical: 8,
  },
  hashTagContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  tagButton: {
    borderWidth: 1,
    borderColor: "#FF6B00",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  tagText: { color: "#FF6B00" },
  selectedTag: { backgroundColor: "#FF6B00" },
  selectedTagText: { color: "#fff" },
  footer: {
    backgroundColor: "black",
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  postButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom:50,
  },
  postButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
