import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "./api/api";

const RankingScreen = () => {
  const router = useRouter();
  const [rankData, setRankData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("weekly"); // weekly / monthly

  useEffect(() => {
    fetchRanking(selectedTab);
  }, [selectedTab]);

  const fetchRanking = async (type) => {
    setLoading(true);
    try {
      const url =
        type === "weekly" ? "/api/rank/this-week" : "/api/rank/this-month";

      const response = await api.get(url);
      console.log("📥 서버 응답:", response.data);

      if (response.data.success && response.data.data?.rankingList) {
        setRankData(response.data.data.rankingList);
      } else {
        setRankData([]);
        Alert.alert(
          "불러오기 실패",
          response.data.message || "데이터가 없습니다."
        );
      }
    } catch (error) {
      console.error("❌ 랭킹 불러오기 오류:", error);
      Alert.alert("오류", "서버와 연결할 수 없습니다.");
      setRankData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const bgStyle =
      index === 0
        ? styles.gold
        : index === 1
        ? styles.silver
        : index === 2
        ? styles.bronze
        : styles.normal;

    return (
      <View style={[styles.rankItem, bgStyle]}>
        <Text style={styles.rankNumber}>{index + 1}</Text>

<Image
        source={require("../assets/images/profileimage.png")}
        style={{ width: 50, height: 50, opacity: 1 }}
      />
        <Text style={styles.name}>{item.memberName || "익명"}</Text>

        <Text style={styles.score}>{item.totalScore ?? 0}</Text>
        <Text style={styles.detail}>{item.twoScore ?? 0}</Text>
        <Text style={styles.detail}>{item.threeScore ?? 0}</Text>
      </View>
    );
  };

  // --- 여기부터 추가된 부분: 컬럼 타이틀(헤더) ---
  const ListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <Text style={[styles.headerCell, styles.headerRank]}>순위</Text>

      {/* 이름(아바타 + 이름) 자리와 정렬을 위해 빈 공간 대신 '이름' 텍스트 넣음 */}
      <View style={[styles.headerCell, styles.headerNameWrap]}>
        <Text style={styles.headerNameText}>                이름</Text>
      </View>

      <Text style={[styles.headerCell, styles.headerScore]}>총득점</Text>
      <Text style={[styles.headerCell, styles.headerDetail]}>2점슛</Text>
      <Text style={[styles.headerCell, styles.headerDetail]}>3점슛</Text>
    </View>
  );
  // --- 추가 끝 ---

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../assets/images/back.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>득점 랭킹</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* 인트로 박스 */}
      <View style={styles.infoBox}>
        {/* 필요하면 icons 준비 */}
        <Image
          source={require("../assets/images/Ballpointer.png")}
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>주간 / 월간 슈터들을 확인해 보세요!</Text>
      </View>

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "weekly" && styles.tabActive,
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
            selectedTab === "monthly" && styles.tabActive,
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

      {/* 리스트 영역 + 헤더 표시 */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#ff6600"
          style={{ marginTop: 40 }}
        />
      ) : rankData.length === 0 ? (
        <Text style={styles.noData}>랭킹 데이터가 없습니다 😥</Text>
      ) : (
        <>
          <ListHeader />
          <FlatList
            data={rankData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

export default RankingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* 헤더 */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 24,
  },

  /* 인트로 박스 */
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  infoIcon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  infoText: {
    color: "#fff",
    fontSize: 15,
  },

  /* 탭 */
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1F1F1F",
    borderRadius: 10,
    padding: 5,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
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

  /* --- 리스트 헤더(열 제목) --- */
  listHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  headerCell: {
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
  },
  headerRank: {
    width: 30,
    textAlign: "center",
  },
  headerNameWrap: {
    flex: 1,
    paddingLeft: 8,
  },
  headerNameText: {
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
  },
  headerScore: {
    width: 60,
    textAlign: "center",
  },
  headerDetail: {
    width: 45,
    textAlign: "center",
  },

  /* 리스트 아이템 */
  rankItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  gold: { backgroundColor: "#EBB13C" },
  silver: { backgroundColor: "#A19E9B" },
  bronze: { backgroundColor: "#A65934" },
  normal: { backgroundColor: "#1A1A1A" },

  rankNumber: {
    width: 30,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  score: {
    width: 60,
    textAlign: "center",
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 15,
  },
  detail: {
    width: 45,
    textAlign: "center",
    color: "#ccc",
  },

  noData: {
    color: "#999",
    textAlign: "center",
    marginTop: 30,
  },
});
