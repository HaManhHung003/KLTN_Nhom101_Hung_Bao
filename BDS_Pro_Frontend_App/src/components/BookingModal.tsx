import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { appointmentService } from '../services/appointment.service';

interface BookingModalProps {
  visible: boolean;
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ visible, property, onClose, onSuccess }: BookingModalProps) {
  // Preset dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(tomorrow));
  const [selectedTime, setSelectedTime] = useState<string>('09:30');
  const [tourType, setTourType] = useState<'in_person' | 'video'>('in_person');
  const [note, setNote] = useState<string>('Tôi muốn xem chi tiết hướng nhà và nội thất thực tế');
  const [loading, setLoading] = useState<boolean>(false);

  const timeSlots = ['09:00', '10:30', '14:00', '15:30', '17:00'];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await appointmentService.createAppointment({
        propertyId: property.id,
        date: selectedDate,
        time: selectedTime,
        tourType,
        note,
      });
      setLoading(false);
      Alert.alert(
        'Đặt lịch thành công!',
        `Bạn đã đặt lịch hẹn xem nhà vào ngày ${selectedDate} lúc ${selectedTime}. Môi giới sẽ liên hệ xác nhận sớm nhất!`,
        [
          {
            text: 'Tuyệt vời',
            onPress: () => {
              onClose();
              onSuccess();
            },
          },
        ]
      );
    } catch (e) {
      setLoading(false);
      Alert.alert('Lỗi', 'Không thể đặt lịch hẹn. Vui lòng thử lại!');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="calendar" size={20} color="#059669" />
              <Text style={styles.headerTitle}>Đặt lịch xem nhà</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Property Preview */}
            <View style={styles.propBox}>
              <Text style={styles.propTitle} numberOfLines={2}>
                {property.title}
              </Text>
              <Text style={styles.propAddress} numberOfLines={1}>
                {property.address}, {property.district}
              </Text>
            </View>

            {/* Tour Type Switcher */}
            <Text style={styles.label}>Hình thức xem nhà:</Text>
            <View style={styles.tourTypeRow}>
              <TouchableOpacity
                style={[styles.tourBtn, tourType === 'in_person' && styles.tourBtnActive]}
                onPress={() => setTourType('in_person')}
              >
                <Ionicons
                  name="walk"
                  size={18}
                  color={tourType === 'in_person' ? '#059669' : '#64748b'}
                />
                <Text style={[styles.tourText, tourType === 'in_person' && styles.tourTextActive]}>
                  Xem trực tiếp tại nhà
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tourBtn, tourType === 'video' && styles.tourBtnActive]}
                onPress={() => setTourType('video')}
              >
                <Ionicons
                  name="videocam"
                  size={18}
                  color={tourType === 'video' ? '#059669' : '#64748b'}
                />
                <Text style={[styles.tourText, tourType === 'video' && styles.tourTextActive]}>
                  Video Call 1-1
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Selection */}
            <Text style={styles.label}>Chọn ngày xem:</Text>
            <View style={styles.dateRow}>
              {[
                { label: 'Hôm nay', val: formatDate(today) },
                { label: 'Ngày mai', val: formatDate(tomorrow) },
                { label: 'Ngày kia', val: formatDate(dayAfter) },
              ].map((item) => (
                <TouchableOpacity
                  key={item.val}
                  style={[styles.dateBtn, selectedDate === item.val && styles.dateBtnActive]}
                  onPress={() => setSelectedDate(item.val)}
                >
                  <Text style={[styles.dateBtnLabel, selectedDate === item.val && styles.dateBtnLabelActive]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.dateBtnVal, selectedDate === item.val && styles.dateBtnValActive]}>
                    {item.val.split('-').slice(1).reverse().join('/')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Slot Selection */}
            <Text style={styles.label}>Chọn khung giờ:</Text>
            <View style={styles.timeRow}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeBtn, selectedTime === slot && styles.timeBtnActive]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[styles.timeText, selectedTime === slot && styles.timeTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note Input */}
            <Text style={styles.label}>Lời nhắn cho Môi giới:</Text>
            <TextInput
              style={styles.noteInput}
              multiline
              numberOfLines={3}
              placeholder="VD: Tôi muốn xem hướng nắng, thẩm định sổ hồng và thương lượng giá..."
              value={note}
              onChangeText={setNote}
            />

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Xác nhận Đặt lịch hẹn miễn phí</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '90%',
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
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  propBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  propTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  propAddress: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  tourTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tourBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  tourBtnActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
  },
  tourText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  tourTextActive: {
    color: '#059669',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  dateBtnActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
  },
  dateBtnLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  dateBtnLabelActive: {
    color: '#059669',
  },
  dateBtnVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  dateBtnValActive: {
    color: '#059669',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  timeTextActive: {
    color: '#ffffff',
  },
  noteInput: {
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
    backgroundColor: '#059669',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
