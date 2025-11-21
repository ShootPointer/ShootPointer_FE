// app/(tabs)/index.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import api from "../api/api";

export default function HomeScreen() {
  const [highlights, setHighlights] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        if (!token) return;

        // 1️⃣ 사용자 정보 가져오기
        const userRes = await api.get("/member/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = userRes.data.data;
        setUserInfo({
          username: u.username,
          backNumber: u.backNumber,
          highlightCount: u.highlightCount,
          totalThreePoint: u.totalThreePoint,
          totalTwoPoint: u.totalTwoPoint,
        });

        // 2️⃣ WEEKLY 하이라이트 가져오기
        const highlightRes = await api.get("/api/highlight", {
          params: { period: "WEEKLY" },
        });

        console.log("🔥 WEEKLY highlight response:", highlightRes.data);

        const result = highlightRes.data?.data;

        if (!result || !Array.isArray(result)) {
          console.log("⚠ 서버에서 하이라이트 데이터 없음:", highlightRes.data);
          setHighlights([]);
        } else {
          const converted = result.map((item) => ({
            id: item.highlightId,
            title: item.title,
            type: "image", // 서버에 mediaType이 없으므로 이미지로 처리
            media: item.highlightUrl,
          }));

          setHighlights(converted);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderHighlight = ({ item }) => (
    <View style={styles.highlightCard}>
      {item.type === "IMAGE" ? (
        <Image source={{ uri: item.media }} style={styles.highlightImage} />
      ) : (
        <Video
          source={{ uri: item.media }}
          style={styles.highlightImage}
          resizeMode="cover"
          useNativeControls
          onError={(error) => {
            console.error("Video Load Error:", error);
          }}
        />
      )}
      <Text style={styles.highlightTitle}>{item.title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#ff6a33" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo2.png")}
          style={styles.logo}
        />
        <TouchableOpacity onPress={() => router.push("/RankingScreen")}>
          <Ionicons name="flame-outline" size={26} color="#ff6a33" marginLeft="70%" />
        </TouchableOpacity>
      </View>

      {/* 사용자 카드 */}
      {userInfo && (
        <View style={styles.cardContainer}>
          {/* 하단 그림자 */}
          <View style={styles.bottomShadow} />
          <ImageBackground
            source={require("../../assets/images/Profile.png")}
            style={styles.userCard}
            imageStyle={{
              width: '80%',
              height: '80%',
              position:"absolute",
              marginTop: 50,
              marginLeft:50,
            }}
            resizeMode="contain"
          >
            <View style={styles.userTopRow}>
              <View>
                <Text style={styles.userName}>{userInfo.username}</Text>
                <Text style={styles.userMatchInfo}>
                  하이라이트 {userInfo.highlightCount}
                </Text>
              </View>
              <View style={styles.userBackNumberWrap}>
                <Text style={styles.backNumberLabel}>No.</Text>
                <Text style={styles.backNumberValue}>{userInfo.backNumber}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>3점슛</Text>
                <Text style={styles.statValue}>{userInfo.totalThreePoint}회</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>2점슛</Text>
                <Text style={styles.statValue}>{userInfo.totalTwoPoint}회</Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* 주간 하이라이트 */}
      <View style={styles.highlightList}>
        <Text style={styles.sectionTitle}> 이 주의 하이라이트</Text>
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
  container: { flex: 1, backgroundColor: "#111111", paddingTop: 40, paddingLeft: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 10
  },
  logo: { width: 120, height: 40 },

  cardContainer: {
    margin: 15,
    marginTop: 50,
  },

  bottomShadow: {
    position: 'absolute',
    bottom: -10,
    left: -6,
    right: 15,
    height: 360,
    backgroundColor: '#000',
    opacity: 0.1,
    borderRadius: 30,
  },

  userCard: {
    backgroundColor: "#3b2219",
    borderRadius: 20,
    padding: 20,
    height: 350,
    width: 350,
    justifyContent: "space-between",
  },

  userTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  userName: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  userMatchInfo: { fontSize: 14, color: "#aaa", marginTop: 2 },
  userBackNumberWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  backNumberLabel: {
    fontSize: 16,
    color: "#ffffffaa",
    fontWeight: "300",
    marginRight: 3,
  },

  backNumberValue: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ff6a33",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
  },

  statBox: { 
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  statValue: { 
    color: "#fff", 
    fontSize: 23, 
    fontWeight: "bold",
  },
  statLabel: { 
    fontWeight: "300",
    color: "#fff", 
    fontSize: 12,
    marginRight: 8
  },

  highlightList: { paddingLeft: 10, marginTop: 10 },

  highlightCard: {
    width: 200,
    borderRadius: 12,
  },
  highlightImage: {
    width: 180,
    height: 200,
    borderRadius: 12,
    margin: 5,
  },
  highlightTitle: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  sectionTitle: { color: "#fff", fontSize: 18, marginTop: 5, marginLeft: 10, marginBottom: 10 },
};
