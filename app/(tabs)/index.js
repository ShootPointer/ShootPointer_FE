// app/index.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export default function HomeScreen() {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        // 1️⃣ 임시 토큰 발급
        const res = await api.get("/api/test-member");
        const token = res.data?.data?.accessToken ?? res.data?.accessToken ?? res.data;
        if (token) {
          await AsyncStorage.setItem("accessToken", token);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log("[API] 임시 AccessToken 세팅 완료");
        }

        // 2️⃣ 임시 하이라이트 더미
        setHighlights([
          {
            id: "1",
            title: "이번 주 최고의 플레이!",
            description: "홍길동 선수의 3점 슛 🎯",
            media: "https://picsum.photos/400/300",
            type: "image",
          },
          {
            id: "2",
            title: "하이라이트 영상",
            description: "김철수 선수의 멋진 덩크!",
            media: "https://www.w3schools.com/html/mov_bbb.mp4",
            type: "video",
          },
        ]);

        // 3️⃣ 실제 API 호출 예시 (post 조회)
        // const postRes = await api.get("/api/post", { params: { size: 10 } });
        // console.log("게시물 조회:", postRes.data);

      } catch (err) {
        console.error("초기화 실패:", err);
      }
    };

    init();
  }, []);

  const renderHighlight = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.type === "image" ? (
        <Image source={{ uri: item.media }} style={styles.cardMedia} />
      ) : (
        <Video
          source={{ uri: item.media }}
          style={styles.cardMedia}
          useNativeControls
          resizeMode="cover"
          isLooping
        />
      )}
      <Text style={styles.cardDesc}>{item.description}</Text>
      <TouchableOpacity style={styles.cardButton}>
        <Text style={styles.cardButtonText}>더 보기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo2.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>내 정보</Text>
          <Text style={styles.infoContent}>홍길동님, 환영합니다!</Text>
          <Text style={styles.infoContent}>등번호: 23</Text>
          <Text style={styles.infoContent}>포지션: 가드</Text>
        </View>

        <View style={styles.bottomComponent}>
          <FlatList
            data={highlights}
            keyExtractor={(item) => item.id}
            renderItem={renderHighlight}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = {
  container: { flex: 1, backgroundColor: "#111111" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 40,
    marginBottom: 20,
  },
  logo: { marginTop: 30, width: 120, height: 40 },
  bottomArea: { flex: 1, justifyContent: "flex-end", paddingBottom: 20 },
  infoCard: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "center",
    width: 350,
    height: 350,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6a33",
    marginBottom: 10,
  },
  infoContent: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  bottomComponent: {
    height: 250,
    paddingVertical: 10,
  },
  card: {
    width: 300,
    backgroundColor: "#000",
    borderRadius: 12,
    marginHorizontal: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  cardMedia: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
  cardDesc: { color: "#ddd", marginBottom: 10 },
  cardButton: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#ff6a33",
    alignItems: "center",
  },
  cardButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
};
