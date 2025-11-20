import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Video } from "expo-av";
import api from "../api/api"; // API instance

export default function EditPostScreen() {
  const router = useRouter();
  const { postId, title, content, hashTag, media, type } = useLocalSearchParams();

  const [editTitle, setEditTitle] = useState(title || "");
  const [editContent, setEditContent] = useState(content || "");
  const [selectedTag, setSelectedTag] = useState(hashTag || "TWO_POINT");
const isVideo = media && /\.mp4($|\?)/.test(media);

  // ✅ 수정 완료
  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      Alert.alert("알림", "제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await api.put(`/api/post/${postId}`, {
        title: editTitle,
        content: editContent,
        hashTag: selectedTag,
      });

      if (response.status === 200) {
        Alert.alert("수정 완료", "게시물이 수정되었습니다.", [
          { text: "확인", onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      console.error("게시물 수정 실패:", err);
      Alert.alert("오류", "게시물 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#111" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* 상단 헤더 */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={require("../../assets/images/back.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>게시물 수정</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* 콘텐츠 영역 */}
          <View style={styles.content}>
            {/* 이미지/영상 미리보기 */}
            {type === "image" ? (
              <Image source={{ uri: media }} style={styles.media} />
            ) : (
              <Video
                source={{ uri: media }}
                style={styles.media}
                useNativeControls
                isLooping
                shouldPlay
                resizeMode="cover"
              />
            )}

            {/* 제목 */}
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="제목을 입력하세요"
              placeholderTextColor="#666"
            />

            {/* 내용 */}
            <Text style={styles.label}>내용</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#666"
              multiline
            />

            {/* 해시태그 선택 */}
            <Text style={styles.label}>해시태그</Text>
            <View style={styles.hashTagContainer}>
              {["TWO_POINT", "THREE_POINT"].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagButton,
                    selectedTag === tag && styles.selectedTag,
                  ]}
                  onPress={() => setSelectedTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTag === tag && styles.selectedTagText,
                    ]}
                  >
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 버튼 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>수정 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#111",
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backIcon: { width: 24, height: 24, tintColor: "#fff" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { paddingHorizontal: 20, marginTop: 20 },
  media: { width: "100%", height: 200, borderRadius: 12, marginBottom: 20 },
  label: { color: "#fff", fontSize: 16, marginBottom: 6 },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
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
  buttonContainer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  button: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  saveButton: { backgroundColor: "#ff6a33" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
