import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onContinueAsGuest?: () => void;
}

export function LoginScreen({ onContinueAsGuest }: LoginScreenProps) {
  const { login, register, quickLogin } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [email, setEmail] = useState('baocao@gmail.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Cao Văn Bảo');
  const [phone, setPhone] = useState('0332536815');
  const [role, setRole] = useState<'buyer' | 'agent'>('buyer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);
    if (isRegisterMode) {
      const res = await register({ name, email, pass: password, phone, role });
      setLoading(false);
      if (res.success) {
        Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
      } else {
        Alert.alert('Lỗi đăng ký', res.message || 'Không thể tạo tài khoản');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        Alert.alert('Lỗi đăng nhập', res.message || 'Email hoặc mật khẩu không chính xác');
      }
    }
  };

  const handleQuickLogin = async (targetRole: 'buyer' | 'agent' | 'admin') => {
    setLoading(true);
    await quickLogin(targetRole);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* App Logo & Branding */}
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <Ionicons name="home" size={32} color="#ffffff" />
          </View>
          <Text style={styles.brandTitle}>BDS PRO MOBILE</Text>
          <Text style={styles.brandSub}>
            Nền tảng Mua bán & Cho thuê Bất động sản Ký quỹ An toàn
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isRegisterMode ? 'Đăng ký Tài khoản Mới' : 'Đăng nhập vào Hệ thống'}
          </Text>

          {/* Quick Login Section (Demo KLTN) */}
          <View style={styles.demoSection}>
            <View style={styles.demoHeader}>
              <Ionicons name="flash" size={16} color="#d97706" />
              <Text style={styles.demoTitle}>Đăng nhập nhanh 1-chạm (Demo KLTN):</Text>
            </View>
            <View style={styles.demoGrid}>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleQuickLogin('buyer')}
                disabled={loading}
              >
                <Ionicons name="person" size={15} color="#059669" />
                <Text style={styles.demoBtnText}>Khách hàng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleQuickLogin('agent')}
                disabled={loading}
              >
                <Ionicons name="briefcase" size={15} color="#0284c7" />
                <Text style={styles.demoBtnText}>Môi giới</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleQuickLogin('admin')}
                disabled={loading}
              >
                <Ionicons name="shield-checkmark" size={15} color="#7c3aed" />
                <Text style={styles.demoBtnText}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>hoặc nhập tài khoản</Text>
            <View style={styles.line} />
          </View>

          {/* Register Mode Inputs */}
          {isRegisterMode && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Cao Văn Bảo"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: 0332536815"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vai trò tham gia sàn:</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'buyer' && styles.roleBtnActive]}
                    onPress={() => setRole('buyer')}
                  >
                    <Text style={[styles.roleText, role === 'buyer' && styles.roleTextActive]}>
                      Khách hàng (Mua/Thuê)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'agent' && styles.roleBtnActive]}
                    onPress={() => setRole('agent')}
                  >
                    <Text style={[styles.roleText, role === 'agent' && styles.roleTextActive]}>
                      Chủ nhà / Môi giới
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Email & Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: baocao@gmail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isRegisterMode ? 'Đăng ký tài khoản mới' : 'Đăng nhập vào App'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Register / Login */}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setIsRegisterMode(!isRegisterMode)}
          >
            <Text style={styles.toggleText}>
              {isRegisterMode
                ? 'Đã có tài khoản? Đăng nhập ngay'
                : 'Chưa có tài khoản? Đăng ký miễn phí'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue as Guest */}
        {onContinueAsGuest && (
          <TouchableOpacity style={styles.guestBtn} onPress={onContinueAsGuest}>
            <Text style={styles.guestBtnText}>Khám phá BĐS với tư cách Khách vãng lai →</Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Khóa luận Tốt nghiệp 2026 — Nhóm 101</Text>
          <Text style={styles.footerText}>Hà Mạnh Hưng & Cao Văn Bảo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 14,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  demoSection: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400e',
  },
  demoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#78350f',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleBtnActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  roleTextActive: {
    color: '#059669',
  },
  primaryBtn: {
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
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  toggleBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
