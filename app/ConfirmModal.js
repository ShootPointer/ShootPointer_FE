import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

export default function ConfirmModal({ title, visible, onConfirm, onCancel, message }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 20,
       alignItems: 'flex-start', // 왼쪽 정렬

  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
        color: '#fff',
     alignItems: 'flex-start', // 왼쪽 정렬


  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'flex-start',
        color: '#fff',

  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10, // 버튼 사이 간격
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#222222',
  },
  confirm: {
    backgroundColor: '#FF7F50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
