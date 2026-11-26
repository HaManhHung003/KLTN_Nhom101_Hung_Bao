import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Building2,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { chatService, type ChatMessageItem, type ConversationItem } from '@/services/chat.service';
import { authStorage } from '@/services/auth.service';
import { floatingChat } from '@/services/floatingChat';
import { formatPrice } from '@/utils/format';
import { CLIENT_ROUTES } from '@/config/routes';
import { AiPropertyMiniCard } from '@/components/chat/AiPropertyMiniCard';
import { AI_QUICK_PROMPTS, type AiChatMessage } from '@/types/chat';
import { AiChatEngine } from '@/services/aiChat.service';
import { useUserLocation } from '@/context/LocationContext';
import type { Property } from '@/types';

const INITIAL_AI_MESSAGES: AiChatMessage[] = [
  {
    id: 'ai-welcome-1',
    role: 'bot',
    content:
      'Xin chào! Tôi là Trợ lý AI BĐS Pro 🤖.\nTôi có thể hỗ trợ bạn:\n• Tìm kiếm BĐS theo ngân sách & khu vực\n• Thẩm định và tư vấn pháp lý sổ hồng\n• Tính toán lãi suất & hạn mức vay ngân hàng\n\nBạn đang quan tâm đến loại hình BĐS nào?',
  },
];

export function FloatingMessengerChat() {
  const navigate = useNavigate();
  const { userLocation } = useUserLocation();
  const state = useSyncExternalStore(
    (cb) => floatingChat.subscribe(cb),
    () => floatingChat.getState()
  );

  const currentUser = authStorage.getUser();
  const currentUserId = currentUser?.id || '';

  // Real properties for card resolution
  const [loadedProperties, setLoadedProperties] = useState<Property[]>([]);

  // All conversations list for the vertical stack rail
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  // Broker Chat states
  const [conversation, setConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // AI Chat states
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>(INITIAL_AI_MESSAGES);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any>(null);

  const scrollToBottom = (smooth = true) => {
    if (state.activeTab === 'broker' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    } else if (state.activeTab === 'ai' && aiMessagesEndRef.current) {
      aiMessagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // 1. Fetch conversations list & cache properties
  const fetchAllConversations = async () => {
    try {
      const convs = await chatService.getConversations();
      setConversations(convs);
      return convs;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    AiChatEngine.getRealProperties().then((props) => setLoadedProperties(props));
    fetchAllConversations();
  }, []);

  // 2. Fetch active conversation details & messages for Broker tab
  const loadChatData = async (convId: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const convs = await fetchAllConversations();
      const current = convs.find((c) => c.id === convId) || null;
      if (current) {
        setConversation(current);
      }

      const msgs = await chatService.getMessages(convId);
      setMessages(msgs);
      if (!silent) {
        setTimeout(() => scrollToBottom(false), 60);
      }
    } catch {
      // Ignored
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // When active conversation changes or opened
  useEffect(() => {
    if (state.isOpen) {
      if (state.conversationId) {
        loadChatData(state.conversationId);
      } else {
        fetchAllConversations().then((list) => {
          if (list.length > 0 && !state.conversationId) {
            floatingChat.open(list[0].id);
          }
        });
      }
    }
  }, [state.isOpen, state.conversationId]);

  // Polling every 3.5s for broker messages
  useEffect(() => {
    if (!state.isOpen || !state.conversationId || state.activeTab !== 'broker') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(() => {
      if (state.conversationId) {
        loadChatData(state.conversationId, true);
      }
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [state.isOpen, state.conversationId, state.activeTab]);

  // Scroll on AI message change
  useEffect(() => {
    if (state.activeTab === 'ai') {
      setTimeout(() => scrollToBottom(true), 50);
    }
  }, [aiMessages, aiTyping, state.activeTab]);

  const other = conversation ? chatService.getOtherParticipant(conversation, currentUserId) : null;
  const otherName = other?.name || 'Môi giới BĐS';
  const otherAvatar =
    other?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(otherName)}`;

  // Handle send message to Broker
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !state.conversationId || sending) return;

    if (!textToSend) setInputText('');
    setSending(true);

    try {
      const newMsg = await chatService.sendMessage(state.conversationId, text);
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => scrollToBottom(true), 50);
    } catch {
      if (!textToSend) setInputText(text);
    } finally {
      setSending(false);
    }
  };

  // Handle AI prompt
  function resolveProperties(ids?: string[]) {
    if (!ids?.length) return [];
    return ids.map((id) => loadedProperties.find((p) => p.id === id)).filter(Boolean) as Property[];
  }

  async function sendAiPrompt(text: string) {
    const userMsg: AiChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiTyping(true);

    try {
      const lower = text.toLowerCase();
      let coords: { lat: number; lng: number } | null = userLocation;
      if (!coords && (lower.includes('gần') || lower.includes('quanh') || lower.includes('đây') || lower.includes('tôi'))) {
        if (navigator.geolocation) {
          coords = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              () => resolve({ lat: 10.7769, lng: 106.7009 }),
              { timeout: 4000 }
            );
          });
        }
      }

      const res = await AiChatEngine.generateReply(text, coords);
      // Ensure properties are in state
      if (res.matchedProperties.length > 0) {
        setLoadedProperties((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          res.matchedProperties.forEach((p) => map.set(p.id, p));
          return Array.from(map.values());
        });
      }

      const botReply: AiChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: res.reply,
        propertyIds: res.matchedProperties.map((p) => p.id),
      };
      setAiMessages((prev) => [...prev, botReply]);
    } catch {
      const botReply: AiChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: 'Tôi đã tiếp nhận yêu cầu của bạn. Hãy thử chọn các câu hỏi gợi ý bên dưới hoặc tìm theo khoảng giá cụ thể nhé!',
      };
      setAiMessages((prev) => [...prev, botReply]);
    } finally {
      setAiTyping(false);
    }
  }

  function handleSendAi() {
    const text = aiInput.trim();
    if (!text) return;
    setAiInput('');
    sendAiPrompt(text);
  }

  // ── CLOSED STATE: SLEEK FLOATING DOCK ON BOTTOM RIGHT ──
  if (!state.isOpen) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2">
        {/* Floating Unified Chat Dock */}
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5 hover:shadow-emerald-500/10 transition-all">
          {/* 1. Broker Chat Button */}
          <button
            type="button"
            onClick={() => {
              if (conversations.length > 0) {
                floatingChat.open(conversations[0].id);
              } else {
                floatingChat.open();
              }
            }}
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
            title="Chat trực tiếp với môi giới"
          >
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <span className="hidden sm:inline">Môi giới</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          {/* 2. AI Assistant Button with Sparkle Gradient */}
          <button
            type="button"
            onClick={() => floatingChat.openAi()}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition cursor-pointer"
            title="Trợ lý AI BĐS Pro"
          >
            <Bot className="h-3.5 w-3.5 animate-pulse text-violet-200" />
            <span>Trợ lý AI</span>
            <span className="inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider">
              GPS
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── OPEN STATE: FULL EXPANDED WINDOW WITH VERTICAL CHAT RAIL (STACKED VERTICALLY) ──
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex h-[540px] max-h-[calc(100vh-5.5rem)] w-[380px] sm:w-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* ── 1. VERTICAL CHAT RAIL (CHATS STACKED VERTICALLY ON LEFT EDGE) ── */}
      <div className="w-14 sm:w-16 border-r border-slate-100 bg-slate-50/90 flex flex-col items-center py-3 gap-2 shrink-0 overflow-y-auto no-scrollbar">
        {/* Top: AI Assistant Icon */}
        <button
          type="button"
          onClick={() => floatingChat.setTab('ai')}
          className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl transition group shrink-0 ${
            state.activeTab === 'ai'
              ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md ring-2 ring-violet-500 ring-offset-2 scale-105'
              : 'bg-white text-violet-600 hover:bg-violet-50 hover:scale-105 shadow-2xs border border-violet-100'
          }`}
          title="Trợ lý AI BDS Pro"
        >
          <Bot className="h-5 w-5" />
          <span className="sr-only">AI</span>
        </button>

        {/* Divider */}
        <div className="w-8 h-[1px] bg-slate-200 my-1 shrink-0" />

        {/* Broker Conversations stacked vertically */}
        {conversations.map((conv) => {
          const part = chatService.getOtherParticipant(conv, currentUserId);
          const name = part?.name || 'Môi giới';
          const avatar =
            part?.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
          const isSelected = state.activeTab === 'broker' && state.conversationId === conv.id;

          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => {
                floatingChat.open(conv.id);
              }}
              className={`relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl transition group shrink-0 ${
                isSelected
                  ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105 shadow-md'
                  : 'hover:scale-105 hover:ring-2 hover:ring-slate-300 shadow-2xs'
              }`}
              title={`${name} ${conv.property ? `· ${conv.property.title}` : ''}`}
            >
              <img
                src={avatar}
                alt={name}
                className="h-full w-full rounded-2xl object-cover bg-white border border-slate-200"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
          );
        })}

        {/* If no broker conversation exists yet */}
        {conversations.length === 0 && (
          <button
            type="button"
            onClick={() => floatingChat.open()}
            className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl transition group shrink-0 ${
              state.activeTab === 'broker'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500 ring-offset-2 scale-105'
                : 'bg-white text-slate-400 hover:text-slate-600 hover:scale-105 shadow-2xs border border-slate-200'
            }`}
            title="Chat với môi giới"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── 2. ACTIVE CHAT THREAD (MAIN CONTENT ON THE RIGHT) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header of the active chat */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3.5 py-2.5 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            {state.activeTab === 'ai' ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-600 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs truncate">Trợ lý AI BDS Pro</h3>
                  <p className="text-[10px] text-violet-600 font-medium">Tư vấn thông minh 24/7</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img src={otherAvatar} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs truncate">{otherName}</h3>
                  <p className="text-[10px] text-emerald-600 font-medium">Đang hoạt động</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => floatingChat.close()}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              title="Đóng chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── TAB 1: BROKER CHAT BODY ── */}
        {state.activeTab === 'broker' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Property pinned banner if attached */}
            {conversation?.property && (
              <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {conversation.property.title}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600">
                      {formatPrice(conversation.property.price, conversation.property.transactionType as any)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(CLIENT_ROUTES.property(conversation.property!.id))}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition shrink-0"
                  title="Xem chi tiết BĐS này"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Broker Messages thread */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3 bg-white">
              {loading && messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <RefreshCw className="mx-auto h-4 w-4 animate-spin text-emerald-600 mb-1" />
                  Đang tải tin nhắn...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  <MessageCircle className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                  <p className="font-semibold text-slate-600">Bắt đầu trò chuyện với môi giới</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Đặt câu hỏi về BĐS, pháp lý hoặc hẹn lịch xem nhà</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs leading-relaxed ${
                          isMine
                            ? 'rounded-br-xs bg-emerald-600 text-white'
                            : 'rounded-bl-xs bg-slate-100 text-slate-900'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Broker Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="border-t border-slate-200 bg-white p-2.5 shrink-0"
            >
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhắn tin cho môi giới..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition shrink-0"
                  aria-label="Gửi"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 2: AI ASSISTANT CHAT BODY ── */}
        {state.activeTab === 'ai' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* AI Messages thread */}
            <div className="flex-1 space-y-3.5 overflow-y-auto bg-gradient-to-b from-violet-50/30 to-white p-3">
              {aiMessages.map((m) => (
                <div key={m.id} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {m.role === 'bot' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-2 ring-violet-200 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`max-w-[82%] space-y-1.5 ${m.role === 'user' ? 'text-right' : ''}`}>
                    {m.content && (
                      <div
                        className={`inline-block rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs whitespace-pre-line text-left ${
                          m.role === 'user'
                            ? 'rounded-br-xs bg-violet-600 text-white'
                            : 'rounded-bl-xs bg-white text-slate-800 border border-slate-100'
                        }`}
                      >
                        {m.content}
                      </div>
                    )}
                    {m.propertyIds && m.propertyIds.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                        {resolveProperties(m.propertyIds).map((p) => (
                          <AiPropertyMiniCard key={p.id} property={p} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {aiTyping && (
                <div className="flex items-center gap-2 text-xs text-violet-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100">
                    <Bot className="h-3 w-3 animate-spin" />
                  </div>
                  <span className="italic">AI đang phân tích dữ liệu & tuyển chọn BĐS...</span>
                </div>
              )}

              <div ref={aiMessagesEndRef} />
            </div>

            {/* Quick AI Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50/50 px-3 py-1.5 text-[11px] no-scrollbar shrink-0">
              {AI_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendAiPrompt(prompt)}
                  className="shrink-0 rounded-full border border-violet-200 bg-white px-2.5 py-1 font-medium text-violet-700 hover:bg-violet-50 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* AI Input Form */}
            <div className="border-t border-slate-200 bg-white p-2.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                  placeholder="Hỏi AI về giá cả, vị trí, sổ đỏ, vay vốn..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={handleSendAi}
                  disabled={!aiInput.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 transition shrink-0"
                  aria-label="Gửi"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
