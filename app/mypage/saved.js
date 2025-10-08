// app/mypage/saved.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const dummySaved = [
  { id: "1", title: "전술 분석: 지역방어", author: "김코치" },
  { id: "2", title: "🏀 드리블 기술 모음", author: "박지성" },
];

export default function SavedPostsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummySaved}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>작성자: {item.author}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>저장한 글이 없습니다.</Text>
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
  author: { fontSize: 14, color: "#aaa" },
  empty: { color: "#888", textAlign: "center", marginTop: 20 },
});
