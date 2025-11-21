import { useCallback, useEffect, useRef, useState } from "react";
import api from "../app/api/api";

export const useProgressPolling = (intervalMs = 1000) => {
  const [progressData, setProgressData] = useState({
    uploadProgress: 0,
    uploadComplete: false,
    highlightProgress: 0,
    highlightComplete: false,
    type: "",
  });

  const [running, setRunning] = useState(false);

  const jobIdRef = useRef(null);
  const timerRef = useRef(null);

  /*
   * Polling 시작
   */
  const startPolling = useCallback(async (jobId) => {
    if (!jobId) {
      console.error("Polling: jobId is required");
      return;
    }

    jobIdRef.current = jobId;

    setRunning(true);

    // 기존 타이머 제거
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/api/progress?jobId=${jobId}`);
        const data = res.data;

        //NONE 이벤트는 무시
        if (!data || data.type === "NONE") {
          return;
        }
          
        console.log("POLL message:", data);

        setProgressData((prev) => ({
          ...prev,
          type: data.type || prev.type,

          uploadProgress:
            data.type === "UPLOADING" ? data.progress : prev.uploadProgress,

          uploadComplete:
            data.type === "UPLOAD_COMPLETE" ? true : prev.uploadComplete,

          highlightProgress: ["PROCESSING", "COMPLETE"].includes(data.type)
            ? data.progress
            : prev.highlightProgress,

          highlightComplete:
            data.type === "COMPLETE" ? true : prev.highlightComplete,
        }));
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, intervalMs);
  }, []);

  /*
   * Polling 종료
   */
  const stopPolling = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  }, []);

  /*
   * 데이터 초기화
   */
  const reset = useCallback(() => {
    setProgressData({
      uploadProgress: 0,
      uploadComplete: false,
      highlightProgress: 0,
      highlightComplete: false,
      type: "",
    });
  }, []);

  useEffect(() => {
    return () => stopPolling(); // 언마운트 시 정리
  }, [stopPolling]);

  return {
    running,
    progressData,
    startPolling,
    stopPolling,
    reset,
  };
};
