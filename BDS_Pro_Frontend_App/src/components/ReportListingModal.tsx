import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';

interface ReportListingModalProps {
  visible: boolean;
  property: Property;
  onClose: () => void;
}

export function ReportListingModal({ visible, property, onClose }: ReportListingModalProps) {
  const [reason, setReason] = useState<string>('fake_price');
  const [details, setDetails] = useState<string>('');

  const reasons = [
    { id: 'fake_price', label: 'Giá đăng ảo, không đúng thực tế' },
    { id: 'already_sold', label: 'BĐS đã bán hoặc không còn cho thuê' },
    { id: 'fake_images', label: 'Hình ảnh giả mạo, không đúng căn hộ' },
    { id: 'cannot_contact', label: 'Không thể liên lạc được với môi giới' },
    { id: 'fraud', label: 'Có dấu hiệu lừa đảo / tranh chấp pháp lý' },
  ];

  const handleSubmit = () => {
    Alert.alert(
      'Đã gửi báo cáo',
      'Cảm ơn bạn đã phản hồi! Quản trị viên sàn BDS Pro sẽ kiểm duyệt lại bài đăng này trong vòng 24h.',
      [{ text: 'Đóng', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="flag" size={20} color="#ef4444" />
              <Text style={styles.headerTitle}>Báo cáo tin đăng vi phạm</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Vui lòng chọn lý do báo cáo:</Text>
            {reasons.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.reasonItem, reason === r.id && styles.reasonItemActive]}
                onPress={() => setReason(r.id)}
              >
                <Ionicons
                  name={reason === r.id ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={reason === r.id ? '#ef4444' : '#94a3b8'}
                />
                <Text style={[styles.reasonText, reason === r.id && styles.reasonTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { marginTop: 10 }]}>Mô tả thêm (nếu có):</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập chi tiết thông tin phản ánh..."
              multiline
              numberOfLines={3}
              value={details}
              onChangeText={setDetails}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Gửi báo cáo kiểm duyệt</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reasonItemActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  reasonText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  reasonTextActive: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    fontSize: 13,
    color: '#0f172a',
    textAlignVertical: 'top',
    height: 70,
  },
  submitBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
