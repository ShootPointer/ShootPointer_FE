import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HighlightCardModal() {
  const router = useRouter();
  const { post, highlights } = useLocalSearchParams();
  const highlightList = JSON.parse(highlights || "[]");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // 이전 인덱스 추적
  const prevIndexRef = useRef(currentIndex);

  if (!highlightList || highlightList.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          {post === "false" ? (
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>하이라이트 선택</Text>
              <View style={{ width: 28 }} />
            </View>
          ) : null}
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>
              하이라이트가 없습니다.
            </Text>
          </View>
        </View>
      </>
    );
  }

  const currentHighlight = highlightList[currentIndex];
  console.log("현재 하이라이트:", currentHighlight);

  // 인덱스 변경 시 비디오 처리 (같은 인덱스 클릭 시 무시)
  useEffect(() => {
    if (prevIndexRef.current === currentIndex) {
      return;
    }

    prevIndexRef.current = currentIndex;
    setIsPlaying(false);

    if (videoRef.current) {
      // stopAsync 대신 pauseAsync + setPositionAsync 사용 (검정화면 방지)
      videoRef.current.pauseAsync().catch(() => {});
      videoRef.current.setPositionAsync(0).catch(() => {});
    }
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? highlightList.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === highlightList.length - 1 ? 0 : prev + 1
    );
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.log("Video playback error:", error);
      }
    }
  };

  const selectHighlight = () => {
    router.push({
      pathname: "/WriteScreen",
      params: {
        selectedHighlight: JSON.stringify(currentHighlight),
      },
    });
  };

  // 썸네일 클릭 핸들러
  const handleThumbnailPress = (index) => {
    if (index === currentIndex) {
      // 같은 썸네일 클릭 시 재생/일시정지 토글
      togglePlay();
    } else {
      // 다른 썸네일 클릭 시 인덱스 변경
      setCurrentIndex(index);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {post === "true" ? "하이라이트 선택" : "하이라이트 미리보기"}
          </Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🎬 하이라이트 모음</Text>
            <Text style={styles.subtitle}>최고의 순간들을 만나보세요</Text>
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.videoContainer}>
                {currentHighlight?.highlightUrl ? (
                  <Video
                    ref={videoRef}
                    source={{ uri: currentHighlight.highlightUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={isPlaying}
                    isLooping={false}
                    onPlaybackStatusUpdate={(status) => {
                      if (status.didJustFinish) {
                        setIsPlaying(false);
                      }
                    }}
                    onError={(e) => {
                      console.log("Video ERROR:", e);
                    }}
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Text style={{ color: "#666" }}>
                      동영상을 불러올 수 없습니다
                    </Text>
                  </View>
                )}

                {!isPlaying && currentHighlight?.highlightUrl && (
                  <TouchableOpacity
                    style={styles.playOverlay}
                    onPress={togglePlay}
                    activeOpacity={0.8}
                  >
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={40} color="#ff6600" />
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.navButton, styles.navLeft]}
                  onPress={handlePrevious}
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navButton, styles.navRight]}
                  onPress={handleNext}
                >
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.indexBadge}>
                  <Text style={styles.indexText}>
                    {currentIndex + 1} / {highlightList.length}
                  </Text>
                </View>

                {currentHighlight?.blocking && (
                  <View style={styles.blockBadge}>
                    <Text style={styles.blockText}>🛡️ BLOCK</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.highlightTitle}>
                  하이라이트 #{currentIndex + 1}
                </Text>

                <View style={styles.statsContainer}>
                  <View
                    style={[styles.statBox, { backgroundColor: "#ff880020" }]}
                  >
                    <Text style={styles.statLabel}>2점슛</Text>
                    <Text style={styles.statValue}>
                      {currentHighlight?.totalTwoPoint || 0}점
                    </Text>
                  </View>
                  <View
                    style={[styles.statBox, { backgroundColor: "#ffaa0020" }]}
                  >
                    <Text style={styles.statLabel}>3점슛</Text>
                    <Text style={styles.statValue}>
                      {currentHighlight?.totalThreePoint || 0}점
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  {highlightList.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.progressBar,
                        index === currentIndex && styles.progressBarActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* 썸네일 미리보기 */}
          <View style={styles.thumbnailContainer}>
            {highlightList.map((highlight, index) => {
              const isActive = index === currentIndex;
              return (
                <TouchableOpacity
                  key={highlight.highlightId}
                  style={[styles.thumbnail, isActive && styles.thumbnailActive]}
                  onPress={() => handleThumbnailPress(index)}
                >
                  <View
                    style={[
                      styles.thumbnailContent,
                      !isActive && styles.thumbnailContentInactive,
                    ]}
                  >
                    <Ionicons
                      name="videocam"
                      size={20}
                      color={isActive ? "#fff" : "#ffffff80"}
                    />
                    <Text
                      style={[
                        styles.thumbnailNumber,
                        !isActive && styles.thumbnailNumberInactive,
                      ]}
                    >
                      #{index + 1}
                    </Text>
                  </View>
                  {highlight.blocking && (
                    <View
                      style={[
                        styles.thumbnailBadge,
                        !isActive && styles.thumbnailBadgeInactive,
                      ]}
                    >
                      <Text style={styles.thumbnailBadgeText}>🛡️</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.thumbnailScore,
                      !isActive && styles.thumbnailScoreInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.thumbnailScoreText,
                        !isActive && styles.thumbnailScoreTextInactive,
                      ]}
                    >
                      {(highlight?.totalThreePoint || 0) +
                        (highlight?.totalTwoPoint || 0)}
                      점
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {post === "true" ? (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={selectHighlight}
            >
              <Text style={styles.selectButtonText}>하이라이트 선택</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#ff6600",
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ff660031",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ff6600",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 12,
    backgroundColor: "#000",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    backgroundColor: "rgba(255,102,0,0.3)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navLeft: { left: 16 },
  navRight: { right: 16 },
  indexBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,102,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  indexText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  blockBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(239,68,68,0.9)",
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
  },
  blockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 20,
  },
  highlightTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    padding: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: "#ff8833",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#ff660040",
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: "#ff6600",
  },
  thumbnailContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  thumbnail: {
    width: 100,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnailActive: {
    borderWidth: 3,
    borderColor: "#ff6600",
  },
  thumbnailContent: {
    flex: 1,
    backgroundColor: "#ff6600",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailContentInactive: {
    backgroundColor: "#ff660040",
  },
  thumbnailNumber: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
  thumbnailNumberInactive: {
    color: "#ffffff60",
  },
  thumbnailBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailBadgeInactive: {
    backgroundColor: "#EF444460",
  },
  thumbnailScore: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 2,
  },
  thumbnailScoreInactive: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  thumbnailScoreText: {
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
  },
  thumbnailScoreTextInactive: {
    color: "#ffffff60",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    backgroundColor: "#232222ff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#ff660040",
  },
  selectButton: {
    backgroundColor: "#ff6600",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
});
