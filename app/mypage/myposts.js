// app/mypage/myposts.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const dummyMyPosts = [
  { id: "1", title: "내가 올린 첫 글", date: "2025-10-01" },
  { id: "2", title: "🔥 경기 리뷰", date: "2025-10-02" },
];

export default function MyPostsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummyMyPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>작성일: {item.date}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>작성한 글이 없습니다.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 15 },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontSize: 16, color: "#fff", fontWeight: "bold" },
  date: { fontSize: 14, color: "#aaa" },
  empty: { color: "#888", textAlign: "center", marginTop: 20 },
});
