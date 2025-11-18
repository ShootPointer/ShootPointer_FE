// PostDetailScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Keyboard,
} from "react-native";
import { Video } from "expo-av";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import api from "./api/api";

// 댓글 아이템
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

export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  // 🔥 키보드 높이 저장
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

  // 게시물 조회
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/post/${postId}`);
        if (res.data.success) setPost(res.data.data);
      } catch (err) {
        Alert.alert("오류", "게시물을 불러오는 중 문제 발생");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  // 댓글 조회
  const fetchComments = useCallback(async () => {
    try {
      setCommentLoading(true);
      const res = await api.get(`/api/comment/${postId}`);
      if (res.data.success) setComments(res.data.data);
    } catch (err) {
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
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
        Alert.alert("댓글 작성 실패");
      }
    } catch (err) {
      Alert.alert("오류", "댓글 작성 중 문제 발생");
    } finally {
      setSending(false);
    }
  };

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
          console.log("🔍 DELETE API RESPONSE:", res.status, res.data);

          // 백엔드가 204라면 → 성공
          if (res.status === 204) {
            console.log("댓글 삭제 성공 (204 No Content)");
            setComments((prev) =>
              prev.filter((c) => String(c.commentId) !== commentId)
            );
            return;
          }

          // success: true 형태일 때
          if (res.data?.success) {
            console.log("댓글 삭제 성공", commentId);
            setComments((prev) =>
              prev.filter((c) => String(c.commentId) !== commentId)
            );
          } else {
            console.log("댓글 삭제 실패:", res.data);
          }
        } catch (err) {
          console.log("댓글 삭제 오류:", err);
          Alert.alert("오류", "댓글 삭제 중 문제 발생");
        }
      },
    },
  ]);
}, []);

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#ff6a33" />;

  if (!post)
    return <Text style={{ color: "#fff" }}>게시물을 찾을 수 없습니다.</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 뒤로가기 */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require("../assets/images/back.png")} style={styles.backIcon} />
      </TouchableOpacity>

      <FlatList
        ListHeaderComponent={
          <View style={styles.container}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.author}>{post.memberName}</Text>

            {post.highlightUrl?.endsWith(".mp4") ? (
              <Video
                source={{ uri: post.highlightUrl }}
                style={styles.media}
                useNativeControls
                resizeMode="cover"
              />
            ) : (
              <Image source={{ uri: post.highlightUrl }} style={styles.media} />
            )}

            <Text style={styles.content}>{post.content}</Text>
            {post.hashTag && <Text style={styles.hashTag}>{post.hashTag}</Text>}

            <Text style={styles.commentTitle}>댓글</Text>

            {commentLoading && (
              <ActivityIndicator size="small" color="#ff6a33" />
            )}

            {comments.length === 0 && !commentLoading && (
              <Text style={{ color: "#aaa", marginBottom: 10 }}>댓글이 없습니다.</Text>
            )}
          </View>
        }
        data={comments}
        keyExtractor={(item) => String(item.commentId)}
        renderItem={({ item }) => (
          <CommentItem item={item} onDelete={handleDeleteComment} />
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      {/* 🔥 키보드 변화에 따라 자연스럽게 올라오는 댓글 입력창 */}
      <View style={[styles.inputContainer, { bottom: keyboardHeight + 10 }]}>
        <TextInput
          style={styles.input}
          placeholder="하이라이트 댓글을 작성해 주세요!"
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
  container: { flex: 1, padding: 20 ,marginTop:50},

  title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  author: { fontSize: 16, color: "#aaa", marginBottom: 12 },

  media: { width: "100%", height: 250, borderRadius: 10, marginBottom: 10 },

  content: { color: "#ddd", fontSize: 15, lineHeight: 22 },
  hashTag: { color: "#ffb400", marginTop: 10 },

  commentTitle: {
    color: "#ff6a33",
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },

  commentItem: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#1e1e1e",
  padding: 12,
  borderRadius: 20,      // ← 둥글게
  marginBottom: 12,
  marginHorizontal: 10,  // ← 좌우 넓게
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 3,
},
commentAuthor: { color: "#ffb400", fontWeight: "bold", marginBottom: 3 },
commentContent: { color: "#fff", fontSize: 14, lineHeight: 20 },
commentDate: { color: "#888", fontSize: 10, marginTop: 6 },
deleteText: {
  color: "#ff4444",
  fontSize: 13,
  marginLeft: 10,
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 10,
  backgroundColor: "rgba(255, 68, 68, 0.1)",
},

  // 🔥 키보드에 맞춰 부드럽게 이동하는 댓글 입력창
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
    marginBottom:50
  },

  input: {
    flex: 1,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  sendButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "transparent",
  },

  sendIcon: { width: 24, height: 24, tintColor: "#ff6a33" },

  backButton: { position: "absolute", top: 40, left: 15, zIndex: 10 },
  backIcon: { width: 28, height: 28, tintColor: "#fff" },
});
