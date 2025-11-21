import { useCallback, useState } from "react";
import api from "../app/api/api";

/**
 * 하이라이트 영상 미리보기 데이터 조회 훅
 */
const usePreview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlights, setHighlights] = useState([]);

  const fetchHighlights = useCallback(async (jobId) => {
    if (!jobId) {
      console.error("jobId가 필요합니다.");
      setError("jobId가 필요합니다.");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`하이라이트 조회 시작: jobId=${jobId}`);

      const response = await api.get(`/api/highlight/latest?jobId=${jobId}`);
      console.log(response.data);

      if (response.data.success) {
        const highlightData = response.data.data;
        console.log("하이라이트 조회 성공:", highlightData);

        setHighlights(highlightData);
        return highlightData;
      } else {
        throw new Error(response.data.message || "하이라이트 조회 실패");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "하이라이트 조회 중 오류 발생";
      console.error("하이라이트 조회 오류:", errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 하이라이트 목록 초기화
   */
  const reset = useCallback(() => {
    setHighlights([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    highlights,
    fetchHighlights,
    reset,
  };
};

export default usePreview;
