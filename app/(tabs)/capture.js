import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

export default function CaptureScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [step, setStep] = useState<'input' | 'front' | 'back' | 'done'>('input');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (step === 'front') {
        setFrontImage(photo.uri);
        setStep('back');
      } else if (step === 'back') {
        setBackImage(photo.uri);
        setStep('done');
      }
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>카메라 접근 권한이 없습니다.</Text>;

  return (
    <View style={styles.container}>
      {step === 'input' && (
        <>
          <Text style={styles.label}>등번호를 입력하세요:</Text>
          <TextInput
            value={jerseyNumber}
            onChangeText={setJerseyNumber}
            placeholder="예: 23"
            keyboardType="numeric"
            style={styles.input}
          />
          <Button
            title="촬영 시작"
            onPress={() => {
              if (jerseyNumber.trim()) {
                setStep('front');
              } else {
                alert('등번호를 입력해주세요.');
              }
            }}
          />
        </>
      )}

      {(step === 'front' || step === 'back') && (
        <>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.back} // 👈 이 부분
          />
          <Text style={styles.label}>
            {step === 'front' ? '앞모습을 촬영하세요' : '뒷모습을 촬영하세요'}
          </Text>
          <Button title="📸 사진 찍기" onPress={handleCapture} />
        </>
      )}

      {step === 'done' && (
        <>
          <Text style={styles.label}>등번호: {jerseyNumber}</Text>
          <Text style={styles.label}>앞모습:</Text>
          {frontImage && <Image source={{ uri: frontImage }} style={styles.preview} />}
          <Text style={styles.label}>뒷모습:</Text>
          {backImage && <Image source={{ uri: backImage }} style={styles.preview} />}
          <Button title="다시 시작" onPress={() => {
            setStep('input');
            setJerseyNumber('');
            setFrontImage(null);
            setBackImage(null);
          }} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    aspectRatio: 3 / 4,
    marginBottom: 20,
  },
  preview: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});
