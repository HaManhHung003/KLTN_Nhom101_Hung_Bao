import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Building2,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Send,
  Shield,
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
import { aiChatSession as seedSession, properties } from '@/data/mockData';

export function FloatingMessengerChat() {
  const navigate = useNavigate();
  const state = useSyncExternalStore(
    (cb) => floatingChat.subscribe(cb),
    () => floatingChat.getState()
  );

  const currentUser = authStorage.getUser();
  const currentUserId = currentUser?.id || '';

  // All conversations list for the vertical stack rail
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  // Broker Chat states
  const [conversation, setConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // AI Chat states
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>(seedSession);
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

  // 1. Fetch conversations list
  const fetchAllConversations = async () => {
    try {
      const convs = await chatService.getConversations();
      setConversations(convs);
      return convs;
    } catch {
      return [];
    }
  };

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

  // Initial load
  useEffect(() => {
    fetchAllConversations();
  }, []);

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
    return ids.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as typeof properties;
  }

  function sendAiPrompt(text: string) {
    const userMsg: AiChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      const isRedBook =
        lower.includes('sổ hồng') ||
        lower.includes('so hong') ||
        lower.includes('red book') ||
        lower.includes('pháp lý');
      const botReply: AiChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: isRedBook
          ? 'Dưới đây là các tin đăng đã được thẩm định pháp lý sổ hồng riêng minh bạch tại TP.HCM:'
          : 'Dựa trên tiêu chí bạn tìm kiếm, tôi đề xuất các bất động sản phù hợp nhất sau đây:',
        propertyIds: isRedBook ? ['p2', 'p5', 'p7'] : ['p1', 'p4', 'p2'],
      };
      setAiMessages((prev) => [...prev, botReply]);
      setAiTyping(false);
    }, 500);
  }

  function handleSendAi() {
    const text = aiInput.trim();
    if (!text) return;
    setAiInput('');
    sendAiPrompt(text);
  }

  // ── CLOSED STATE: CHAT BUTTONS STACKED VERTICALLY ON BOTTOM RIGHT ──
  if (!state.isOpen) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-center gap-2.5">
        {/* 1. Broker Chat Button (Stacked on top) */}
        <button
          type="button"
          onClick={() => {
            if (conversations.length > 0) {
              floatingChat.open(conversations[0].id);
            } else {
              floatingChat.open();
            }
          }}
          className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/30 ring-3 ring-white hover:scale-105 active:scale-95 transition relative overflow-hidden"
          title="Mở Chat với Môi giới"
        >
          {conversation && other ? (
            <img src={otherAvatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
        </button>

        {/* 2. AI Assistant Button (Stacked right underneath) */}
        <button
          type="button"
          onClick={() => floatingChat.openAi()}
          className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/30 ring-3 ring-white hover:scale-105 active:scale-95 transition"
          title="Mở Trợ lý AI Bất động sản"
        >
          <Bot className="h-6 w-6" />
        </button>
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
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-slate-900 text-xs truncate">{otherName}</h3>
                    {other?.role === 'agent' && (
                      <span title="Môi giới xác minh" className="inline-flex">
                        <Shield className="h-3 w-3 text-brand-600 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {other?.phone ? other.phone : 'Môi giới BĐS Pro'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Window controls */}
          <div className="flex items-center gap-0.5 text-slate-400">
            <button
              type="button"
              onClick={() => {
                floatingChat.close();
                navigate(
                  state.activeTab === 'broker' && state.conversationId
                    ? `${CLIENT_ROUTES.chat}?conv=${state.conversationId}`
                    : CLIENT_ROUTES.chat
                );
              }}
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Mở toàn màn hình"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => floatingChat.close()}
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Đóng chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── TAB 1: BROKER CHAT BODY ── */}
        {state.activeTab === 'broker' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Attached property banner */}
            {conversation?.property && (
              <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/70 px-3 py-1.5 text-xs shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-950 truncate max-w-[150px] sm:max-w-[200px]">
                    {conversation.property.title}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold hidden sm:inline shrink-0">
                    ({formatPrice(conversation.property.price, conversation.property.transactionType as any)})
                  </span>
                </div>
                <a
                  href={`/client/property/${conversation.property.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition ml-1"
                >
                  Xem tin
                </a>
              </div>
            )}

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/40">
              {loading && messages.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  <RefreshCw className="mx-auto h-5 w-5 animate-spin text-brand-600 mb-2" />
                  Đang tải tin nhắn...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  <MessageCircle className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">Chưa có tin nhắn nào</p>
                  <p className="mt-1 text-slate-400">Gửi lời chào để bắt đầu trao đổi với môi giới!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && (
                        <img
                          src={otherAvatar}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover border border-slate-200 shrink-0 mb-1"
                        />
                      )}
                      <div className="max-w-[78%] space-y-0.5">
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                            isOwn
                              ? 'bg-brand-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <p className={`text-[10px] text-slate-400 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 bg-white/90 px-3 py-1.5 text-[11px] no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => handleSendMessage('Bất động sản này còn trống không ạ?')}
                className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition"
              >
                Căn này còn không?
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Cho tôi hỏi thêm về pháp lý và sổ hồng?')}
                className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition"
              >
                Hỏi pháp lý sổ
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Tôi có thể hẹn lịch xem nhà trực tiếp không?')}
                className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition"
              >
                Hẹn xem nhà
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5 border-t border-slate-200 bg-white p-2.5 shrink-0"
            >
              <input
                type="text"
                placeholder="Nhắn tin cho môi giới..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-100 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition shrink-0"
                title="Gửi tin nhắn"
              >
                {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
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
                        className={`inline-block rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
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
                    <Bot className="h-3 w-3" />
                  </div>
                  <span className="italic">AI đang phân tích dữ liệu...</span>
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
                  placeholder="Hỏi AI về giá cả, vị trí, sổ đỏ..."
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
