import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter, Stack } from "expo-router";

export default function HighlightCalendar() {
  const router = useRouter();
  const [marked, setMarked] = useState({});
  const [highlightData, setHighlightData] = useState({}); // 더미 확인용 상태

  useEffect(() => {
    const dummyData = {
      "2025-11-08": { count: 2 },
      "2025-11-10": { count: 5 },
      "2025-11-15": { count: 1 },
    };
    setHighlightData(dummyData);

    const newMarked = {};
    Object.keys(dummyData).forEach((date) => {
      const count = dummyData[date]?.count || 0;

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
  }, []);

  const handleDayPress = (day) => {
    router.push({
      pathname: "/HighlightScreen",
      params: { date: day.dateString },
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
    height:400,
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
