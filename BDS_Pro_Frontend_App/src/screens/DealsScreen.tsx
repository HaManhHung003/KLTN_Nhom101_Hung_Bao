import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Deal } from '../types';
import { transactionService } from '../services/transaction.service';
import { formatPrice } from '../utils/format';

interface DealsScreenProps {
  onSelectPropertyId?: (propertyId: string) => void;
}

export function DealsScreen({ onSelectPropertyId }: DealsScreenProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    const data = await transactionService.getMyDeals();
    setDeals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color="#059669" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Ký quỹ & Thương vụ</Text>
          <Text style={styles.headerSub}>Bảo vệ quyền lợi đặt cọc giữ chỗ 100%</Text>
        </View>
      </View>

      <FlatList
        data={deals}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDeals} colors={['#059669']} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.dealCard}>
            <View style={styles.dealHeader}>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.statusText}>ĐÃ CỌC KÝ QUỸ (ESCROW)</Text>
              </View>
              <Text style={styles.receiptId}>#{item.receiptId || 'REC_888999'}</Text>
            </View>

            <Text style={styles.dealTitle} numberOfLines={2}>
              {item.property?.title || 'Căn hộ Landmark 81 Vinhomes Central Park'}
            </Text>

            <View style={styles.dealDivider} />

            <View style={styles.infoGrid}>
              <View>
                <Text style={styles.lbl}>Tiền cọc giữ chỗ:</Text>
                <Text style={styles.depositAmt}>
                  {(item.depositAmount || 50000000).toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>

              <View>
                <Text style={styles.lbl}>Tổng giá trị BĐS:</Text>
                <Text style={styles.priceVal}>{formatPrice(item.price || 6800000000)}</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.securedTag}>
                <Ionicons name="lock-closed" size={12} color="#059669" />
                <Text style={styles.securedText}>Bảo chứng bởi Sàn BDS Pro</Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có giao dịch đặt cọc nào</Text>
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
  dealCard: {
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
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  receiptId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  dealTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 21,
    marginBottom: 12,
  },
  dealDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lbl: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  depositAmt: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  priceVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  securedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
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
