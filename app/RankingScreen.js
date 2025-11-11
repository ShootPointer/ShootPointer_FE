import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "./api/api"; 
import { Stack } from "expo-router";

const RankingScreen = () => {
  const [rankData, setRankData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("weekly"); // weekly / monthly

  useEffect(() => {
    fetchRanking(selectedTab);
  }, [selectedTab]);

  // ✅ 랭킹 데이터 가져오기 (공통 api 훅 사용)
  const fetchRanking = async (type) => {
    setLoading(true);
    try {

      const url =
        type === "weekly"
          ? "/api/rank/this-week"
          : "/api/rank/this-month";

      const response = await api.get(url);
      console.log("📥 서버 응답:", response.data);

      if (response.data.success && response.data.data?.rankingList) {
        setRankData(response.data.data.rankingList);
      } else {
        setRankData([]);
        Alert.alert("불러오기 실패", response.data.message || "데이터가 없습니다.");
      }
    } catch (error) {
      console.error("❌ 랭킹 불러오기 오류:", error);
      Alert.alert("오류", "서버와 연결할 수 없습니다.");
      setRankData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 각 항목 렌더링
  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.rankItem,
        index === 0
          ? styles.gold
          : index === 1
          ? styles.silver
          : index === 2
          ? styles.bronze
          : null,
      ]}
    >
      <Text style={styles.rank}>{item.rank || index + 1}</Text>
      <Image
        source={{
          uri: item.profileImg || "https://via.placeholder.com/40",
        }}
        style={styles.profile}
      />
      <Text style={styles.name}>{item.memberName || "익명"}</Text>
      <Text style={styles.score}>{item.totalScore ?? 0}</Text>
      <Text style={styles.detail}>{item.twoScore ?? 0}</Text>
      <Text style={styles.detail}>{item.threeScore ?? 0}</Text>
    </View>
  );

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
      
      <Text style={styles.title}>득점 랭킹</Text>
      <Text style={styles.subtitle}>주간 / 월간 슈터들을 확인해 보세요!</Text>

      {/* ✅ 탭 버튼 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "weekly" && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab("weekly")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "weekly" && styles.tabTextActive,
            ]}
          >
            주간 랭킹
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "monthly" && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab("monthly")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "monthly" && styles.tabTextActive,
            ]}
          >
            월간 랭킹
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 로딩 / 리스트 / 데이터 없음 처리 */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff6600" style={{ marginTop: 40 }} />
      ) : rankData.length === 0 ? (
        <Text style={{ color: "#aaa", textAlign: "center", marginTop: 40 }}>
          랭킹 데이터가 없습니다 😥
        </Text>
      ) : (
        <FlatList
          data={rankData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default RankingScreen;

// ⚙ 스타일 생략 (기존 코드 유지)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E0E",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#1F1F1F",
    borderRadius: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#FF6600",
  },
  tabText: {
    color: "#aaa",
    fontSize: 15,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 30,
  },
  rankItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  rank: {
    color: "#fff",
    width: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  name: {
    color: "#fff",
    flex: 1,
    fontSize: 16,
  },
  score: {
    color: "#FFD700",
    width: 50,
    textAlign: "center",
    fontWeight: "bold",
  },
  detail: {
    color: "#ccc",
    width: 40,
    textAlign: "center",
  },
  gold: { backgroundColor: "#3B2F00" },
  silver: { backgroundColor: "#2F2F2F" },
  bronze: { backgroundColor: "#3A1E00" },
});
