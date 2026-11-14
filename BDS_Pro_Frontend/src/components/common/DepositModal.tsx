import { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  Printer,
  QrCode,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { transactionService, type DepositResponse } from '@/services/transaction.service';
import { formatPrice } from '@/utils/format';
import type { Property } from '@/types';
import { CLIENT_ROUTES } from '@/config/routes';

interface DepositModalProps {
  property: Property;
  onClose: () => void;
  onSuccess?: (res: DepositResponse) => void;
}

export function DepositModal({ property, onClose, onSuccess }: DepositModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isRent = property.transactionType === 'rent';
  const defaultAmount = isRent ? 5_000_000 : 50_000_000;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [depositAmount, setDepositAmount] = useState<number>(defaultAmount);
  const [customAmountStr, setCustomAmountStr] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>(user?.name || '');
  const [buyerPhone, setBuyerPhone] = useState<string>(user?.phone || '');
  const [buyerIdCard, setBuyerIdCard] = useState<string>('079201008899');
  const [note, setNote] = useState<string>('Cam kết giữ chỗ trong 7 ngày để thẩm định pháp lý & công chứng');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Payment method: 'bank' (VietQR), 'vnpay', 'momo'
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'vnpay' | 'momo'>('bank');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [depositResult, setDepositResult] = useState<DepositResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Escrow Bank Details for VietQR (Tài khoản nhận cọc ký quỹ)
  const ESCROW_BANK = {
    bankName: 'VPBank (Ngân hàng TMCP Việt Nam Thịnh Vượng)',
    accountNumber: '0332536815',
    accountName: 'CAO VAN BAO',
    transferContent: `BDSCOC ${property.id.slice(-6).toUpperCase()}`,
  };

  const vietQrUrl = `https://img.vietqr.io/image/vpbank-0332536815-compact.png?amount=${depositAmount}&addInfo=${encodeURIComponent(
    ESCROW_BANK.transferContent,
  )}&accountName=${encodeURIComponent(ESCROW_BANK.accountName)}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!agreeTerms) {
      alert('Vui lòng đồng ý với điều khoản ký quỹ đặt cọc an toàn!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await transactionService.createDeposit({
        propertyId: property.id,
        agentId: property.ownerId,
        amount: depositAmount,
        method: paymentMethod,
        buyerName: buyerName.trim() || user?.name || 'Khách hàng',
        buyerPhone: buyerPhone.trim() || user?.phone || '0901234567',
        note: `${note} (CMND/CCCD: ${buyerIdCard})`,
      });

      setDepositResult(res);
      setStep(3);
      if (onSuccess) onSuccess(res);
    } catch (err: any) {
      console.error('Lỗi khi đặt cọc:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch đặt cọc. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Biên lai đặt cọc ký quỹ - BDS Pro</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; }
            .logo { font-size: 26px; font-weight: 800; color: #059669; letter-spacing: -0.5px; }
            .title { font-size: 20px; font-weight: 700; margin-top: 10px; text-transform: uppercase; }
            .receipt-no { color: #64748b; font-size: 13px; margin-top: 4px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
            .label { color: #64748b; font-weight: 500; }
            .value { font-weight: 700; color: #0f172a; text-align: right; }
            .stamp { text-align: right; margin-top: 40px; }
            .stamp-badge { display: inline-block; border: 3px double #059669; color: #059669; padding: 8px 16px; border-radius: 8px; font-weight: 800; text-transform: uppercase; transform: rotate(-5deg); }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">BDS PRO — HỆ THỐNG GIAO DỊCH BẤT ĐỘNG SẢN</div>
            <div class="title">BIÊN LAI XÁC NHẬN KÝ QUỸ ĐẶT CỌC GIỮ CHỖ (ESCROW)</div>
            <div class="receipt-no">Mã biên nhận: ${depositResult?.receiptId || 'REC_' + Date.now()}</div>
          </div>
          <div class="box">
            <div class="row"><span class="label">Bất động sản:</span><span class="value">${property.title}</span></div>
            <div class="row"><span class="label">Địa chỉ:</span><span class="value">${property.address}, ${property.district}, ${property.city}</span></div>
            <div class="row"><span class="label">Hình thức giao dịch:</span><span class="value">${isRent ? 'Cho thuê căn hộ' : 'Mua bán nhà đất'}</span></div>
            <div class="row"><span class="label">Tổng giá trị niêm yết:</span><span class="value">${formatPrice(property.price, property.transactionType)}</span></div>
            <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 16px 0;" />
            <div class="row"><span class="label">Họ tên người đặt cọc:</span><span class="value">${buyerName}</span></div>
            <div class="row"><span class="label">Số điện thoại liên hệ:</span><span class="value">${buyerPhone}</span></div>
            <div class="row"><span class="label">Số CCCD / CMND:</span><span class="value">${buyerIdCard}</span></div>
            <div class="row"><span class="label">Số tiền ký quỹ đặt cọc:</span><span class="value" style="font-size: 18px; color: #059669;">${depositAmount.toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="row"><span class="label">Phương thức thanh toán:</span><span class="value">${paymentMethod === 'bank' ? 'Chuyển khoản VietQR' : paymentMethod === 'vnpay' ? 'Cổng VNPay' : 'Ví MoMo'}</span></div>
            <div class="row"><span class="label">Tài khoản thụ hưởng Escrow:</span><span class="value">VPBank - 0332536815 (CAO VĂN BẢO)</span></div>
            <div class="row"><span class="label">Tình trạng ký quỹ:</span><span class="value" style="color: #059669;">Đã nạp vào tài khoản Escrow sàn BDS Pro</span></div>
            <div class="row"><span class="label">Thời gian xác nhận:</span><span class="value">${new Date().toLocaleString('vi-VN')}</span></div>
          </div>
          <div class="stamp">
            <div class="stamp-badge">✓ ĐÃ KÝ QUỸ BẢO ĐẢM 100%<br/><span style="font-size: 10px;">BDS PRO ESCROW VERIFIED</span></div>
            <p style="margin-top: 8px; font-size: 13px; font-weight: bold; color: #334155;">ĐẠI DIỆN SÀN GIAO DỊCH BDS PRO</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Đặt cọc an toàn &amp; Ký quỹ Escrow</h2>
              <p className="text-xs text-emerald-100">
                {step === 1 && 'Bước 1/3: Thỏa thuận & Chọn mức tiền cọc'}
                {step === 2 && 'Bước 2/3: Chọn cổng thanh toán & Quét mã'}
                {step === 3 && 'Bước 3/3: Biên lai xác nhận ký quỹ thành công'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ──────── STEP 1: CHỌN MỨC TIỀN CỌC & THÔNG TIN ──────── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Property Card Summary */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                <img
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                  alt={property.title}
                  className="h-20 w-24 rounded-xl object-cover shrink-0 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {isRent ? 'Căn hộ cho thuê' : 'Bất động sản mua bán'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate mt-1">{property.title}</h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    📍 {property.address}, {property.district}, {property.city}
                  </p>
                  <p className="text-sm font-extrabold text-emerald-700 mt-1">
                    Giá niêm yết: {formatPrice(property.price, property.transactionType)}
                  </p>
                </div>
              </div>

              {/* Deposit Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  1. Chọn số tiền đặt cọc giữ chỗ
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(isRent ? [5_000_000, 10_000_000, 15_000_000] : [50_000_000, 100_000_000, 200_000_000]).map(
                    (amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setDepositAmount(amt);
                          setCustomAmountStr('');
                        }}
                        className={`rounded-2xl border p-3 text-center transition cursor-pointer ${
                          depositAmount === amt && !customAmountStr
                            ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/30 font-bold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold'
                        }`}
                      >
                        <p className="text-sm">{(amt / 1_000_000).toLocaleString('vi-VN')} triệu</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {isRent ? `${amt / 5_000_000} tháng cọc` : 'Cọc mua nhà'}
                        </p>
                      </button>
                    ),
                  )}
                </div>

                {/* Custom Amount input */}
                <div className="mt-3">
                  <input
                    type="number"
                    value={customAmountStr}
                    placeholder="Hoặc tự nhập số tiền cọc tùy chỉnh (VNĐ)..."
                    onChange={(e) => {
                      setCustomAmountStr(e.target.value);
                      const n = parseInt(e.target.value, 10);
                      if (!isNaN(n) && n > 0) setDepositAmount(n);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Buyer Contact Information */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  2. Thông tin pháp lý người đặt cọc
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">Họ và tên</span>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">Số điện thoại</span>
                    <input
                      type="text"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="0901234567"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">Số CCCD / CMND</span>
                    <input
                      type="text"
                      value={buyerIdCard}
                      onChange={(e) => setBuyerIdCard(e.target.value)}
                      placeholder="079201008899"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Note / Terms */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500">Thỏa thuận / Ghi chú đặt cọc</span>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Escrow Guarantee Box */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Cơ chế bảo vệ tiền cọc trung gian (BDS Pro Escrow)</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Tiền cọc của bạn được lưu trữ an toàn trong tài khoản ký quỹ của Sàn. Số tiền này chỉ được giải ngân cho
                  Môi giới/Chủ nhà khi hai bên đã gặp mặt công chứng hoặc ký kết hợp đồng chính thức. Bạn được quyền khiếu
                  nại hoàn cọc 100% nếu căn hộ có sai lệch thực tế.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Tôi đã đọc và đồng ý với điều khoản ký quỹ đặt cọc an toàn
                  </span>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!agreeTerms || depositAmount <= 0}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer disabled:opacity-50"
              >
                Tiến hành thanh toán ({depositAmount.toLocaleString('vi-VN')} đ) →
              </button>
            </div>
          )}

          {/* ──────── STEP 2: CHỌN CỔNG THANH TOÁN & QUÉT MÃ ──────── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Method Switcher */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 transition cursor-pointer ${
                    paymentMethod === 'bank'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs">Chuyển khoản VietQR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('vnpay')}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 transition cursor-pointer ${
                    paymentMethod === 'vnpay'
                      ? 'border-sky-600 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-sky-600" />
                  <span className="text-xs">Cổng VNPay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 transition cursor-pointer ${
                    paymentMethod === 'momo'
                      ? 'border-pink-600 bg-pink-50 text-pink-800 ring-2 ring-pink-500/20 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="h-5 w-5 text-pink-600" />
                  <span className="text-xs">Ví MoMo</span>
                </button>
              </div>

              {/* PAYMENT VIEW: VIETQR */}
              {paymentMethod === 'bank' && (
                <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* QR Code Column */}
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                      <img
                        src={vietQrUrl}
                        alt="Mã VietQR đặt cọc BDS Pro"
                        className="h-52 w-52 object-contain rounded-xl"
                      />
                      <p className="mt-2 text-center text-[11px] font-semibold text-slate-500">
                        Mở App Ngân hàng bất kỳ để quét mã thanh toán tức thì
                      </p>
                    </div>

                    {/* Bank Info Details Column */}
                    <div className="space-y-3 text-xs">
                      <div className="rounded-xl bg-white p-3 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Ngân hàng thụ hưởng</span>
                        <p className="font-bold text-slate-800 mt-0.5">{ESCROW_BANK.bankName}</p>
                      </div>

                      <div className="rounded-xl bg-white p-3 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Số tài khoản Ký quỹ</span>
                          <p className="font-mono text-base font-extrabold text-emerald-700 mt-0.5">
                            {ESCROW_BANK.accountNumber}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(ESCROW_BANK.accountNumber, 'acc')}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition cursor-pointer"
                          title="Sao chép STK"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="rounded-xl bg-white p-3 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Số tiền đặt cọc</span>
                          <p className="text-base font-extrabold text-slate-900 mt-0.5">
                            {depositAmount.toLocaleString('vi-VN')} VNĐ
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(depositAmount.toString(), 'amt')}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition cursor-pointer"
                          title="Sao chép số tiền"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="rounded-xl bg-white p-3 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Nội dung chuyển khoản</span>
                          <p className="font-mono font-bold text-indigo-700 mt-0.5">{ESCROW_BANK.transferContent}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(ESCROW_BANK.transferContent, 'content')}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition cursor-pointer"
                          title="Sao chép nội dung"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>

                      {copiedField && (
                        <p className="text-center text-[11px] font-bold text-emerald-600">✓ Đã sao chép vào bộ nhớ tạm!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT VIEW: VNPAY / MOMO SIMULATION */}
              {paymentMethod !== 'bank' && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100">
                    {paymentMethod === 'vnpay' ? (
                      <CreditCard className="h-8 w-8 text-sky-600" />
                    ) : (
                      <Smartphone className="h-8 w-8 text-pink-600" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900">
                    Cổng thanh toán {paymentMethod === 'vnpay' ? 'VNPay Sandbox' : 'Ví MoMo'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Hệ thống sẽ chuyển hướng bạn đến cổng xác thực giao dịch an toàn với số tiền{' '}
                    <strong className="text-slate-900">{depositAmount.toLocaleString('vi-VN')} đ</strong>.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Đang xác nhận giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Xác nhận đã chuyển tiền ký quỹ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ──────── STEP 3: BIÊN LAI XÁC NHẬN KÝ QUỸ THÀNH CÔNG ──────── */}
          {step === 3 && depositResult && (
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
              {/* Green Stamp Icon */}
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner">
                <ShieldCheck className="h-10 w-10" />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold ring-2 ring-white">
                  ✓
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Ký quỹ đặt cọc thành công!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mã biên lai giao dịch: <strong className="font-mono text-emerald-700">#{depositResult.receiptId}</strong>
                </p>
              </div>

              {/* Summary Details Ticket */}
              <div className="rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/50 p-5 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                  <span className="text-slate-500">Căn hộ đặt cọc:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[280px]">{property.title}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                  <span className="text-slate-500">Người đặt cọc:</span>
                  <span className="font-bold text-slate-900">
                    {buyerName} ({buyerPhone})
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                  <span className="text-slate-500">Số tiền ký quỹ:</span>
                  <span className="text-sm font-extrabold text-emerald-800">
                    {depositAmount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tình trạng bảo vệ tiền:</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    <Lock className="h-3 w-3" /> Đang giữ qua Escrow
                  </span>
                </div>
              </div>

              {/* Action Buttons: Print PDF & Navigate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-emerald-600" />
                  <span>In biên lai / Hợp đồng cọc</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(CLIENT_ROUTES.deals);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Xem trong Giao dịch của tôi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
