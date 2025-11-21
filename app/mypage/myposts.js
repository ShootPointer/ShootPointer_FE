import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import { Stack, useRouter } from "expo-router";
import api from "../api/api";

const { height } = Dimensions.get("window");

export default function MyPostsScreen() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastPostId, setLastPostId] = useState(null);

  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];

  // 📌 재생 중인 영상 관리
  const videoRefs = useRef({});
  const [activeVideoId, setActiveVideoId] = useState(null);

  const fetchPosts = async (isLoadMore = false) => {
    try {
      const url =
        isLoadMore && lastPostId
          ? `/api/post/mypage?lastPostId=${lastPostId}`
          : `/api/post/mypage`;

      const response = await api.get(url);
      const resData = response.data?.data;

      if (resData?.postList) {
        if (isLoadMore) {
          setPosts((prev) => [...prev, ...resData.postList]);
        } else {
          setPosts(resData.postList);
        }
        setLastPostId(resData.lastPostId);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("불러오기 실패", "게시물을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
  fetchPosts(); // 컴포넌트 마운트 시 실제 API 호출
}, []);
  const loadMorePosts = () => {
    if (loadingMore || !lastPostId) return;
    setLoadingMore(true);
    fetchPosts(true);
  };

  const toggleLike = async (postId, likedByMe) => {
    try {
      const result = likedByMe
        ? await api.delete(`/api/post/${postId}/like`)
        : await api.post(`/api/post/${postId}/like`);

      if (result.status === 200) {
        setPosts((prev) =>
          prev.map((p) =>
            p.postId === postId
              ? {
                  ...p,
                  likedByMe: !p.likedByMe,
                  likeCnt: p.likedByMe ? p.likeCnt - 1 : p.likeCnt + 1,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("좋아요 처리 오류:", err);
      Alert.alert("오류", "좋아요 처리 중 문제가 발생했습니다.");
    }
  };

  const goToComments = (postId) => {
    // 이동 전 영상 정지
    stopAllVideos();
    router.push({
      pathname: "/CommentScreen",
      params: { postId: String(postId) },
    });
  };

  const goToPostDetail = (postId, media) => {
    stopAllVideos(); // 이동 전 영상 정지

    router.push({
      pathname: "/PostDetailScreen",
      params: { postId, media, type: /\.mp4($|\?)/.test(media) ? "video" : "image" },
    });
  };

  const stopAllVideos = async () => {
    Object.values(videoRefs.current).forEach((v) => v?.stopAsync?.());
    setActiveVideoId(null);
  };

  const handleEtcPress = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: height - 200,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setModalVisible(false);
      setSelectedPost(null);
    });
  };

  const handleEdit = () => {
    if (!selectedPost) return;
    closeModal();

    stopAllVideos(); // 영상 정지
    router.push({
      pathname: "/mypage/editpost",
      params: {
        postId: selectedPost.postId,
        media: selectedPost.highlightUrl,
        type: /\.mp4($|\?)/.test(selectedPost.highlightUrl) ? "video" : "image",
      },
    });
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    closeModal();

    Alert.alert("삭제 확인", "정말 이 게시물을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await api.delete(`/api/post/${selectedPost.postId}`);
            if (response.status === 200) {
              setPosts((prev) =>
                prev.filter((p) => p.postId !== selectedPost.postId)
              );
              Alert.alert("삭제 완료", "게시물이 삭제되었습니다.");
            } else {
              Alert.alert("삭제 실패", "서버 응답이 올바르지 않습니다.");
            }
          } catch (e) {
            console.error("삭제 실패:", e);
            Alert.alert("삭제 실패", "서버와 통신 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isVideo = item.highlightUrl && /\.mp4($|\?)/.test(item.highlightUrl);

    return (
      <TouchableOpacity
        onPress={() => goToPostDetail(item.postId, item.highlightUrl)}
        activeOpacity={0.9}
      >
        <View style={styles.post}>
          <Text style={styles.title}>{item.title}</Text>

          {isVideo ? (
            <Video
              ref={(ref) => (videoRefs.current[item.postId] = ref)}
              source={{ uri: item.highlightUrl }}
              style={styles.media}
              useNativeControls
              resizeMode="cover"
              isLooping
              shouldPlay={activeVideoId === item.postId}
              onLoadStart={() => setActiveVideoId(item.postId)}
            />
          ) : (
            <Image source={{ uri: item.highlightUrl }} style={styles.media} />
          )}

          <Text style={styles.description}>{item.content}</Text>
          <Text style={styles.hashtag}>#{item.hashTag}</Text>

          <View style={styles.bottomActions}>
            <View style={styles.leftActions}>
              <TouchableOpacity
                onPress={() => toggleLike(item.postId, item.likedByMe)}
                style={styles.iconButton}
              >
                <Image
                  source={
                    item.likedByMe
                      ? require("../../assets/images/Filledheart.png")
                      : require("../../assets/images/Heart.png")
                  }
                  style={styles.icon}
                />
                <Text style={styles.likeCount}>{item.likeCnt}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => goToComments(item.postId)}
              >
                <Image source={require("../../assets/images/Comment.png")} style={styles.icon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => Alert.alert("공유", "공유 기능은 준비 중입니다")}
              >
                <Image source={require("../../assets/images/Send.png")} style={styles.icon} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleEtcPress(item)}>
              <Image source={require("../../assets/images/etc.png")} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ff6a33" />
      </View>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 게시물</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>게시물이 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 게시물</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.postId.toString()}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && <ActivityIndicator size="large" color="#ff6a33" style={{ margin: 20 }} />
        }
      />

      {modalVisible && selectedPost && (
        <Modal transparent visible animationType="none">
          <TouchableOpacity activeOpacity={1} onPressOut={closeModal} style={styles.overlay}>
            <Animated.View style={[styles.modalBox, { top: slideAnim }]}>
              <TouchableOpacity onPress={handleEdit} style={styles.modalButton}>
                <Text style={styles.modalText}>게시물 수정</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity onPress={handleDelete} style={styles.modalButton}>
                <Text style={[styles.modalText, { color: "#ff4d4d" }]}>게시물 삭제</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 15, marginBottom: 50 },
  post: { padding: 15, backgroundColor: "#000", borderRadius: 12, marginTop: 20 },
  title: { fontWeight: "bold", color: "#fff", fontSize: 16, marginBottom: 5 },
  media: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  description: { color: "#ddd", marginBottom: 5 },
  hashtag: { color: "#ffb400", marginBottom: 10 },
  bottomActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  leftActions: { flexDirection: "row", alignItems: "center" },
  iconButton: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  icon: { width: 22, height: 22, tintColor: "#fff" },
  likeCount: { color: "#fff", marginLeft: 4 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  modalButton: { paddingVertical: 14, width: "90%", alignItems: "center" },
  modalText: { color: "#fff", fontSize: 16 },
  separator: { height: 1, backgroundColor: "#333", width: "90%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 15, backgroundColor: "#111111" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backIcon: { width: 28, height: 28, tintColor: "#fff" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#888", fontSize: 16 },
});
