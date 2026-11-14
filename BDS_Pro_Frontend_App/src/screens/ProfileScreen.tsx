import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';

interface ProfileScreenProps {
  onNavigateToDeals?: () => void;
  onNavigateToFavorites?: () => void;
}

export function ProfileScreen({ onNavigateToDeals, onNavigateToFavorites }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Thông báo', 'Đã đăng xuất thành công!');
          },
        },
      ]
    );
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'admin') return 'Quản trị viên (Admin)';
    if (role === 'agent') return 'Môi giới BĐS';
    return 'Khách hàng (Người mua/thuê)';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Profile Header */}
      {user ? (
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {user.name.split(' ').slice(-1)[0]?.substring(0, 2).toUpperCase() || 'VB'}
            </Text>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
          </View>

          <View style={styles.phoneBox}>
            <Ionicons name="call" size={14} color="#64748b" />
            <Text style={styles.phoneText}>{user.phone || '0332536815'}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.notLoggedCard}>
          <Ionicons name="person-circle-outline" size={64} color="#cbd5e1" />
          <Text style={styles.notLoggedTitle}>Chưa đăng nhập</Text>
          <Text style={styles.notLoggedSub}>Đăng nhập để quản lý cọc BĐS và lưu danh sách yêu thích</Text>
          <TouchableOpacity style={styles.loginNowBtn} onPress={() => setShowLoginModal(true)}>
            <Text style={styles.loginNowBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Account Settings Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Tài khoản & Hoạt động</Text>

        <TouchableOpacity style={styles.menuItem} onPress={onNavigateToDeals}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuItemTitle}>Thương vụ & Ký quỹ cọc</Text>
            <Text style={styles.menuItemSub}>Lịch sử đặt cọc giữ chỗ và phiếu thu điện tử</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onNavigateToFavorites}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="heart" size={20} color="#ef4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuItemTitle}>Bất động sản đã lưu</Text>
            <Text style={styles.menuItemSub}>Danh sách các căn hộ bạn quan tâm</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setShowLoginModal(true)}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="swap-horizontal" size={20} color="#0284c7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuItemTitle}>Chuyển đổi tài khoản (Demo KLTN)</Text>
            <Text style={styles.menuItemSub}>Đổi vai trò Khách hàng, Môi giới hoặc Admin</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      {user && (
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutBtnText}>Đăng xuất khỏi tài khoản</Text>
        </TouchableOpacity>
      )}

      {/* Version footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>BDS Pro Mobile App · Phiên bản 1.0.0</Text>
        <Text style={styles.footerText}>Khóa luận Tốt nghiệp — Nhóm 101 (Hưng & Bảo)</Text>
      </View>

      {/* Login Modal */}
      <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    padding: 16,
    paddingBottom: 90,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  notLoggedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    gap: 8,
  },
  notLoggedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  notLoggedSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 260,
  },
  loginNowBtn: {
    marginTop: 8,
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loginNowBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    gap: 12,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
