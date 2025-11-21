// hooks/useVideoChunkUpload.js

import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export function useVideoChunkUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  

  // 메인 함수
  const uploadVideoChunksExpo = async (video, presignedUrl, fileName) => {
    try {
      setUploading(true);
      setProgress(0);

      const fileUri = video.uri;
      const info = await FileSystem.getInfoAsync(fileUri, { size: true });
      const totalSize = info.size;
      const totalParts = Math.ceil(totalSize / CHUNK_SIZE);

      console.log("총 청크:", totalParts);

      for (let part = 1; part <= totalParts; part++) {
        const start = (part - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalSize);

        // 필요한 chunk만 Base64로 읽기
        const chunkBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
          position: start,
          length: end - start,
        });

        const formData = new FormData();
        formData.append("presignedToken", presignedUrl);
        formData.append("chunkIndex", part.toString());
        formData.append("totalParts", totalParts.toString());
        formData.append("fileName", fileName);
        formData.append("file", chunkBase64);

        console.log(`업로드 중... ${part}/${totalParts}`);

        const res = await fetch("http://tkv0011.ddns.net:8000/chunk", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`Chunk ${part} 업로드 실패: ${msg}`);
        }

        setProgress(Math.round((part / totalParts) * 100));
      }

      // 병합 요청
      const params = new URLSearchParams();
      params.append("presignedToken", presignedUrl);
      params.append("totalParts", totalParts);

      const completeRes = await fetch("http://tkv0011.ddns.net:8000/complete", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      return completeRes;
    } catch (err) {
      console.error("업로드 중 오류:", err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    progress,
    uploadVideoChunksExpo,
  };
}
