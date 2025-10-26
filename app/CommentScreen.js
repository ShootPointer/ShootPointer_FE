// app/CommentScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "./api/api"; // 경로: app 폴더에서 ../api/api 로 수정

// expo-router 훅으로 params 읽기
import { useLocalSearchParams } from "expo-router";

export default function CommentScreen() {
  const params = useLocalSearchParams();
  // expo-router로 들어오는 params는 문자열일 수 있으니 필요하면 변환
  const postId = params?.postId ? Number(params.postId) : null;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const fetchComments = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/comment/${postId}`);
      console.log("📥 댓글 조회 data:", res.data);
      if (res.data.success) {
        setComments(res.data.data.commentList || []);
      } else {
        Alert.alert("댓글 조회 실패", res.data.msg || "알 수 없는 오류");
      }
    } catch (err) {
      console.error("댓글 조회 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (newComment.trim() === "" || !postId) return;
    setSending(true);
    try {
      const res = await api.post(`/api/comment`, {
        postId,
        content: newComment.trim(),
      });

      console.log("✍️ 댓글 작성 응답:", res.data);

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

  const handleEditComment = async (commentId) => {
    if (editingText.trim() === "") return;

    try {
      const res = await api.patch(`/api/comment/${commentId}`, {
        content: editingText.trim(),
      });

      console.log("✏️ 댓글 수정 응답:", res.data);

      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.commentId === commentId ? { ...c, content: editingText } : c
          )
        );
        setEditingId(null);
        setEditingText("");
      } else {
        Alert.alert("댓글 수정 실패", res.data.msg || "다시 시도해주세요");
      }
    } catch (err) {
      console.error("댓글 수정 오류:", err);
      Alert.alert("오류", "댓글 수정 중 문제가 발생했습니다.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert("삭제", "댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await api.delete(`/api/comment/${commentId}`);
            console.log("🗑 댓글 삭제 응답:", res.data);

            if (res.data.success) {
              setComments((prev) =>
                prev.filter((c) => c.commentId !== commentId)
              );
            } else {
              Alert.alert("댓글 삭제 실패", res.data.msg || "다시 시도해주세요");
            }
          } catch (err) {
            console.error("댓글 삭제 오류:", err);
            Alert.alert("오류", "댓글 삭제 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isEditing = editingId === item.commentId;
    return (
      <View style={styles.commentItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentAuthor}>{item.memberName}</Text>

          {isEditing ? (
            <TextInput
              style={[styles.commentContent, styles.editInput]}
              value={editingText}
              onChangeText={setEditingText}
              autoFocus
              placeholder="수정할 내용을 입력하세요"
              placeholderTextColor="#aaa"
            />
          ) : (
            <Text style={styles.commentContent}>{item.content}</Text>
          )}
        </View>

        {isEditing ? (
          <>
            <TouchableOpacity onPress={() => handleEditComment(item.commentId)}>
              <Text style={styles.editSave}>저장</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingId(null);
                setEditingText("");
              }}
            >
              <Text style={styles.cancelEdit}>취소</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => {
                setEditingId(item.commentId);
                setEditingText(item.content);
              }}
            >
              <Text style={styles.editText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteComment(item.commentId)}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6a33" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item) => item.commentId.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor="#888"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddComment}
          disabled={sending}
        >
          <Text style={styles.sendText}>등록</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", paddingHorizontal: 10 },
  commentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: { color: "#ffb400", fontWeight: "bold", marginBottom: 3 },
  commentContent: { color: "#fff" },
  editInput: {
    backgroundColor: "#333",
    padding: 5,
    borderRadius: 5,
    color: "#fff",
    marginTop: 5,
  },
  editText: { color: "#55aaff", fontSize: 12, marginLeft: 10 },
  editSave: { color: "#4caf50", fontSize: 12, marginLeft: 10 },
  cancelEdit: { color: "#ff9800", fontSize: 12, marginLeft: 5 },
  deleteText: { color: "#ff5555", fontSize: 12, marginLeft: 10 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  input: { flex: 1, color: "#fff", paddingRight: 10 },
  sendButton: { backgroundColor: "#ff6a33", padding: 8, borderRadius: 6 },
  sendText: { color: "#fff", fontWeight: "bold" },
});
