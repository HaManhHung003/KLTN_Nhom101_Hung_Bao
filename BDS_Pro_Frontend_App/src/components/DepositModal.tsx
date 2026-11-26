import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';
import { transactionService } from '../services/transaction.service';
import { formatPrice } from '../utils/format';

interface DepositModalProps {
  visible: boolean;
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export function DepositModal({ visible, property, onClose, onSuccess }: DepositModalProps) {
  const isRent = property.transactionType === 'rent';
  const defaultAmount = isRent ? 5000000 : 50000000;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [depositAmount, setDepositAmount] = useState<number>(defaultAmount);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'momo'>('bank');
  const [buyerName, setBuyerName] = useState<string>('Cao Văn Bảo');
  const [buyerPhone, setBuyerPhone] = useState<string>('0332536815');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [receiptId, setReceiptId] = useState<string>('');

  // Escrow Bank Details (VPBank)
  const ESCROW_BANK = {
    bankName: 'VPBank (Ngân hàng TMCP Việt Nam Thịnh Vượng)',
    accountNumber: '0332536815',
    accountName: 'CAO VAN BAO',
    transferContent: `BDSCOC ${property.id.slice(-6).toUpperCase()}`,
  };

  const vietQrUrl = `https://img.vietqr.io/image/vpbank-0332536815-compact.png?amount=${depositAmount}&addInfo=${encodeURIComponent(
    ESCROW_BANK.transferContent,
  )}&accountName=${encodeURIComponent(ESCROW_BANK.accountName)}`;

  // MoMo QR Details
  const momoQrData = `2|99|0332536815|CAO VAN BAO||0|0|${depositAmount}|${ESCROW_BANK.transferContent}|transfer_myqr`;
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(momoQrData)}`;

  // Lắng nghe biến động số dư SePay tự động (Polling 2.5s)
  useEffect(() => {
    if (step !== 2) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await transactionService.checkPaymentStatus(property.id);
        if (res?.isPaid && isMounted) {
          clearInterval(interval);
          setReceiptId(res.receiptId || `REC_SEPAY_${Date.now()}`);
          setStep(3);
          onSuccess();
        }
      } catch (e) {
        // ignore
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [step, property.id]);

  const handleSimulatePayment = async () => {
    try {
      setIsSimulating(true);
      await transactionService.simulateSepayPayment(property.id, depositAmount);
      // Giả lập trực tiếp nhảy sau 1 giây
      setTimeout(() => {
        setReceiptId(`REC_SEPAY_${Date.now()}`);
        setStep(3);
        setIsSimulating(false);
        onSuccess();
      }, 1000);
    } catch (e) {
      setIsSimulating(false);
    }
  };

  const handleManualConfirm = async () => {
    try {
      setIsSubmitting(true);
      const res = await transactionService.createDeposit({
        propertyId: property.id,
        amount: depositAmount,
        buyerName,
        buyerPhone,
        method: paymentMethod,
        note: `Đặt cọc giữ chỗ qua App Mobile: ${property.title}`,
      });
      setReceiptId(res.receiptId || `REC_${Date.now()}`);
      setStep(3);
      onSuccess();
    } catch (e) {
      Alert.alert('Thông báo', 'Không thể hoàn tất giao dịch. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={resetModal}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header Modal */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="shield-checkmark" size={20} color="#059669" />
              <Text style={styles.headerTitle}>Đặt cọc Ký quỹ An toàn</Text>
            </View>
            <TouchableOpacity onPress={resetModal} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Stepper Indicator */}
          <View style={styles.stepper}>
            <View style={[styles.stepItem, step >= 1 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>
              <Text style={styles.stepLabel}>Số tiền cọc</Text>
            </View>
            <View style={styles.stepDivider} />
            <View style={[styles.stepItem, step >= 2 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>
              <Text style={styles.stepLabel}>Quét mã QR</Text>
            </View>
            <View style={styles.stepDivider} />
            <View style={[styles.stepItem, step >= 3 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 3 && styles.stepNumActive]}>3</Text>
              <Text style={styles.stepLabel}>Biên nhận</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* ──────── STEP 1: CHỌN SỐ TIỀN CỌC ──────── */}
            {step === 1 && (
              <View style={styles.stepBody}>
                <View style={styles.propertyPreview}>
                  <Text style={styles.propTitle} numberOfLines={2}>
                    {property.title}
                  </Text>
                  <Text style={styles.propPrice}>
                    Giá niêm yết: {formatPrice(property.price, property.transactionType)}
                  </Text>
                </View>

                <Text style={styles.sectionLabel}>Chọn mức đặt cọc ký quỹ sàn:</Text>
                <View style={styles.amountGrid}>
                  {(isRent ? [2000000, 5000000, 10000000] : [20000000, 50000000, 100000000]).map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.amountBtn, depositAmount === amt && styles.amountBtnActive]}
                      onPress={() => setDepositAmount(amt)}
                    >
                      <Text style={[styles.amountBtnText, depositAmount === amt && styles.amountBtnTextActive]}>
                        {(amt / 1000000).toLocaleString('vi-VN')} Triệu
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.escrowNotice}>
                  <Ionicons name="lock-closed" size={16} color="#059669" />
                  <Text style={styles.escrowNoticeText}>
                    Tiền cọc được khóa bảo chứng trong tài khoản Escrow của sàn. Sàn chỉ giải ngân cho bên bán/cho thuê sau khi hai bên ký kết hợp đồng chính thức.
                  </Text>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
                  <Text style={styles.primaryBtnText}>Tiếp tục thanh toán cọc →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ──────── STEP 2: QUÉT MÃ QR & TỰ ĐỘNG NHẬN TIỀN ──────── */}
            {step === 2 && (
              <View style={styles.stepBody}>
                {/* Method Switcher */}
                <View style={styles.methodSwitcher}>
                  <TouchableOpacity
                    style={[styles.methodBtn, paymentMethod === 'bank' && styles.methodBtnActive]}
                    onPress={() => setPaymentMethod('bank')}
                  >
                    <Ionicons name="qr-code-outline" size={18} color={paymentMethod === 'bank' ? '#059669' : '#64748b'} />
                    <Text style={[styles.methodText, paymentMethod === 'bank' && styles.methodTextActive]}>
                      VietQR VPBank
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.methodBtn, paymentMethod === 'momo' && styles.methodBtnMomoActive]}
                    onPress={() => setPaymentMethod('momo')}
                  >
                    <Ionicons name="wallet-outline" size={18} color={paymentMethod === 'momo' ? '#a50064' : '#64748b'} />
                    <Text style={[styles.methodText, paymentMethod === 'momo' && styles.methodTextMomoActive]}>
                      Ví MoMo
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* QR Code Card */}
                <View style={styles.qrCard}>
                  <Image
                    source={{ uri: paymentMethod === 'bank' ? vietQrUrl : momoQrUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrNote}>
                    Mở ứng dụng {paymentMethod === 'bank' ? 'Ngân hàng' : 'MoMo'} để quét mã chuyển tiền
                  </Text>
                </View>

                {/* Bank Account Info */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Chủ tài khoản:</Text>
                    <Text style={styles.infoVal}>CAO VĂN BẢO</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>STK / Số MoMo:</Text>
                    <Text style={[styles.infoVal, { color: '#059669', fontWeight: '900' }]}>0332536815</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Số tiền cọc:</Text>
                    <Text style={[styles.infoVal, { color: '#0f172a', fontWeight: '900' }]}>
                      {depositAmount.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nội dung:</Text>
                    <Text style={[styles.infoVal, { color: '#4f46e5', fontWeight: '800' }]}>
                      {ESCROW_BANK.transferContent}
                    </Text>
                  </View>
                </View>

                {/* Realtime Live Radar */}
                <View style={styles.liveBadge}>
                  <ActivityIndicator size="small" color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.liveTitle}>Đang lắng nghe SePay Webhook tự động (24/7)</Text>
                    <Text style={styles.liveSub}>Tự động hoàn tất giao dịch trong 1-3 giây sau khi chuyển khoản</Text>
                  </View>
                </View>

                {/* Button Test Giả lập Demo */}
                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={handleSimulatePayment}
                  disabled={isSimulating}
                >
                  <Ionicons name="flash" size={16} color="#d97706" />
                  <Text style={styles.demoBtnText}>
                    {isSimulating ? 'Đang kích hoạt...' : '⚡ Test nhận tiền tự động (Demo KLTN)'}
                  </Text>
                </TouchableOpacity>

                {/* Manual Confirm Button */}
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 10 }]}
                  onPress={handleManualConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Xác nhận đã chuyển tiền ký quỹ</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ──────── STEP 3: BIÊN NHẬN ĐIỆN TỬ THÀNH CÔNG ──────── */}
            {step === 3 && (
              <View style={styles.stepBody}>
                <View style={styles.successIconWrap}>
                  <Ionicons name="checkmark-circle" size={64} color="#059669" />
                  <Text style={styles.successTitle}>ĐẶT CỌC THÀNH CÔNG!</Text>
                  <Text style={styles.successSub}>Tiền cọc đã được bảo chứng an toàn tại sàn BDS Pro</Text>
                </View>

                <View style={styles.receiptBox}>
                  <View style={styles.receiptHeader}>
                    <Text style={styles.receiptLabel}>BIÊN LAI KÝ QUỸ ĐIỆN TỬ</Text>
                    <Text style={styles.receiptCode}>#{receiptId || 'REC_888999'}</Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={styles.rcLabel}>Bất động sản:</Text>
                    <Text style={styles.rcVal} numberOfLines={1}>{property.title}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.rcLabel}>Số tiền cọc:</Text>
                    <Text style={[styles.rcVal, { color: '#059669', fontWeight: '900' }]}>
                      {depositAmount.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.rcLabel}>Người đặt cọc:</Text>
                    <Text style={styles.rcVal}>{buyerName} ({buyerPhone})</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.rcLabel}>Hình thức:</Text>
                    <Text style={styles.rcVal}>{paymentMethod === 'bank' ? 'VietQR VPBank' : 'Ví MoMo'}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.rcLabel}>Trạng thái:</Text>
                    <Text style={[styles.rcVal, { color: '#059669' }]}>✓ ĐÃ BẢO CHỨNG (ESCROW LOCKED)</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={resetModal}>
                  <Text style={styles.primaryBtnText}>Hoàn tất & Về trang chủ</Text>
                </TouchableOpacity>
              </View>
            )}
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
    paddingBottom: 24,
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
  headerTitleWrap: {
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.45,
  },
  stepActive: {
    opacity: 1,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#cbd5e1',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepNumActive: {
    backgroundColor: '#059669',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  stepDivider: {
    width: 24,
    height: 1,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 20,
  },
  stepBody: {
    gap: 14,
  },
  propertyPreview: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  propTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  propPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  amountGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  amountBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  amountBtnActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  amountBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  amountBtnTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  escrowNotice: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  escrowNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#059669',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  methodSwitcher: {
    flexDirection: 'row',
    gap: 10,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  methodBtnActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  methodBtnMomoActive: {
    borderColor: '#a50064',
    backgroundColor: '#fdf2f8',
  },
  methodText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  methodTextActive: {
    color: '#059669',
  },
  methodTextMomoActive: {
    color: '#a50064',
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  qrNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  liveTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065f46',
  },
  liveSub: {
    fontSize: 11,
    color: '#047857',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  demoBtnText: {
    color: '#b45309',
    fontSize: 13,
    fontWeight: '800',
  },
  successIconWrap: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
    marginTop: 10,
  },
  successSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  receiptBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  receiptLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  receiptCode: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rcLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  rcVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    maxWidth: '65%',
    textAlign: 'right',
  },
});
