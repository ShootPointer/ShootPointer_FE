// app/CommentScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
} from "react-native";
import api from "./api/api";
import { useLocalSearchParams } from "expo-router";

// 댓글 아이템 최적화
const CommentItem = React.memo(({ item, onDelete }) => (
  <View style={styles.commentItem}>
    <View style={{ flex: 1 }}>
      <Text style={styles.commentAuthor}>{item.memberName}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentDate}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
    <TouchableOpacity onPress={() => onDelete(String(item.commentId))}>
      <Text style={styles.deleteText}>삭제</Text>
    </TouchableOpacity>
  </View>
));

export default function CommentScreen() {
  const params = useLocalSearchParams();
  const postId = params?.postId ? String(params.postId) : null;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // 🔥 키보드 높이 상태
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 댓글 조회
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/comment/${postId}`);
      if (res.data.success) setComments(res.data.data || []);
      else {
        setComments([]);
        Alert.alert("댓글 조회 실패", res.data.msg || "댓글을 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("댓글 조회 오류:", err);
      Alert.alert("오류", "댓글 조회 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim() || !postId) return;
    setSending(true);
    try {
      const res = await api.post(`/api/comment`, {
        postId,
        content: newComment.trim(),
      });
      if (res.data.success) {
        setNewComment("");
        fetchComments();
      } else {
        Alert.alert("댓글 작성 실패", res.data.msg || "다시 시도해주세요");
      }
    } catch (err) {
      console.error("댓글 작성 오류:", err);
      Alert.alert("오류", "댓글 작성 중 문제가 발생했습니다.");
    } finally {
      setSending(false);
    }
  };

  // 댓글 삭제
  // 댓글 삭제
const handleDeleteComment = useCallback((commentId) => {
  Alert.alert("삭제", "댓글을 삭제하시겠습니까?", [
    { text: "취소", style: "cancel" },
    {
      text: "삭제",
      style: "destructive",
      onPress: async () => {
        try {
          const res = await api.delete(`/api/comment/${commentId}`);

          console.log("🔍 DELETE API RESPONSE:", res.status);

          // 🔥 PostDetailScreen 처럼 HTTP status 기반으로 판별
          if (res.status === 200 || res.status === 204) {
            setComments((prev) =>
              prev.filter((c) => String(c.commentId) !== commentId)
            );
          } else {
            Alert.alert("댓글 삭제 실패", "다시 시도해주세요");
          }
        } catch (err) {
          console.error("댓글 삭제 오류:", err);
          Alert.alert("오류", "댓글 삭제 중 문제가 발생했습니다.");
        }
      },
    },
  ]);
}, []);

  const renderItem = useCallback(
    ({ item }) => <CommentItem item={item} onDelete={handleDeleteComment} />,
    [handleDeleteComment]
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6a33" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.commentId)}
          contentContainerStyle={{ paddingVertical: 10, paddingBottom: keyboardHeight + 80 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      {/* 🔥 키보드에 따라 자연스럽게 올라오는 댓글 입력창 */}
      <View style={[styles.inputContainer, { bottom: keyboardHeight + 10 }]}>
        <TextInput
          style={styles.input}
          placeholder="하이라이트에 대한 댓글을 작성해 주세요!"
          placeholderTextColor="#888"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddComment}
          disabled={sending}
        >
          <Image
            source={require("../assets/images/Up_circle.png")}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: "#000" // ← 배경색 명확히
  },

  /* ====== 댓글 카드 ====== */
  commentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 20,        // ← 둥근 카드
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  commentAuthor: { 
    color: "#ffb400",        // ← PostDetailScreen의 hashtag 색상과 동일
    fontWeight: "bold",
    marginBottom: 3 
  },

  commentContent: { 
    color: "#fff", 
    fontSize: 14, 
    lineHeight: 20 
  },

  commentDate: { 
    color: "#888", 
    fontSize: 10, 
    marginTop: 6 
  },

  deleteText: {
    color: "#ff4444",
    fontSize: 13,
    marginLeft: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },

  /* ====== 입력창 ====== */
  inputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginBottom: 50,        // ← 동일
  },

  input: {
    flex: 1,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
  },

  sendButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "transparent",
  },

  sendIcon: { 
    width: 24, 
    height: 24, 
    tintColor: "#ff6a33"     // ← PostDetailScreen 포인트 컬러와 동일
  },

  /* ====== 뒤로가기 ====== */
  backButton: { 
    position: "absolute", 
    top: 40, 
    left: 15, 
    zIndex: 10 
  },
  backIcon: { 
    width: 28, 
    height: 28, 
    tintColor: "#fff" 
  },
});
