import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DataLoader = ({ type, progress }) => {
  /*
    UPLOADING 원본 영상 업로드
    UPLOAD_COMPLETE 원본 영상 업로드 성공
    PROCESSING 하이라이트 영상 생성 중
    COMPLETE 하이라이트 영상 생성 완료
    */
  const [showCheck, setShowCheck] = useState(false);

  const typeText = useMemo(() => {
    if (type === "UPLOADING") {
      return "원본 영상 업로드 중...";
    } else if (type === "UPLOAD_COMPLETE") {
      return "원본 영상 업로드 완료";
    } else if (type === "PROCESSING") {
      return "하이라이트 생성 중...";
    } else if (type === "COMPLETE") {
      return "하이라이트 생성 완료";
    }
    return "";
  }, [type]);

  const isComplete = type === "UPLOAD_COMPLETE" || type === "COMPLETE";

  useEffect(() => {
    if (isComplete) {
      setShowCheck(true);
    } else {
      setShowCheck(false);
    }
  }, [isComplete]);

  const router = useRouter();

  const handleBackPress = () => {
    Alert.alert(
      "주의",
      "현재 생성 중인 하이라이트가\n 손상될 수 있습니다.\n그래도 나가시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "나가기",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/*뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="chevron-back" size={32} color="#fff" />
      </TouchableOpacity>

      {/* type + progress */}
      <View style={{ alignItems: "center", marginHorizontal: 20 }}>
        <Text style={styles.typeText}>{typeText}</Text>
        {showCheck ? null : (
          <Text style={styles.progressText}>
            {progress !== undefined ? `${progress}%` : "0%"}
          </Text>
        )}
      </View>

      {/* 완료 체크 또는 로딩 점 */}
      {showCheck ? (
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 200,
          }}
          style={styles.checkWrapper}
        >
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </MotiView>
      ) : (
        <View style={styles.dotWrapper}>
          {[0, 1, 2].map((i) => (
            <MotiView
              key={i}
              from={{ translateY: 0, opacity: 0.3 }}
              animate={{ translateY: -1, opacity: 1 }}
              transition={{
                type: "timing",
                duration: 400,
                delay: i * 180,
                repeat: Infinity,
                loop: true,
              }}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === 0 ? "#FFFFFF" : i === 1 ? "#FFB37F" : "#FF6B00",
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 4,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    top: 30,
    left: 10,
    paddingVertical: 10,
    paddingRight: 10,
    zIndex: 99,
  },

  checkWrapper: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  dotWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 12,
  },

  dot: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },

  typeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    padding: 10,
  },

  progressText: {
    fontSize: 50,
    fontWeight: "700",
    color: "#fff",
    padding: 10,
  },
});

export default DataLoader;
