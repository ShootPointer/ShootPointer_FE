import React, { useState, useEffect } from "react";
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
import api from "../api/api"; // ✅ api 훅 사용 (axios instance)

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

  // ✅ 게시물 불러오기 (GET)
  const fetchPosts = async (isLoadMore = false) => {
    try {
      const url =
        isLoadMore && lastPostId
          ? `/api/post/mypage?lastPostId=${lastPostId}`
          : `/api/post/mypage`;

      const response = await api.get(url);
      const resData = response.data?.data;
    console.log("✅ API 요청 성공:", response.data);

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
    fetchPosts();
  }, []);

  // ✅ 무한 스크롤
  const loadMorePosts = () => {
    if (loadingMore || !lastPostId) return;
    setLoadingMore(true);
    fetchPosts(true);
  };

  // ✅ 좋아요 토글 (임시)
  const toggleLike = (postId) => {
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
  };

  // ✅ etc 클릭 시 모달 열기
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

  // ✅ 수정 페이지 이동
  const handleEdit = () => {
    if (!selectedPost) return;
    closeModal();
    router.push({
      pathname: "/mypage/editpost",
      params: {
        postId: selectedPost.postId,
        title: selectedPost.title,
        content: selectedPost.content,
        hashTag: selectedPost.hashTag,
      },
    });
  };

  // ✅ 삭제 (API 나중에 연결)
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
            setPosts((prev) =>
              prev.filter((p) => p.postId !== selectedPost.postId)
            );
            Alert.alert("삭제 완료", "게시물이 삭제되었습니다.");
          } catch (e) {
            Alert.alert("삭제 실패", "다시 시도해주세요.");
          }
        },
      },
    ]);
  };

  // ✅ 게시물 렌더링
  const renderItem = ({ item }) => (
    <View style={styles.post}>
      <Text style={styles.title}>{item.title}</Text>

      {item.highlightUrl?.endsWith(".mp4") ? (
        <Video
          source={{ uri: item.highlightUrl }}
          style={styles.media}
          useNativeControls
          resizeMode="cover"
          isLooping
        />
      ) : (
        <Image source={{ uri: item.highlightUrl }} style={styles.media} />
      )}

      <Text style={styles.description}>{item.content}</Text>
      <Text style={styles.hashtag}>#{item.hashTag}</Text>

      <View style={styles.bottomActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={() => toggleLike(item.postId)}
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
            onPress={() =>
              Alert.alert("댓글", "댓글 화면은 추후 연결 예정입니다.")
            }
          >
            <Image
              source={require("../../assets/images/Comment.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => Alert.alert("공유", "공유 기능은 준비 중입니다")}
          >
            <Image
              source={require("../../assets/images/Send.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleEtcPress(item)}>
          <Image
            source={require("../../assets/images/etc.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ff6a33" />
      </View>
    );
  }

  // ✅ 게시물 없을 때 문구 표시
  if (!loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require("../../assets/images/back.png")}
              style={styles.backIcon}
            />
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
          <Image
            source={require("../../assets/images/back.png")}
            style={styles.backIcon}
          />
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
          loadingMore && (
            <ActivityIndicator size="large" color="#ff6a33" style={{ margin: 20 }} />
          )
        }
      />

      {/* ✅ 수정/삭제 모달 */}
      {modalVisible && selectedPost && (
        <Modal transparent visible animationType="none">
          <TouchableOpacity
            activeOpacity={1}
            onPressOut={closeModal}
            style={styles.overlay}
          >
            <Animated.View style={[styles.modalBox, { top: slideAnim }]}>
              <TouchableOpacity onPress={handleEdit} style={styles.modalButton}>
                <Text style={styles.modalText}>게시물 수정</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity onPress={handleDelete} style={styles.modalButton}>
                <Text style={[styles.modalText, { color: "#ff4d4d" }]}>
                  게시물 삭제
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 15 },
  post: { padding: 15, backgroundColor: "#000", borderRadius: 12, marginTop: 20 },
  title: { fontWeight: "bold", color: "#fff", fontSize: 16, marginBottom: 5 },
  media: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  description: { color: "#ddd", marginBottom: 5 },
  hashtag: { color: "#ffb400", marginBottom: 10 },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: "#111111",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backIcon: { width: 28, height: 28, tintColor: "#fff" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#888", fontSize: 16 },
});
