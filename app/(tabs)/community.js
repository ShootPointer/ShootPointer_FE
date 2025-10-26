// CommunityScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { likePost, unlikePost } from "../api/api";
import api from "../api/api";
import { useRouter } from "expo-router";

export default function CommunityScreen() {
  const navigation = useNavigation();

  // 게시물 상태
  const [posts, setPosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastPostId, setLastPostId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // 검색 상태
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
const router = useRouter();

  // -------------------------
// 게시물 불러오기
  const fetchPosts = async (loadMore = false) => {
    if (loadingMore || (!hasMore && loadMore)) return;
    setLoadingMore(true);

    try {
      const response = await api.get("/api/post", {
        params: {
          postId: loadMore ? lastPostId : null,
          size: 10,
          type: "latest",
        },
      });

      if (response.data.success) {
        const newPosts = response.data.data.postList.map((post) => ({
          postId: post.postId,
          author: post.memberName,
          description: post.content,
          likes: post.likeCnt,
          title: post.title,
          type: "image",
          media: post.highlightUrl,
          likedByMe: false,
          bookmarked: false,
          hashTag: post.hashTag || "",
        }));

        setPosts((prev) => (loadMore ? [...prev, ...newPosts] : newPosts));
        if (newPosts.length > 0)
          setLastPostId(newPosts[newPosts.length - 1].postId);
        if (newPosts.length < 10) setHasMore(false);
      }
    } catch (err) {
      console.error("게시물 조회 오류:", err);
      Alert.alert("오류", "게시물 조회 중 문제가 발생했습니다.");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLoadMore = () => fetchPosts(true);

  // -------------------------
  // 좋아요
  const toggleLike = async (postId, liked) => {
    try {
      const result = liked ? await unlikePost(postId) : await likePost(postId);
      if (result.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post.postId === postId
              ? {
                  ...post,
                  likedByMe: !post.likedByMe,
                  likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error("좋아요 처리 오류:", err);
    }
  };

  // -------------------------
  // 북마크
  const toggleBookmark = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.postId === postId ? { ...post, bookmarked: !post.bookmarked } : post
      )
    );
  };

  // -------------------------
  // 검색 제안
  const handleSearchChange = async (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setSuggestions([]);
      setSearchResults([]);
      return;
    }

    try {
      const suggestionRes = await api.get("/api/post/suggest", {
        params: { keyword: text },
      });
      if (suggestionRes.data.success) {
        const data = suggestionRes.data.data || [];
        const suggestionList = Array.isArray(data)
          ? data.map((item) => item.suggest || item)
          : [];
        setSuggestions(suggestionList);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Suggest API 호출 에러:", err);
      setSuggestions([]);
    }
  };

  // -------------------------
  // 검색 실행
  const handleSearchSubmit = async (query) => {
    setSearchLoading(true);
    setSuggestions([]);
    setSearchText(query);

    try {
      const response = await api.get("/api/post/list-elastic", {
        params: { search: query, postId: null, size: 10 },
      });
      if (response.data.success) {
        const resultPosts = response.data.data.postList || [];
        setSearchResults(
          resultPosts.map((post) => ({
            postId: post.postId,
            author: post.memberName,
            description: post.content,
            likes: post.likeCnt,
            title: post.title,
            type: "image",
            media: post.highlightUrl,
            likedByMe: false,
            bookmarked: false,
            hashTag: post.hashTag || "",
          }))
        );
      }
    } catch (err) {
      console.error("검색 오류:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // -------------------------
  // 게시물 렌더링
  const renderItem = ({ item }) => (
    <View style={styles.post}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.author}>{item.author}</Text>

      {item.type === "image" ? (
        <Image source={{ uri: item.media }} style={styles.media} />
      ) : (
        <Video
          source={{ uri: item.media }}
          style={styles.media}
          useNativeControls
          resizeMode="cover"
          isLooping
        />
      )}

      <Text style={styles.description}>{item.description}</Text>
      {item.hashTag ? <Text style={styles.hashtag}>{item.hashTag}</Text> : null}

      <View style={styles.bottomActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={() => toggleLike(item.postId, item.likedByMe)}
            style={styles.iconButton}
          >
            <Image
              source={
                item.likedByMe
                  ? require("../../assets/images/Filledheart.png")
                  : require("../../assets/images/Heart.png")
              }
              style={styles.icon}
            />
            <Text style={styles.likeCount}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
  style={styles.iconButton}
  onPress={() => {
    console.log("Navigate params:", { postId: item.postId });
    router.push({
      pathname: "/CommentScreen",
      params: { postId: String(item.postId) }, // 문자열로 전달
    });
  }}
>
  <Image
    source={require("../../assets/images/Comment.png")}
    style={styles.icon}
  />
</TouchableOpacity>


          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => Alert.alert("공유", "이 게시물의 링크를 복사했습니다!")}
          >
            <Image
              source={require("../../assets/images/Send.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => toggleBookmark(item.postId)}
          style={styles.iconButton}
        >
          <Image
            source={
              item.bookmarked
                ? require("../../assets/images/Filledbookmark.png")
                : require("../../assets/images/Bookmark.png")
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // -------------------------
  return (
    <View style={styles.container}>
      {!searchVisible && (
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchVisible(true)}
        >
          <Image
            source={require("../../assets/images/Search.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
        </TouchableOpacity>
      )}

      {searchVisible && (
        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={() => {
              setSearchVisible(false);
              setSearchText("");
              setSearchResults([]);
              setSuggestions([]);
            }}
            style={styles.backButton}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>←</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder="검색어를 입력하세요"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => handleSearchSubmit(searchText)}
          />
        </View>
      )}

      {searchVisible && suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          {suggestions.map((s, idx) => (
            <TouchableOpacity key={idx} onPress={() => handleSearchSubmit(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {posts.length === 0 && !loadingMore && !searchVisible && (
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 50 }}>
          게시물이 없습니다.
        </Text>
      )}

      <FlatList
        data={searchVisible ? searchResults : posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.postId.toString()}
        onEndReached={searchVisible ? null : handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          (loadingMore || searchLoading) && (
            <ActivityIndicator
              size="large"
              color="#ff6a33"
              style={{ margin: 20 }}
            />
          )
        }
      />

      {!searchVisible && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("WriteScreen", { posts, setPosts })}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 15 },
  post: { padding: 15, marginTop: 20, backgroundColor: "#000", borderRadius: 12 },
  title: { fontWeight: "bold", color: "#fff", fontSize: 16, marginBottom: 5 },
  author: { fontWeight: "bold", color: "#fff", marginBottom: 5 },
  media: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  description: { color: "#ddd", marginBottom: 5 },
  hashtag: { color: "#ffb400", marginBottom: 10 },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  leftActions: { flexDirection: "row", alignItems: "center" },
  iconButton: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  icon: { width: 22, height: 22, tintColor: "#fff" },
  likeCount: { color: "#fff", marginLeft: 4 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#ff6a33",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { fontSize: 28, color: "#fff", fontWeight: "bold" },
  searchButton: { position: "absolute", top: 20, right: 40, zIndex: 20, padding: 5 },
  searchContainer: { flexDirection: "row", alignItems: "center", marginTop: 50 },
  backButton: { paddingHorizontal: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  suggestionBox: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  suggestionText: {
    color: "#fff",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#444",
  },
});
