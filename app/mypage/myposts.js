// app/mypage/myposts.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import { useNavigation, useRoute } from "@react-navigation/native";
import { likePost, unlikePost, deletePost } from "../api/api";

export default function MyPostsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { posts: initialPosts, setPosts: setParentPosts } = route.params;

  const [posts, setPosts] = useState(initialPosts || []);

  const toggleLike = async (postId, liked) => {
    try {
      const res = liked ? await unlikePost(postId) : await likePost(postId);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
              : p
          )
        );
      }
    } catch (err) {
      console.error("좋아요 오류:", err);
    }
  };

  const handleEtcPress = (post) => {
    Alert.alert(
      "게시물 관리",
      "무엇을 하시겠습니까?",
      [
        {
          text: "수정",
          onPress: () =>
            navigation.navigate("WriteScreen", {
              post,
              posts,
              setPosts,
            }),
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => handleDelete(post.id),
        },
        { text: "취소", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async (postId) => {
    try {
      const res = await deletePost(postId);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setParentPosts((prev) => prev.filter((p) => p.id !== postId));
        Alert.alert("삭제 완료", "게시물이 삭제되었습니다.");
      } else {
        Alert.alert("삭제 실패", "게시물을 삭제하지 못했습니다.");
      }
    } catch (err) {
      console.error("삭제 오류:", err);
      Alert.alert("오류", "삭제 중 문제가 발생했습니다.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.post}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleEtcPress(item)}>
          <Image source={require("../../assets/images/etc.png")} style={styles.etcIcon} />
        </TouchableOpacity>
      </View>

      {item.type === "image" ? (
        <Image source={{ uri: item.media }} style={styles.media} />
      ) : (
        <Video source={{ uri: item.media }} style={styles.media} useNativeControls resizeMode="cover" isLooping />
      )}

      <Text style={styles.description}>{item.description}</Text>
      {item.hashTag ? <Text style={styles.hashtag}>{item.hashTag}</Text> : null}

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => toggleLike(item.id, item.likedByMe)}>
          <Image
            source={
              item.likedByMe
                ? require("../../assets/images/Filledheart.png")
                : require("../../assets/images/Heart.png")
            }
            style={styles.icon}
          />
          <Text style={styles.likeCount}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {posts.length === 0 ? (
        <Text style={styles.empty}>작성한 글이 없습니다.</Text>
      ) : (
        <FlatList data={posts} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 15 },
  post: { padding: 15, marginTop: 20, backgroundColor: "#000", borderRadius: 12 },
  title: { fontWeight: "bold", color: "#fff", fontSize: 16, marginBottom: 5 },
  media: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  description: { color: "#ddd", marginBottom: 5 },
  hashtag: { color: "#ffb400", marginBottom: 10 },
  bottomActions: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  iconButton: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  icon: { width: 22, height: 22, tintColor: "#fff" },
  likeCount: { color: "#fff", marginLeft: 4 },
  empty: { color: "#888", textAlign: "center", marginTop: 20 },
  etcIcon: { width: 24, height: 24, tintColor: "#fff" },
});
