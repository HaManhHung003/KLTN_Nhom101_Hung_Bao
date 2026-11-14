import { useEffect, useState } from 'react'
import { Bot, Crosshair, Loader2, MapPin, Send, Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PropertyCard } from '@/components/common/PropertyCard'
import { PageHeader } from '@/components/common/PageHeader'
import { AiChatEngine, type PropertyWithDistance } from '@/services/aiChat.service'
import { useUserLocation } from '@/context/LocationContext'

interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  content: string
  matchedProperties?: PropertyWithDistance[]
}

interface ChatbotViewProps {
  messages?: ChatMessage[]
  title: string
  description: string
  transferPath?: string
  transferLabel?: string
}

const QUICK_PROMPTS = [
  'Tìm căn hộ gần tôi dưới 2,5 tỷ',
  'Tìm BĐS gần tôi nhất',
  'Nhà phố cho thuê Quận 1 hoặc Bình Thạnh',
  'Căn hộ dưới 3 tỷ có sổ hồng riêng',
  'Tư vấn gói vay mua nhà và lãi suất ngân hàng',
]

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'bot',
    content:
      'Xin chào! Tôi là Trợ lý AI BĐS Pro 🤖.\nTôi có thể hỗ trợ bạn:\n• 📍 **Lấy định vị GPS tìm BĐS gần bạn nhất** (Ví dụ: "tìm căn hộ gần tôi dưới 2,5 tỷ")\n• 💰 Tra cứu giá nhà đất và phân loại theo ngân sách\n• 📋 Thẩm định và tư vấn pháp lý sổ hồng / sổ đỏ\n• 🏦 Tính toán lãi suất và hạn mức vay ngân hàng\n\nBạn đang quan tâm đến loại hình BĐS nào?',
  },
]

export function ChatbotView({
  messages: initialMessages,
  title,
  description,
  transferPath,
  transferLabel = 'Chuyển sang môi giới thật',
}: ChatbotViewProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialMessages && initialMessages.length > 0 ? initialMessages : INITIAL_MESSAGES
  )
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [matchedProperties, setMatchedProperties] = useState<PropertyWithDistance[]>([])

  // User GPS Geolocation State from Global Location Context
  const {
    userLocation,
    userAddress,
    isLocating,
    refreshLocation,
    setCustomLocation,
  } = useUserLocation()
  const locationLabel = userAddress || (userLocation ? `Tọa độ [${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}]` : null)

  // Load real properties on mount
  useEffect(() => {
    AiChatEngine.getRealProperties().then((list) => {
      if (list.length > 0) {
        setMatchedProperties(list.slice(0, 4))
      }
    })
  }, [])

  // Geolocation trigger
  const requestUserLocation = async (): Promise<{ lat: number; lng: number }> => {
    if (userLocation) return userLocation
    const coords = await refreshLocation()
    return coords || { lat: 10.7769, lng: 106.7009 }
  }

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || loading) return

    if (!textToSend) setInputValue('')

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    }

    setChatMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const lower = text.toLowerCase()
      let currentCoords = userLocation

      // Nếu người dùng hỏi câu hỏi có liên quan đến "gần tôi", "gần đây", "quanh đây" mà chưa có GPS
      if (
        !currentCoords &&
        (lower.includes('gần') || lower.includes('quanh') || lower.includes('đây') || lower.includes('tôi'))
      ) {
        currentCoords = await requestUserLocation()
      }

      const res = await AiChatEngine.generateReply(text, currentCoords)
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: res.reply,
        matchedProperties: res.matchedProperties,
      }

      setChatMessages((prev) => [...prev, botMsg])
      if (res.matchedProperties.length > 0) {
        setMatchedProperties(res.matchedProperties)
      }
    } catch {
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: 'Tôi đã tiếp nhận yêu cầu của bạn. Hãy thử hỏi về khoảng giá hoặc chia sẻ vị trí để tôi tìm BĐS gần bạn nhất nhé!',
      }
      setChatMessages((prev) => [...prev, botMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={title} description={description} />

      <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-violet-500/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="font-bold text-xl">Trợ lý AI BDS Pro Thông Minh</p>
              <p className="text-sm text-violet-100">
                Định vị GPS thực tế · Phân tích khoảng cách km · Gợi ý BĐS gần bạn nhất
              </p>
            </div>
          </div>

          {/* GPS Quick Button on Banner */}
          <button
            type="button"
            onClick={() => requestUserLocation()}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 transition cursor-pointer"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4 text-emerald-300" />
            )}
            <span>{locationLabel ? `🎯 ${locationLabel}` : 'Bật định vị GPS của tôi'}</span>
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30 backdrop-blur-sm cursor-pointer"
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Active Location Indicator */}
        {locationLabel && (
          <div className="flex items-center justify-between border-b border-violet-100 bg-violet-50/60 px-5 py-2.5 text-xs text-violet-800 font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-violet-600" />
              <span>Đang kết nối GPS: <strong>{locationLabel}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCustomLocation(null, null)
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-violet-600 hover:bg-violet-100 transition cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Tắt định vị</span>
            </button>
          </div>
        )}

        {/* Messages thread */}
        <div className="max-h-[460px] space-y-4 overflow-y-auto p-6 bg-slate-50/30">
          {chatMessages.map((m) => (
            <div key={m.id} className={`flex gap-3.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'bot' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-xs ring-2 ring-violet-200 mt-0.5">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-violet-600 p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI đang định vị tọa độ và quét BĐS gần bạn...</span>
            </div>
          )}
        </div>

        {/* Chat input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="border-t border-slate-200 bg-white p-4"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ví dụ: Tìm căn hộ gần tôi dưới 2,5 tỷ, BĐS gần tôi nhất, thủ tục sổ hồng..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-24 text-sm text-slate-900 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 transition"
              />
              {/* GPS button inside input */}
              <button
                type="button"
                onClick={() => requestUserLocation()}
                disabled={isLocating}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-xl bg-violet-100/80 px-2.5 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-200 transition cursor-pointer"
                title="Bật GPS định vị vị trí hiện tại của tôi"
              >
                {isLocating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Crosshair className="h-3.5 w-3.5 text-violet-600" />
                )}
                <span>{userLocation ? 'GPS đã bật' : 'Vị trí tôi'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Hỏi AI</span>
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Properties */}
      <section className="pt-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h2 className="font-bold text-slate-900 text-lg">
              BĐS AI tuyển chọn {userLocation ? 'gần bạn nhất' : ''} ({matchedProperties.length})
            </h2>
          </div>
          {userLocation && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              📍 Đã sắp xếp theo khoảng cách gần nhất
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {matchedProperties.map((p) => (
            <div key={p.id} className="relative">
              {p.distanceKm !== undefined && (
                <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-sky-600/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-md">
                  <span>📍 Cách bạn {p.distanceKm} km</span>
                </div>
              )}
              <PropertyCard property={p} carousel />
            </div>
          ))}
        </div>

        {transferPath && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Cần thương lượng giá hoặc xem nhà trực tiếp?{' '}
            <Link to={transferPath} className="font-semibold text-emerald-600 hover:underline">
              {transferLabel} →
            </Link>
          </p>
        )}
      </section>
    </div>
  )
}
