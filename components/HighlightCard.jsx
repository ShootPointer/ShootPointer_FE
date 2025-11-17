import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
    Alert,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function HighlightScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    // 샘플 하이라이트 데이터
    const [highlights, setHighlights] = useState([
        {
            highlightId: "UUID1",
            totalScore: 1231,
            twoScore: 22,
            threeScore: 33,
            blocking: true,
            videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
        },
        {
            highlightId: "UUID2",
            totalScore: 985,
            twoScore: 18,
            threeScore: 27,
            blocking: false,
            videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
        },
        {
            highlightId: "UUID3",
            totalScore: 1567,
            twoScore: 31,
            threeScore: 42,
            blocking: true,
            videoUrl: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
        },
    ]);

    const currentHighlight = highlights[currentIndex];

    // 인덱스 변경 시 비디오 정지
    useEffect(() => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.stopAsync();
        }
    }, [currentIndex]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? highlights.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === highlights.length - 1 ? 0 : prev + 1));
    };

    const togglePlay = async () => {
        if (videoRef.current) {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSelect = () => {
        router.push({
            pathname: "/WriteScreen",
            params: {
                selectedHighlight: JSON.stringify({
                    highlightId: currentHighlight.highlightId,
                    thumbnailUrl: currentHighlight.videoUrl,
                    highlightUrl: currentHighlight.videoUrl,
                    totalScore: currentHighlight.totalScore,
                    twoScore: currentHighlight.twoScore,
                    threeScore: currentHighlight.threeScore,
                    blocking: currentHighlight.blocking,
                }),
            },
        });
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>하이라이트 선택</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* 타이틀 */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>🎬 하이라이트 모음</Text>
                        <Text style={styles.subtitle}>최고의 순간들을 만나보세요</Text>
                    </View>

                    {/* 메인 비디오 카드 */}
                    <View style={styles.cardContainer}>
                        <View style={styles.card}>
                            {/* 비디오 영역 */}
                            <View style={styles.videoContainer}>
                                <Video
                                    ref={videoRef}
                                    source={{ uri: currentHighlight.videoUrl }}
                                    style={styles.video}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={isPlaying}
                                    isLooping={false}
                                    onPlaybackStatusUpdate={(status) => {
                                        if (status.didJustFinish) {
                                            setIsPlaying(false);
                                        }
                                    }}
                                />

                                {/* 재생 버튼 오버레이 */}
                                {!isPlaying && (
                                    <TouchableOpacity
                                        style={styles.playOverlay}
                                        onPress={togglePlay}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.playButton}>
                                            <Ionicons name="play" size={40} color="#8B5CF6" />
                                        </View>
                                    </TouchableOpacity>
                                )}

                                {/* 좌우 네비게이션 */}
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

                                {/* 인덱스 표시 */}
                                <View style={styles.indexBadge}>
                                    <Text style={styles.indexText}>
                                        {currentIndex + 1} / {highlights.length}
                                    </Text>
                                </View>

                                {/* 블로킹 배지 */}
                                {currentHighlight.blocking && (
                                    <View style={styles.blockBadge}>
                                        <Text style={styles.blockText}>🛡️ BLOCK</Text>
                                    </View>
                                )}
                            </View>

                            {/* 정보 영역 */}
                            <View style={styles.infoContainer}>
                                <Text style={styles.highlightTitle}>
                                    하이라이트 #{currentIndex + 1}
                                </Text>

                                {/* 점수 통계 */}
                                <View style={styles.statsContainer}>
                                    <View style={[styles.statBox, { backgroundColor: "#8B5CF620" }]}>
                                        <Text style={styles.statLabel}>총점</Text>
                                        <Text style={styles.statValue}>
                                            {currentHighlight.totalScore}
                                        </Text>
                                    </View>
                                    <View style={[styles.statBox, { backgroundColor: "#3B82F620" }]}>
                                        <Text style={styles.statLabel}>2점슛</Text>
                                        <Text style={styles.statValue}>
                                            {currentHighlight.twoScore}
                                        </Text>
                                    </View>
                                    <View style={[styles.statBox, { backgroundColor: "#10B98120" }]}>
                                        <Text style={styles.statLabel}>3점슛</Text>
                                        <Text style={styles.statValue}>
                                            {currentHighlight.threeScore}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.idText}>
                                    ID: {currentHighlight.highlightId.substring(0, 8)}...
                                </Text>

                                {/* 진행 바 */}
                                <View style={styles.progressContainer}>
                                    {highlights.map((_, index) => (
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
                        {highlights.map((highlight, index) => (
                            <TouchableOpacity
                                key={highlight.highlightId}
                                style={[
                                    styles.thumbnail,
                                    index === currentIndex && styles.thumbnailActive,
                                ]}
                                onPress={() => setCurrentIndex(index)}
                            >
                                <View style={styles.thumbnailContent}>
                                    <Ionicons name="videocam" size={20} color="#fff" />
                                    <Text style={styles.thumbnailNumber}>#{index + 1}</Text>
                                </View>
                                {highlight.blocking && (
                                    <View style={styles.thumbnailBadge}>
                                        <Text style={styles.thumbnailBadgeText}>🛡️</Text>
                                    </View>
                                )}
                                <View style={styles.thumbnailScore}>
                                    <Text style={styles.thumbnailScoreText}>
                                        {highlight.totalScore}점
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* 선택 버튼 */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
                        <Text style={styles.selectButtonText}>이 하이라이트 선택</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0A1F",
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
        color: "#C084FC",
    },
    cardContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#1F1536",
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#8B5CF640",
    },
    videoContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
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
        backgroundColor: "rgba(255,255,255,0.2)",
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
        backgroundColor: "rgba(0,0,0,0.6)",
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
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    blockText: {
        color: "#fff",
        fontSize: 10,
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
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    statLabel: {
        fontSize: 10,
        color: "#C084FC",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    idText: {
        fontSize: 12,
        color: "#C084FC",
        marginBottom: 16,
    },
    progressContainer: {
        flexDirection: "row",
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: "#8B5CF640",
        borderRadius: 2,
    },
    progressBarActive: {
        backgroundColor: "#C084FC",
    },
    thumbnailContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        paddingHorizontal: 16,
    },
    thumbnail: {
        width: 100,
        height: 60,
        borderRadius: 12,
        overflow: "hidden",
        opacity: 0.5,
    },
    thumbnailActive: {
        opacity: 1,
        borderWidth: 3,
        borderColor: "#C084FC",
    },
    thumbnailContent: {
        flex: 1,
        backgroundColor: "#8B5CF6",
        justifyContent: "center",
        alignItems: "center",
    },
    thumbnailNumber: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
        marginTop: 4,
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
    thumbnailBadgeText: {
        fontSize: 8,
    },
    thumbnailScore: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingVertical: 2,
    },
    thumbnailScoreText: {
        color: "#fff",
        fontSize: 9,
        textAlign: "center",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0F0A1F",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: "#8B5CF640",
    },
    selectButton: {
        backgroundColor: "#FF6B00",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    selectButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});