// app/(tabs)/mypage/liked.js
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { Video } from "expo-av";

const dummyLikedPosts = [
  {
    id: "1",
    author: "홍길동",
    type: "image",
    media: "https://picsum.photos/400/300",
    description: "좋아요한 게시물 예시 🌟",
    likes: 5,
    liked: true,
  },
  {
    id: "2",
    author: "김철수",
    type: "video",
    media: "https://www.w3schools.com/html/mov_bbb.mp4",
    description: "동영상 예시 🎬",
    likes: 3,
    liked: true,
  },
];

export default function LikedScreen() {
  const [posts, setPosts] = useState(dummyLikedPosts);

  const toggleLike = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.post}>
      <Text style={styles.author}>{item.author}</Text>
      {item.type === "image" ? (
        <Image source={{ uri: item.media }} style={styles.media} />
      ) : (
        <Video source={{ uri: item.media }} style={styles.media} useNativeControls resizeMode="cover" isLooping />
      )}
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => toggleLike(item.id)}>
          <Text style={[styles.like, { color: item.liked ? "red" : "white" }]}>❤️ {item.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={posts} renderItem={renderItem} keyExtractor={(item) => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 15 },
  post: { padding: 15, marginBottom: 20, backgroundColor: "#000", borderRadius: 12 },
  author: { fontWeight: "bold", color: "#fff", marginBottom: 10 },
  media: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  description: { color: "#ddd", marginBottom: 10 },
  actions: { flexDirection: "row" },
  like: { fontSize: 14, marginRight: 15 },
});
