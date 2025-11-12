// app/(tabs)/index.js
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function HomeScreen() {
  const [highlights, setHighlights] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

useEffect(() => {
  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return; // 토큰 없으면 API 요청하지 않음

      const response = await api.get("/member/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data;

      setUserInfo({
        username: data.username,
        backNumber: data.backNumber,
        highlightCount: data.highlightCount,
        totalThreePoint: data.totalThreePoint,
        totalTwoPoint: data.totalTwoPoint,
      });

      const dummyHighlights = [
        { id: "1", title: "경기 하이라이트 1", type: "video", media: "https://www.w3schools.com/html/mov_bbb.mp4" },
        { id: "2", title: "경기 하이라이트 2", type: "video", media: "https://www.w3schools.com/html/mov_bbb.mp4" },
        { id: "3", title: "경기 하이라이트 3", type: "video", media: "https://www.w3schools.com/html/mov_bbb.mp4" },
      ];
      setHighlights(dummyHighlights);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchUserInfo();
}, []);

const renderHighlight = ({ item }) => (
  <View style={styles.highlightCard}>
    {item.type === "image" ? (
      <Image source={{ uri: item.media }} style={styles.highlightImage} />
    ) : (
      <Video
        source={{ uri: item.media }}
        style={styles.highlightImage}
        resizeMode="cover"
        useNativeControls
      />
    )}
    <Text style={styles.highlightTitle}>{item.title}</Text>
  </View>
);


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ff6a33" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/logo2.png")} style={styles.logo} />
        <TouchableOpacity onPress={() => router.push("/RankingScreen")}>
          <Ionicons name="flame-outline" size={26} color="#ff6a33" />
        </TouchableOpacity>
      </View>

      {userInfo && (
  <View style={styles.userCard}>
    <View style={styles.userTopRow}>
      <View>
        <Text style={styles.userName}>{userInfo.username} 님</Text>
        <Text style={styles.userMatchInfo}> 하이라이트 {userInfo.highlightCount}</Text>
      </View>
      <Text style={styles.userBackNumber}>No.{userInfo.backNumber}</Text>
    </View>

    <View style={styles.statsRow}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{userInfo.totalThreePoint}</Text>
        <Text style={styles.statLabel}>3점슛</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{userInfo.totalTwoPoint}</Text>
        <Text style={styles.statLabel}>2점슛</Text>
      </View>
    </View>
  </View>
)}

      {/* 주간 하이라이트 리스트 */}
      <View style={styles.highlightList}>
        <Text style={styles.sectionTitle}>   이 주의 하이라이트</Text>
        <FlatList
          data={highlights}
          keyExtractor={(item) => item.id}
          renderItem={renderHighlight}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = {
  container: { flex: 1, backgroundColor: "#111111", paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  logo: { width: 120, height: 40 },
    userCard: {
    backgroundColor: "#1c1c1c",
    borderRadius: 20,
    padding: 20,
    margin: 15,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    height:350,
    justifyContent: "space-between", // 상단과 하단 분리

  },
  userTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  userName: { fontSize: 20, fontWeight: "bold", color: "#ff6a33" },
  userMatchInfo: { fontSize: 14, color: "#aaa", marginTop: 2 },
  userBackNumber: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    paddingVertical: 15,
  },
  statBox: { alignItems: "center" },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statLabel: { color: "#aaa", fontSize: 14, marginTop: 2 },
  highlightCard: {
    marginRight: 10,
    width: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  highlightImage: { width: 180, height: 300, borderRadius: 12 ,margin:20,},
  highlightTitle: { color: "#fff", fontSize: 14, marginTop: 5, textAlign: "center" },
  sectionTitle:{ color: "#fff", fontSize: 18, marginTop: 5,},
};
