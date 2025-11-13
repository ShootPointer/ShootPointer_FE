// app/mypage/liked.js
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
} from "react-native";
import { Video } from "expo-av";
import { Stack, useRouter } from "expo-router";
import api from "../api/api"; // ✅ 실제 axios 인스턴스 사용

export default function LikedScreen() {
  const router = useRouter();
  const PAGE_SIZE = 10;

  const [posts, setPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastPostId, setLastPostId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ 좋아요한 게시물 불러오기
  const fetchLikedPosts = async (isLoadMore = false) => {
    if (loadingMore) return;

    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const url = isLoadMore && lastPostId
        ? `/api/post/my/like?lastPostId=${lastPostId}`
        : `/api/post/my/like`;

      const response = await api.get(url);
      const resData = response.data?.data;
      console.log("✅ 좋아요한 게시물 불러오기 성공:", resData);

      if (resData?.postList?.length > 0) {
        if (isLoadMore) {
          setPosts((prev) => [...prev, ...resData.postList]);
        } else {
          setPosts(resData.postList);
        }
        setLastPostId(resData.lastPostId);
        if (resData.postList.length < PAGE_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ 좋아요 게시물 로드 실패:", err);
      Alert.alert("오류", "좋아요한 게시물을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLikedPosts();
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchLikedPosts(true);
  };

  // ✅ 좋아요 토글 (API 연결 시 수정 가능)
  const toggleLike = async (postId, liked) => {
    try {
      // 실제 API 호출 예시 (추후 연결)
      // if (liked) await api.delete(`/api/post/${postId}/like`);
      // else await api.post(`/api/post/${postId}/like`);

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
    } catch (err) {
      console.error("좋아요 처리 오류:", err);
    }
  };

  const goToComments = (postId) => {
    router.push({
      pathname: "/CommentScreen",
      params: { postId: String(postId) },
    });
  };

  const openPost = (postId) => {
    router.push({
      pathname: "/PostDetailScreen",
      params: { postId: String(postId) },
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openPost(item.postId)}>
      <View style={styles.post}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.memberName}</Text>

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
        {item.hashTag && <Text style={styles.hashtag}>{item.hashTag}</Text>}

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
              <Image
                source={require("../../assets/images/Comment.png")}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                Alert.alert("공유", "이 게시물의 링크를 복사했습니다!")
              }
            >
              <Image
                source={require("../../assets/images/Send.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <Image
              source={require("../../assets/images/back.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>좋아요한 게시물</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>좋아요한 게시물이 없습니다.</Text>
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
        <Text style={styles.headerTitle}>좋아요한 게시물</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.postId)}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && (
            <ActivityIndicator size="large" color="#ff6a33" style={{ margin: 20 }} />
          )
        }
        contentContainerStyle={{ padding: 15, paddingTop: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
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

  post: { padding: 15, backgroundColor: "#000", borderRadius: 12, marginTop: 20 },
  title: { fontWeight: "bold", color: "#fff", fontSize: 16, marginBottom: 5 },
  author: { fontWeight: "bold", color: "#fff", marginBottom: 5 },
  media: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  description: { color: "#ddd", marginBottom: 5 },
  hashtag: { color: "#ffb400", marginBottom: 10 },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  leftActions: { flexDirection: "row", alignItems: "center" },
  iconButton: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  icon: { width: 22, height: 22, tintColor: "#fff" },
  likeCount: { color: "#fff", marginLeft: 6 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#888", fontSize: 16 },
});
