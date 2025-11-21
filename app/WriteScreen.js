import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import api from "./api/api";

export default function WriteScreen() {
  const router = useRouter();
  const { selectedHighlight } = useLocalSearchParams();

  const [highlight, setHighlight] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashTag, setHashTag] = useState("TWO_POINT");
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef(null);

  const TAG_OPTIONS = [
    { label: "2점슛", value: "TWO_POINT" },
    { label: "3점슛", value: "THREE_POINT" },
  ];

  useEffect(() => {
    if (selectedHighlight) {
      try {
        setHighlight(JSON.parse(selectedHighlight));
      } catch (e) {
        console.error("하이라이트 파싱 오류:", e);
      }
    }
  }, [selectedHighlight]);

  const handlePost = async () => {
    if (!highlight) return Alert.alert("오류", "하이라이트를 선택해주세요!");
    if (!title.trim() || !content.trim())
      return Alert.alert("입력 오류", "제목과 내용을 모두 입력해주세요.");

    try {
      const body = {
        highlightId: highlight.highlightId,
        title,
        content,
        hashTag,
      };
      console.log(body);
      const response = await api.post("/api/post", body);
      console.log(response);

      if (response.data?.success) {
        Alert.alert("성공", "게시글이 등록되었습니다!");
        router.push("/community");
      } else throw new Error("응답 실패");
    } catch (error) {
      console.error("게시 실패:", error);
      Alert.alert("오류", "게시글 등록 실패");
    }
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.log("Video playback error:", error);
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.container}>
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
              onPress={() => router.push("/CalendarScreen")}
            >
              <Text style={styles.buttonText}>하이라이트 선택하기</Text>
            </TouchableOpacity>

            {/* 비디오 미리보기 */}
            {highlight && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={togglePlay}
                style={{ position: "relative" }}
              >
                <Video
                  ref={videoRef}
                  source={{ uri: highlight.highlightUrl }}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={isPlaying}
                  isLooping={false}
                />
                {!isPlaying && (
                  <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={40} color="#ff6600" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            )}

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
              {TAG_OPTIONS.map((tag) => (
                <TouchableOpacity
                  key={tag.value}
                  style={[
                    styles.tagButton,
                    hashTag === tag.value && styles.selectedTag,
                  ]}
                  onPress={() => setHashTag(tag.value)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      hashTag === tag.value && styles.selectedTagText,
                    ]}
                  >
                    #{tag.label}
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
    marginBottom: 50,
  },
  postButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#000",
    marginBottom: 20,
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
