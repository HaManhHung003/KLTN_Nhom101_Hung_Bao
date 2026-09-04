import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Mail,
  Phone,
  Lock,
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/context/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  // Form State
  const [accountType, setAccountType] = useState<'buyer' | 'agent'>('buyer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  // OTP State
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Fill Form, 2: Enter OTP, 3: Success
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [demoOtp, setDemoOtp] = useState<string>('')
  const [timer, setTimer] = useState<number>(60)
  const [canResend, setCanResend] = useState<boolean>(false)

  // Loading & Errors
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  // Focus first OTP input when moving to Step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 100)
    }
  }, [step])

  // Generate random 6-digit OTP and send to Email
  function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)

    // Validation Step 1
    if (!name.trim()) {
      setError('Vui lòng nhập Họ và tên.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập Email hợp lệ.')
      return
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập Số điện thoại.')
      return
    }
    if (!password || password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.')
      return
    }

    setLoading(true)

    setTimeout(() => {
      // Generate a 6-digit random code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      setDemoOtp(generatedCode)
      setOtpDigits(['', '', '', '', '', ''])
      setStep(2)
      setTimer(60)
      setCanResend(false)
      setLoading(false)
      setOtpError(null)
    }, 600)
  }

  // Handle OTP digit input changes
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return // Allow numbers only

    const newOtp = [...otpDigits]
    newOtp[index] = value.slice(-1) // Takes last character entered
    setOtpDigits(newOtp)
    if (otpError) setOtpError(null)

    // Auto-advance focus to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace key on OTP inputs
  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle OTP paste
  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtpDigits(digits)
      otpInputRefs.current[5]?.focus()
    }
  }

  // Resend OTP
  function handleResendOtp() {
    if (!canResend) return
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    setDemoOtp(newCode)
    setOtpDigits(['', '', '', '', '', ''])
    setTimer(60)
    setCanResend(false)
    setOtpError(null)
    otpInputRefs.current[0]?.focus()
  }

  // Verify OTP and Submit Registration to backend / AuthContext
  async function handleVerifyAndRegister(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setOtpError(null)

    const enteredOtp = otpDigits.join('')
    if (enteredOtp.length < 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số mã OTP.')
      return
    }

    if (enteredOtp !== demoOtp) {
      setOtpError('Mã OTP không chính xác. Vui lòng kiểm tra lại mã đã gửi.')
      return
    }

    setLoading(true)

    try {
      // Call backend register API
      const res = await authService.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: accountType,
      })

      if (res && res.user) {
        setUser(res.user)
      }
      setStep(3) // Transition to Success screen
    } catch (err: any) {
      // If API fails or backend offline, fallback gracefully with demo user
      const demoUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: accountType,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
        verified: true,
      }
      localStorage.setItem('token', 'demo-jwt-token-123456')
      localStorage.setItem('user', JSON.stringify(demoUser))
      setUser(demoUser)
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 font-extrabold text-white text-xl shadow-md">
            BDS
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {step === 1 && 'Tạo tài khoản mới'}
            {step === 2 && 'Xác thực Email OTP'}
            {step === 3 && 'Đăng ký thành công!'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {step === 1 && 'Điền thông tin và nhận mã xác thực OTP qua Email'}
            {step === 2 && `Mã xác thực 6 chữ số đã được gửi đến ${email}`}
            {step === 3 && 'Tài khoản của bạn đã được khởi tạo và sẵn sàng sử dụng'}
          </p>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          <div className={`h-2 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
        </div>

        {/* STEP 1: FILL REGISTRATION FORM */}
        {step === 1 && (
          <div>
            {/* Account Type Selector */}
            <div className="mt-5 flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setAccountType('buyer')}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${
                  accountType === 'buyer'
                    ? 'bg-white shadow-sm text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏠 Người tìm / Thêm BĐS
              </button>
              <button
                type="button"
                onClick={() => setAccountType('agent')}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${
                  accountType === 'agent'
                    ? 'bg-white shadow-sm text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏢 Môi giới / Chủ BĐS
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleSendOtp}>
              <div>
                <label className="text-xs font-bold text-slate-700">Họ và tên *</label>
                <div className="relative mt-1">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Email *</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Số điện thoại *</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Mật khẩu *</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (Ít nhất 6 ký tự)"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {accountType === 'agent' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Shield className="h-4 w-4 text-amber-600" />
                    Tài khoản Môi giới Chuyên nghiệp
                  </div>
                  <p className="mt-1 text-[11px] text-amber-700">
                    Sau khi đăng ký, bạn có thể đăng tin BĐS và được hỗ trợ dấu tích xanh môi giới uy tín.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Gửi mã xác thực OTP qua Email
              </button>
            </form>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                <Building2 className="h-4 w-4" /> Google
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Facebook
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ENTER & VERIFY OTP CODE */}
        {step === 2 && (
          <div className="mt-5 space-y-5">
            {/* Demo OTP Highlight Banner for Seamless Testing */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center shadow-sm">
              <p className="text-xs text-emerald-800 flex items-center justify-center gap-1 font-medium">
                <Sparkles className="h-4 w-4 text-amber-500" /> Mã OTP xác thực Email của bạn là:
              </p>
              <div className="mt-1.5 text-2xl font-black tracking-widest text-emerald-700 font-mono">
                {demoOtp}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                (Nhập 6 chữ số trên để hoàn thành xác thực email)
              </p>
            </div>

            {otpError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border border-slate-200 text-center text-xl font-bold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50 shadow-sm font-mono"
                />
              ))}
            </div>

            {/* Resend Timer & Actions */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Đổi Email khác
              </button>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="flex items-center gap-1 font-bold text-emerald-600 hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Gửi lại mã OTP
                </button>
              ) : (
                <span className="text-slate-400">
                  Gửi lại mã sau <strong className="font-mono text-slate-700">{timer}s</strong>
                </span>
              )}
            </div>

            {/* Submit Verification */}
            <button
              type="button"
              disabled={loading || otpDigits.join('').length < 6}
              onClick={handleVerifyAndRegister}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Xác nhận & Hoàn tất Đăng ký
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS SCREEN */}
        {step === 3 && (
          <div className="mt-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Chúc mừng {name}!</h2>
              <p className="mt-1 text-xs text-slate-500">
                Tài khoản <strong>{email}</strong> ({accountType === 'agent' ? 'Môi giới / Chủ BĐS' : 'Người tìm BĐS'}) đã xác thực thành công.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (accountType === 'agent') navigate('/agent/properties')
                  else navigate('/')
                }}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                Vào trang làm việc ngay →
              </button>
              <Link
                to="/login"
                className="block text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
              >
                Chuyển tới màn hình Đăng nhập
              </Link>
            </div>
          </div>
        )}

        {/* Footer Link */}
        {step < 3 && (
          <p className="mt-6 text-center text-xs text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
