import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api/api";

export default function AgreeModal({ visible, onClose, userId }) {
  const [hasAgreed, setHasAgreed] = useState(false);

  useEffect(() => {
    const checkAgreement = async () => {
      const agreed = await AsyncStorage.getItem("highlightAgreed");
      if (agreed === "true") setHasAgreed(true);
    };
    checkAgreement();
  }, []);

  const handleAgree = async () => {
    try {
      await api.put(`/agree/highlight`, { agree: true });
      await AsyncStorage.setItem("highlightAgreed", "true"); // 동의 저장
      setHasAgreed(true); // 모달 안뜨게 상태 업데이트
      alert("동의가 완료되었습니다!");
      onClose();
    } catch (error) {
      console.error("동의 전송 오류:", error);
      alert("전송 중 오류가 발생했습니다.");
    }
  };

  // 이미 동의했으면 모달 아예 렌더링 안함
  if (hasAgreed) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>하이라이트 수집 및 활용 동의 안내</Text>
          <ScrollView style={styles.scrollBox} showsVerticalScrollIndicator={false}>
            <Text style={styles.text}>
              서비스 개선을 위해 아래 정보를 수집 및 활용하고자 합니다.
            </Text>
            <Text style={styles.text}>
              • 수집 항목: 영상 클립, 사용자 ID, 경기 정보, 일시 등
            </Text>
            <Text style={styles.text}>
              • 수집 목적: 하이라이트 자동 저장 및 추천 콘텐츠 제공
            </Text>
            <Text style={styles.text}>
              • 보관 기간: 생성일로부터 1년간
            </Text>
            <Text style={styles.text}>
              ※ 동의하지 않으셔도 서비스 이용은 가능하나, 하이라이트 자동 저장 및 공유 기능이 제한될 수 있습니다.
            </Text>
          </ScrollView>

          <View style={styles.buttonBox}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.agreeBtn} onPress={handleAgree}>
              <Text style={styles.agreeText}>동의</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: 300,
    height:400,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  scrollBox: {
    maxHeight: 400,
    marginBottom: 20,
  },
  text: {
    color: "white",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3A3A3C",
    alignItems: "center",
  },
  agreeBtn: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FF6A33",
    alignItems: "center",
  },
  cancelText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  agreeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
