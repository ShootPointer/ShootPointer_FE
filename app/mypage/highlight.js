import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import { useRouter, Stack } from "expo-router";
import api from "../api/api"; // axios instance

// 하이라이트 카드 + 모달 컴포넌트
function HighlightItem({ item }) {
  const [modalVisible, setModalVisible] = useState(false);
  const cardVideoRef = useRef(null);   // 카드 미리보기용
  const modalVideoRef = useRef(null);  // 모달 전체화면용

  // 카드 영상 자동 재생 (무음)
  useEffect(() => {
    if (cardVideoRef.current) {
      cardVideoRef.current.playAsync();
      cardVideoRef.current.setStatusAsync({ isMuted: true, isLooping: true });
    }
  }, []);

  // 모달 열리면 재생, 닫으면 정지
  useEffect(() => {
    if (modalVisible && modalVideoRef.current) {
      modalVideoRef.current.playAsync();
    } else if (modalVideoRef.current) {
      modalVideoRef.current.stopAsync();
    }
  }, [modalVisible]);

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        {item.highlightUrl?.endsWith(".mp4") ? (
          <Video
            ref={cardVideoRef}
            source={{ uri: item.highlightUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: item.thumbnail || "https://via.placeholder.com/200" }}
            style={styles.thumbnail}
          />
        )}

        <View style={styles.info}>
          <Text style={styles.date}>{item.createdDate?.slice(0, 10) || "날짜 없음"}</Text>
          <Text style={styles.title}>{item.title || "득점 하이라이트"}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <Video
            ref={modalVideoRef}
            source={{ uri: item.highlightUrl }}
            style={{ flex: 1 }}
            useNativeControls
            resizeMode="contain"
            shouldPlay
            isLooping
            posterSource={{ uri: item.thumbnail }}
            usePoster
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 40, left: 20 }}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: "#fff", fontSize: 20 }}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// 전체 화면
export default function HighlightScreen() {
  const router = useRouter();
  const [highlights, setHighlights] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // API 호출
  const fetchHighlights = async (loadMore = false) => {
    if (loadingMore || (!hasMore && loadMore)) return;
    setLoadingMore(true);

    try {
      const res = await api.get("/api/highlight/list", {
        params: { page: loadMore ? page + 1 : 0, size: 10 },
      });

      if (res.data?.success) {
        const newItems = res.data.data?.content || [];
        setHighlights((prev) => (loadMore ? [...prev, ...newItems] : newItems));
        setPage(loadMore ? page + 1 : 0);
        if (newItems.length < 10) setHasMore(false);
      } else {
        Alert.alert("오류", "하이라이트 데이터를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("❌ 하이라이트 조회 오류:", err);
      Alert.alert("오류", "하이라이트 조회 중 문제가 발생했습니다.");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHighlights(false);
  }, []);

  const renderItem = ({ item }) => <HighlightItem item={item} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>하이라이트 목록</Text>
        </View>

        <FlatList
          data={highlights}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.highlightId)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={() => fetchHighlights(true)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore && <ActivityIndicator size="large" color="#ff6a33" style={{ marginVertical: 20 }} />
          }
        />

        {highlights.length === 0 && !loadingMore && (
          <Text style={styles.emptyText}>등록된 하이라이트가 없습니다.</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", paddingHorizontal: 16 },
  header: { marginTop: 60, marginBottom: 15, flexDirection: "row", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  listContent: { paddingBottom: 30 },
  row: { justifyContent: "space-between", marginBottom: 15 },

  card: { width: "48%", backgroundColor: "#1e1e1e", borderRadius: 10, overflow: "hidden" },
  video: { width: "100%", height: 120 },
  thumbnail: { width: "100%", height: 120 },

  info: { padding: 8 },
  date: { color: "#bbb", fontSize: 12 },
  title: { color: "#fff", fontSize: 14, fontWeight: "bold", marginTop: 2 },

  emptyText: { color: "#aaa", textAlign: "center", marginTop: 100 },

  backButton: { position: "absolute", top: 55, left: 20, zIndex: 10 },
  backIcon: { width: 28, height: 28, tintColor: "#fff" },
});
