import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import api from "./api/api"; // axios 인스턴스

export default function HighlightScreen() {
  const router = useRouter();
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHighlights = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/highlight/list");
        setHighlights(response.data.data.content);
      } catch (error) {
        console.error("하이라이트 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  const handleSelect = (item) => {
    router.push({
      pathname: "/WriteScreen",
      params: { selectedHighlight: JSON.stringify(item) },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    
    <View style={styles.container}>
      
            <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>설정</Text>
          <View style={{ width: 28 }} />
        </View>

      <Text style={styles.header}>하이라이트 내역</Text>
      <FlatList
        data={highlights}
        keyExtractor={(item) => item.highlightId}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect(item)}
          >
            <Image
              source={{ uri: item.thumbnailUrl || item.highlightUrl }}
              style={styles.thumbnail}
            />
            <Text style={styles.date}>{item.createdAt}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {item.title || "제목제목제목"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 16 },
  header: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    margin: 6,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: 120,
  },
  date: {
    color: "#aaa",
    fontSize: 12,
    marginHorizontal: 8,
    marginTop: 6,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    margin: 8,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
