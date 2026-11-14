import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LoginModal({ visible, onClose }: LoginModalProps) {
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
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);
    if (isRegisterMode) {
      const res = await register({ name, email, pass: password, phone, role });
      setLoading(false);
      if (res.success) {
        Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
        onClose();
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể tạo tài khoản');
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        Alert.alert('Lỗi', res.message || 'Đăng nhập không thành công');
      }
    }
  };

  const handleQuickLogin = async (targetRole: 'buyer' | 'agent' | 'admin') => {
    await quickLogin(targetRole);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{isRegisterMode ? 'Đăng ký Tài khoản' : 'Đăng nhập Hệ thống'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Quick Login Section (Demo KLTN) */}
            <View style={styles.demoSection}>
              <View style={styles.demoHeader}>
                <Ionicons name="flash" size={16} color="#d97706" />
                <Text style={styles.demoTitle}>Đăng nhập nhanh 1-chạm (Demo KLTN):</Text>
              </View>
              <View style={styles.demoGrid}>
                <TouchableOpacity style={styles.demoBtn} onPress={() => handleQuickLogin('buyer')}>
                  <Ionicons name="person" size={14} color="#059669" />
                  <Text style={styles.demoBtnText}>Khách hàng</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.demoBtn} onPress={() => handleQuickLogin('agent')}>
                  <Ionicons name="briefcase" size={14} color="#0284c7" />
                  <Text style={styles.demoBtnText}>Môi giới</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.demoBtn} onPress={() => handleQuickLogin('admin')}>
                  <Ionicons name="shield-checkmark" size={14} color="#7c3aed" />
                  <Text style={styles.demoBtnText}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>hoặc đăng nhập thủ công</Text>
              <View style={styles.line} />
            </View>

            {/* Register Fields */}
            {isRegisterMode && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: Cao Văn Bảo"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: 0332536815"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bạn tham gia với tư cách:</Text>
                  <View style={styles.roleRow}>
                    <TouchableOpacity
                      style={[styles.roleBtn, role === 'buyer' && styles.roleBtnActive]}
                      onPress={() => setRole('buyer')}
                    >
                      <Text style={[styles.roleText, role === 'buyer' && styles.roleTextActive]}>
                        Người mua / Thuê
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
              <Text style={styles.label}>Địa chỉ Email</Text>
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
              <Text style={styles.label}>Mật khẩu</Text>
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
                  {isRegisterMode ? 'Đăng ký tài khoản mới' : 'Đăng nhập vào BDS Pro'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <TouchableOpacity
              style={styles.toggleModeBtn}
              onPress={() => setIsRegisterMode(!isRegisterMode)}
            >
              <Text style={styles.toggleModeText}>
                {isRegisterMode
                  ? 'Đã có tài khoản? Đăng nhập ngay'
                  : 'Chưa có tài khoản? Đăng ký miễn phí'}
              </Text>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  demoSection: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 14,
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
    paddingVertical: 14,
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
  toggleModeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleModeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
});
