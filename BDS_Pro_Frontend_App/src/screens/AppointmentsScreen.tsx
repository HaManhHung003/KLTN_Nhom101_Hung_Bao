import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appointmentService, AppointmentItem } from '../services/appointment.service';

interface AppointmentsScreenProps {
  onBack?: () => void;
  onSelectPropertyId?: (propertyId: string) => void;
}

export function AppointmentsScreen({ onBack, onSelectPropertyId }: AppointmentsScreenProps) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    const data = await appointmentService.getMyAppointments();
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'confirmed') {
      return { label: 'ĐÃ XÁC NHẬN', bg: '#ecfdf5', text: '#059669', icon: 'checkmark-circle' };
    }
    if (status === 'completed') {
      return { label: 'ĐÃ XEM XONG', bg: '#eff6ff', text: '#0284c7', icon: 'checkmark-done-circle' };
    }
    if (status === 'cancelled') {
      return { label: 'ĐÃ HỦY', bg: '#fef2f2', text: '#ef4444', icon: 'close-circle' };
    }
    return { label: 'CHỜ MÔI GIỚI XÁC NHẬN', bg: '#fffbeb', text: '#d97706', icon: 'time' };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
        )}
        <Ionicons name="calendar" size={22} color="#059669" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Lịch hẹn xem nhà</Text>
          <Text style={styles.headerSub}>Danh sách ({appointments.length}) cuộc hẹn đã đặt</Text>
        </View>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAppointments} colors={['#059669']} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Ionicons name={badge.icon as any} size={14} color={badge.text} />
                  <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                </View>

                <View style={styles.tourTypeBadge}>
                  <Ionicons
                    name={item.tourType === 'video' ? 'videocam' : 'walk'}
                    size={12}
                    color="#475569"
                  />
                  <Text style={styles.tourTypeText}>
                    {item.tourType === 'video' ? 'Video Call' : 'Xem trực tiếp'}
                  </Text>
                </View>
              </View>

              <Text style={styles.propTitle} numberOfLines={2}>
                {item.propertyTitle}
              </Text>

              <View style={styles.divider} />

              <View style={styles.timeInfoRow}>
                <View style={styles.timeBox}>
                  <Ionicons name="calendar-outline" size={16} color="#059669" />
                  <Text style={styles.timeVal}>{item.date}</Text>
                </View>

                <View style={styles.timeBox}>
                  <Ionicons name="time-outline" size={16} color="#059669" />
                  <Text style={styles.timeVal}>{item.time}</Text>
                </View>
              </View>

              {item.note && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>Ghi chú: {item.note}</Text>
                </View>
              )}

              <View style={styles.footerRow}>
                <View style={styles.agentInfo}>
                  <Ionicons name="person-circle-outline" size={16} color="#64748b" />
                  <Text style={styles.agentText}>Môi giới: {item.agentName || 'Cao Văn Bảo'}</Text>
                </View>

                <View style={styles.callBadge}>
                  <Ionicons name="call" size={14} color="#059669" />
                  <Text style={styles.callText}>{item.agentPhone || '0332536815'}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Bạn chưa có lịch hẹn xem nhà nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tourTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tourTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  propTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 21,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 10,
  },
  timeInfoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  noteBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
});
