import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import FrontendUpload from "../FrontendUpload";
import AgreeModal from "../agreeModal";
export default function CaptureScreen() {
  const [step, setStep] = useState("input");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showModal, setShowModal] = useState(true); // ⭐ 탭 들어오자마자 모달 실행

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>📵 카메라 접근 권한이 없습니다.</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "#ff5722", marginTop: 10 }}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log("photo", photo);
      setFrontImage(photo);
      setStep("upload");
    }
  };

  const isButtonEnabled = jerseyNumber.length === 2;
  const getBorderColor = (index) => (jerseyNumber[index] ? "#ff6a33" : "#aaa");
const pickImageFromGallery = async () => {
  Keyboard.dismiss();

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    alert("갤러리 접근 권한이 필요합니다.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (!result.canceled) {
    let image = result.assets[0];

    // PNG이면 JPEG로 변환
    if (image.uri.endsWith(".png") || image.type === "image/png") {
      const manipulated = await ImageManipulator.manipulateAsync(
        image.uri,
        [], // 변형 없음
        { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
      );
      image = { ...image, uri: manipulated.uri, type: "image/jpeg", fileName: image.fileName.replace(".png", ".jpg") };
    }

    setFrontImage(image);
    setStep("upload");
  }
};

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <AgreeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
        {step === "input" && (
  <>
    <View style={styles.topLabel}>
      <Text style={styles.whiteText}>본인의</Text>
    </View>
    <View style={styles.inlineLabel}>
      <Text style={styles.orangeText}>등번호</Text>
      <Text style={styles.whiteText}>를 입력하세요:</Text>
    </View>

    <View style={styles.centerContainer}>
      <View style={styles.inputRow}>
        <TextInput
          value={jerseyNumber[0] || ""}
          onChangeText={(t) =>
            setJerseyNumber((prev) =>
              t ? t[0] + (prev[1] || "") : prev[1] || ""
            )
          }
          maxLength={1}
          keyboardType="numeric"
          style={[styles.inputBox, { borderColor: getBorderColor(0) }]}
        />
        <TextInput
          value={jerseyNumber[1] || ""}
          onChangeText={(t) =>
            setJerseyNumber((prev) => (prev[0] || "") + (t ? t[0] : ""))
          }
          maxLength={1}
          keyboardType="numeric"
          style={[styles.inputBox, { borderColor: getBorderColor(1) }]}
        />
      </View>
    </View>

    {/* 선택 버튼 두 개 추가 */}
    <View style={styles.buttonContainer}>
      {/* 📸 사진 촬영하기 */}
      <TouchableOpacity
        style={[
          styles.captureButton,
          { backgroundColor: isButtonEnabled ? "#ff6a33" : "#555" },
        ]}
        disabled={!isButtonEnabled}
        onPress={() => {
          Keyboard.dismiss();
          setStep("front");
        }}
      >
        <Text style={styles.buttonText}>사진 촬영하기</Text>
      </TouchableOpacity>

      {/* 🖼 사진 선택하기 */}
      <TouchableOpacity
        style={[
          styles.captureButton,
          { backgroundColor: isButtonEnabled ? "#444" : "#333" },
        ]}
        disabled={!isButtonEnabled}
        onPress={pickImageFromGallery}
      >
        <Text style={[styles.buttonText, { fontSize: 16 }]}>
          사진 선택하기
        </Text>
      </TouchableOpacity>
    </View>
  </>
)}



        {step === "front" && (
          <View style={{ flex: 1 }}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
            <View style={styles.overlay}>
              <Text style={styles.cameraLabel}>
                등번호가 잘 보이도록{"\n"}
                <Text style={styles.orangeText}>뒷모습</Text>을 촬영해주세요
              </Text>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={handleCapture}
                activeOpacity={0.7}
              >
                <View style={styles.innerCircle} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "upload" && (
          <>
            <FrontendUpload
              jerseyNumber={jerseyNumber}
              frontImage={frontImage}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => {
                  setStep("input");
                  setJerseyNumber("");
                  setFrontImage(null);
                }}
              >
                <Text style={styles.buttonText}>⬅ 다시 시작</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

// 스타일 수정 (등번호 촬영 step 관련 부분 중심)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  topLabel: { position: "absolute", top: 120, left: 20 },
  inlineLabel: {
    position: "absolute",
    top: 160,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  whiteText: { color: "white", fontSize: 18 },
  orangeText: { color: "#ff6a33", fontSize: 18 },
  centerContainer: { flex: 1, top: "45%", alignItems: "center" },
  inputRow: { flexDirection: "row", justifyContent: "center" },
  inputBox: {
    borderWidth: 3,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    textAlign: "center",
    fontSize: 80,
    color: "white",
    width: 130,
  },
  buttonContainer: { justifyContent: "flex-end", flex: 1 },
  captureButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#ff6a33",
    shadowColor: "#ff6a33",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    alignSelf: "center",
    width:"90%",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "600" },

  // ====== 촬영 화면 관련 스타일 ======
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "rgba(0,0,0,0.25)", // 부드러운 반투명 오버레이
  },
  cameraLabel: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    fontWeight: "500",
  },
  circleButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 5,
    borderColor: "#ff6a33",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(255, 106, 51,0.2)",
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff6a33",
  },
  buttonContainer: { 
  width: "100%", 
  marginBottom: 20 
},
captureButton: {
  paddingVertical: 15,
  borderRadius: 12,
  alignItems: "center",
  marginBottom: 12,
  backgroundColor: "#ff6a33",
  alignSelf: "center",
  width: "90%",
},

});
