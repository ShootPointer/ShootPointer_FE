import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://tkv00.ddns.net", // 서버 주소
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청 인터셉터: Access Token 자동 첨부
api.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터: 토큰 만료 시 자동 갱신 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const email = await AsyncStorage.getItem("userEmail"); // 이메일 저장해뒀다고 가정
        const newAccessToken = await refreshToken(email);
        await AsyncStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Refresh Token 요청 함수
const refreshToken = async (email) => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await axios.post(
    `https://tkv00.ddns.net/token/refresh/${email}`,
    { token: refreshToken }
  );

  return response.data.accessToken;
};

export default api;
// -------------------------
// 📌 게시물 API
export const deletePost = async (postId) => {
  const res = await api.delete(`/api/post/${postId}`);
  return res.data;
};

export const updatePost = async (postId, updatedData) => {
  const res = await api.put(`/api/post/${postId}`, updatedData);
  return res.data;
};

export const likePost = async (postId) => {
  const res = await api.post(`/api/like/${postId}`);
  return res.data;
};

export const unlikePost = async (postId) => {
  const res = await api.delete(`/api/like/${postId}`);
  return res.data;
};

// 💬 댓글 API
export const getComments = async (postId) => {
  const res = await api.get(`/api/comment`, { postId: { postId } });
  return res.data;
};

export const addComment = async (postId, content) => {
  const res = await api.post(`/api/comment`, { postId, content });
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await api.delete(`/api/comment/${commentId}`);
  return res.data;
};

export const updateComment = async (commentId, content) => {
  const res = await api.patch(`/api/comment/${commentId}`, { content });
  return res.data;
};
