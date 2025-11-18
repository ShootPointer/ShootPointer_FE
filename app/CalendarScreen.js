import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

export default function HighlightCalendar() {
  //오늘 날짜 초기값
  let today = new Date();
  let initYear = today.getFullYear();
  let initMonth = today.getMonth() + 1;

  const router = useRouter();
  const [marked, setMarked] = useState({});
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  //초기 API 호출
  useEffect(() => {
    fetchCalendarData({ year, month });
  }, []);

  /*
   * 캘린더 데이터 호출
   */
  const fetchCalendarData = async ({ year, month }) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/calendar?year=${year}&month=${month}`
      );

      //조회 성공
      if (response.data.status === 200 && response.data.success) {
        setData(api.data.days || []);
      }
      //에러 메시지 반환
      else if (response.data.status === 200 && !response.data.success) {
        Alert.alert(response.data.error.message || "데이터가 없습니다.");
      }
      //나머지 오류 처리
    } catch (error) {
      console.error("캘린더 데이터 불러오기 오류:", error);
      Alert.alert("오류", "서버와 연결할 수 없습니다.", [
        {
          text: "새로고침",
          onPress: () => fetchCalendarData({ year, month }), // 다시 API 재요청
        },
        { text: "닫기", style: "cancel" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    const newMarked = {};

    data.forEach((day) => {
      const date = day.date;
      const count = day.count; //데이터 개수

      let color = "#fdc192ff"; // 1개
      if (count >= 2 && count <= 3) color = "#ffa057ff"; // 2~3개
      else if (count >= 4 && count <= 6) color = "#FF6B00"; // 4~6개
      else if (count >= 7) color = "#ff0000ff"; // 7개 이상

      newMarked[date] = {
        selected: true,
        selectedColor: color,
        selectedTextColor: "#fff",
      };
    });
    setMarked(newMarked);
  }, [data]);

  /*
   * 날짜 클릭 시 하이라이트 카드 모달 이동
   */
  const handleDayPress = (day) => {
    const target = data.find((d) => d.date === day.dateString);

    if (!target || !target.highlights || target.highlights.length === 0) {
      return;
    }
    router.push({
      pathname: "/HighlightCardModal",
      params: {
        post: "true",
        highlights: JSON.stringify(
          data.find((d) => d.date === day.dateString)?.highlights || []
        ),
      },
    });
  };

  // 범례 데이터
  const legend = [
    { label: "1개", color: "#fdc192ff" },
    { label: "2~3개", color: "#ffa057ff" },
    { label: "4~6개", color: "#FF6B00" },
    { label: "7개 이상", color: "#ff0000ff" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {/* 상단 뒤로가기 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../assets/images/back.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>

      {/* 캘린더 박스 */}
      <View style={styles.calendarBox}>
        <Calendar
          markedDates={marked}
          onDayPress={handleDayPress}
          style={styles.calendar}
          onMonthChange={(newDate) => {
            setYear(newDate.year);
            setMonth(newDate.month);

            fetchCalendarData({ year: newDate.year, month: newDate.month });
          }}
          theme={{
            backgroundColor: "#1A1A1A",
            calendarBackground: "#1A1A1A",
            textSectionTitleColor: "#777",
            selectedDayBackgroundColor: "#FF6B00",
            selectedDayTextColor: "#fff",
            todayTextColor: "#FF6B00",
            dayTextColor: "#fff",
            textDisabledColor: "#555",
            arrowColor: "#FF6B00",
            monthTextColor: "#fff",
            textMonthFontSize: 20,
            textMonthFontWeight: "bold",
            textDayFontSize: 14,
          }}
          renderArrow={(direction) => (
            <Text style={{ fontSize: 20, color: "#FF6B00" }}>
              {direction === "left" ? "‹" : "›"}
            </Text>
          )}
        />

        {/* 하이라이트 색상 범례 */}
        <View style={styles.legendContainer}>
          {legend.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[styles.colorBox, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  calendarBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 30,
  },
  calendar: {
    width: 350,
    height: 400,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginTop: 20,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    color: "#fff",
    fontSize: 14,
  },
  dummyButton: {
    marginTop: 20,
    backgroundColor: "#FF6B00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dummyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
