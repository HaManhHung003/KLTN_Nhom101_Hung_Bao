import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { formatPrice, formatArea } from '../utils/format';
import { DepositModal } from '../components/DepositModal';
import { BookingModal } from '../components/BookingModal';
import { ReportListingModal } from '../components/ReportListingModal';

interface PropertyDetailScreenProps {
  property: Property;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDepositSuccess: () => void;
}

export function PropertyDetailScreen({
  property,
  onBack,
  isFavorite,
  onToggleFavorite,
  onDepositSuccess,
}: PropertyDetailScreenProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem căn hộ ${property.title} giá ${formatPrice(property.price, property.transactionType)} trên BDS Pro!`,
      });
    } catch (e) {
      // ignore
    }
  };

  const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Banner */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

          {/* Top Bar Actions */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={22} color="#0f172a" />
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowReportModal(true)}>
                <Ionicons name="flag-outline" size={20} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={20} color="#0f172a" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={onToggleFavorite}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#ef4444' : '#0f172a'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction Type Badge */}
          <View style={[styles.badge, property.transactionType === 'rent' ? styles.rentBadge : styles.saleBadge]}>
            <Text style={styles.badgeText}>
              {property.transactionType === 'rent' ? 'CHO THUÊ CHÍNH CHỦ' : 'BÁN CĂN HỘ CHÍNH CHỦ'}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Price & Legal */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(property.price, property.transactionType)}</Text>
            <View style={styles.legalBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={styles.legalText}>Sổ hồng riêng (Đã xác thực)</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{property.title}</Text>

          {/* Address */}
          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color="#059669" />
            <Text style={styles.addressText}>{property.address}, {property.district}, {property.city}</Text>
          </View>

          {/* Key Specs Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Ionicons name="scan" size={20} color="#059669" />
              <Text style={styles.specVal}>{formatArea(property.area)}</Text>
              <Text style={styles.specLbl}>Diện tích</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="bed" size={20} color="#0284c7" />
              <Text style={styles.specVal}>{property.bedrooms || 2} PN</Text>
              <Text style={styles.specLbl}>Phòng ngủ</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="water" size={20} color="#8b5cf6" />
              <Text style={styles.specVal}>{property.bathrooms || 2} WC</Text>
              <Text style={styles.specLbl}>Vệ sinh</Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="compass" size={20} color="#f59e0b" />
              <Text style={styles.specVal}>Đông Nam</Text>
              <Text style={styles.specLbl}>Hướng nhà</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin mô tả</Text>
            <Text style={styles.descriptionText}>
              {property.description ||
                'Căn hộ view thoáng mát, thiết kế hiện đại, nội thất đầy đủ chỉ việc xách vali vào ở. Tiện ích nội khu gồm hồ bơi, phòng gym, công viên, trung tâm thương mại và hệ thống an ninh 24/7.'}
            </Text>
          </View>

          {/* POIs: Tiện ích xung quanh */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích xung quanh vị trí</Text>
            <View style={styles.poisGrid}>
              <View style={styles.poiItem}>
                <Ionicons name="subway-outline" size={20} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.poiName}>Ga Metro Bến Thành - Suối Tiên</Text>
                  <Text style={styles.poiDist}>Cách 350 mét</Text>
                </View>
              </View>

              <View style={styles.poiItem}>
                <Ionicons name="cart-outline" size={20} color="#0284c7" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.poiName}>TTTM Vincom Mega Mall</Text>
                  <Text style={styles.poiDist}>Cách 500 mét</Text>
                </View>
              </View>

              <View style={styles.poiItem}>
                <Ionicons name="medkit-outline" size={20} color="#ef4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.poiName}>Bệnh viện Đa khoa Quốc tế</Text>
                  <Text style={styles.poiDist}>Cách 1.2 km</Text>
                </View>
              </View>

              <View style={styles.poiItem}>
                <Ionicons name="school-outline" size={20} color="#8b5cf6" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.poiName}>Trường Quốc tế Vinschool / BIS</Text>
                  <Text style={styles.poiDist}>Cách 800 mét</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Broker Info */}
          <View style={styles.brokerCard}>
            <View style={styles.brokerAvatar}>
              <Text style={styles.brokerAvatarText}>VB</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.brokerName}>{property.ownerName || 'Cao Văn Bảo'}</Text>
              <Text style={styles.brokerTitle}>Môi giới uy tín · Sàn BDS Pro</Text>
            </View>
            <View style={styles.callBadge}>
              <Ionicons name="call" size={16} color="#059669" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Floating Bar with 2 actions: Đặt lịch & Đặt cọc */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookingBtn} onPress={() => setShowBookingModal(true)}>
          <Ionicons name="calendar-outline" size={18} color="#0f172a" />
          <Text style={styles.bookingBtnText}>Đặt lịch xem</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.depositBtn} onPress={() => setShowDepositModal(true)}>
          <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
          <Text style={styles.depositBtnText}>Đặt cọc giữ chỗ ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        property={property}
        onClose={() => setShowBookingModal(false)}
        onSuccess={() => {}}
      />

      {/* Deposit Modal */}
      <DepositModal
        visible={showDepositModal}
        property={property}
        onClose={() => setShowDepositModal(false)}
        onSuccess={() => {
          setShowDepositModal(false);
          onDepositSuccess();
        }}
      />

      {/* Report Modal */}
      <ReportListingModal
        visible={showReportModal}
        property={property}
        onClose={() => setShowReportModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  saleBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.95)',
  },
  rentBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.95)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#059669',
  },
  legalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  legalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  specBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 6,
  },
  specLbl: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  poisGrid: {
    gap: 10,
  },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  poiName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  poiDist: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  brokerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  brokerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brokerAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  brokerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  brokerTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  callBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  bookingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bookingBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  depositBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  depositBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
