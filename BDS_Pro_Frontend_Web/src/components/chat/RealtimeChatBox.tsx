import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Send,
  Shield,
} from 'lucide-react';
import { chatService, type ChatMessageItem, type ConversationItem } from '@/services/chat.service';
import { authStorage } from '@/services/auth.service';
import { formatPrice } from '@/utils/format';

interface RealtimeChatBoxProps {
  initialConversationId?: string;
  embedded?: boolean;
}

export function RealtimeChatBox({ initialConversationId, embedded = false }: RealtimeChatBoxProps) {
  const currentUser = authStorage.getUser();
  const currentUserId = currentUser?.id || '';

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(initialConversationId || '');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any>(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // 1. Fetch conversations
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingConvs(true);
    try {
      const list = await chatService.getConversations();
      setConversations(list);

      // If no active conversation yet and list has items
      if (!activeConvId && list.length > 0) {
        setActiveConvId(initialConversationId || list[0].id);
      }
    } catch {
      // Ignored
    } finally {
      if (!silent) setLoadingConvs(false);
    }
  };

  // 2. Fetch messages for active conversation
  const fetchMessages = async (convId: string, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingMessages(true);
    try {
      const msgs = await chatService.getMessages(convId);
      setMessages(msgs);
      if (!silent) {
        setTimeout(() => scrollToBottom(false), 50);
      }
    } catch {
      // Ignored
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Initial load & sync with prop
  useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
    }
    fetchConversations();
  }, [initialConversationId]);

  // When active conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId]);

  // Polling every 3.5s for real-time updates
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchConversations(true);
      if (activeConvId) {
        fetchMessages(activeConvId, true);
      }
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConvId]);

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConvId || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMsg = await chatService.sendMessage(activeConvId, textToSend);
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => scrollToBottom(true), 50);

      // Refresh conversations list to update lastMessage
      fetchConversations(true);
    } catch (err: any) {
      alert(err.message || 'Không thể gửi tin nhắn');
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  // Handle quick reply suggestions
  const handleQuickSend = (text: string) => {
    setInputText(text);
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherParticipant = activeConv
    ? chatService.getOtherParticipant(activeConv, currentUserId)
    : null;

  // Filtered conversations by search query
  const filteredConversations = conversations.filter((c) => {
    const other = chatService.getOtherParticipant(c, currentUserId);
    const matchName = other.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProp = c.property?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchName || matchProp;
  });

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ${
        embedded ? 'h-[650px]' : 'h-[calc(100vh-8.5rem)] min-h-[550px]'
      } flex flex-col md:flex-row`}
    >
      {/* ── LEFT PANE: CONVERSATION LIST ── */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0 ${
          activeConvId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search header */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-brand-600" />
              Tin nhắn ({conversations.length})
            </h2>
            <button
              type="button"
              onClick={() => fetchConversations()}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`h-4 w-4 ${loadingConvs ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc BĐS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Conversation list scroll area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingConvs && conversations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="mx-auto h-5 w-5 animate-spin text-brand-600 mb-2" />
              Đang nạp cuộc trò chuyện...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-12 px-6 text-center text-xs text-slate-400">
              <MessageCircle className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Chưa có cuộc trò chuyện nào</p>
              <p className="mt-1">
                Khi khách hàng hoặc môi giới liên hệ, hội thoại sẽ tự động xuất hiện tại đây.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = chatService.getOtherParticipant(conv, currentUserId);
              const isSelected = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-4 transition flex items-start gap-3 hover:bg-slate-100/80 ${
                    isSelected ? 'bg-brand-50/70 border-l-4 border-brand-600' : 'bg-white'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        other.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(other.name || 'User')}`
                      }
                      alt=""
                      className="h-11 w-11 rounded-full object-cover border border-slate-200 bg-white"
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-slate-900 text-sm truncate flex items-center gap-1">
                        {other.name || 'Người dùng'}
                        {other.role === 'agent' && (
                          <span title="Môi giới xác minh" className="inline-flex">
                            <Shield className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                          </span>
                        )}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>

                    {/* Associated Property tag if any */}
                    {conv.property && (
                      <p className="mt-0.5 text-[11px] font-medium text-brand-700 truncate flex items-center gap-1">
                        <Building2 className="h-3 w-3 shrink-0" />
                        {conv.property.title}
                      </p>
                    )}

                    {/* Last message preview */}
                    <p className="mt-1 text-xs text-slate-500 truncate">
                      {conv.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANE: ACTIVE CHAT PANE ── */}
      {activeConv && otherParticipant ? (
        <div className={`flex-1 flex flex-col h-full bg-slate-50/30 ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {/* Active Conversation Header */}
          <div className="p-3 md:p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {/* Back button on mobile */}
              <button
                type="button"
                onClick={() => setActiveConvId('')}
                className="md:hidden rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
                title="Quay lại danh sách"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative shrink-0">
                <img
                  src={
                    otherParticipant.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(otherParticipant.name || 'User')}`
                  }
                  alt=""
                  className="h-11 w-11 rounded-full object-cover border border-slate-200"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{otherParticipant.name}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      otherParticipant.role === 'agent'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {otherParticipant.role === 'agent' ? 'Môi giới' : 'Khách hàng'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate flex items-center gap-2">
                  <span>{otherParticipant.email}</span>
                  {otherParticipant.phone && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {otherParticipant.phone}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Link to view property if attached */}
            {activeConv.property && (
              <Link
                to={`/client/property/${activeConv.property.id}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Xem bài đăng BĐS
              </Link>
            )}
          </div>

          {/* Associated Property Mini Banner */}
          {activeConv.property && (
            <div className="bg-emerald-50/60 border-b border-emerald-100/80 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-emerald-900 truncate">
                  Đang trao đổi về: <strong>{activeConv.property.title}</strong>
                </span>
                <span className="text-emerald-700 font-bold hidden sm:inline">
                  ({formatPrice(activeConv.property.price, activeConv.property.transactionType as any)})
                </span>
              </div>
              <Link
                to={`/client/property/${activeConv.property.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-bold hover:underline shrink-0 ml-2"
              >
                Chi tiết ➔
              </Link>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {loadingMessages ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <RefreshCw className="mx-auto h-5 w-5 animate-spin text-brand-600 mb-2" />
                Đang nạp tin nhắn...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <MessageCircle className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600 text-sm">Chưa có tin nhắn trong cuộc trò chuyện này</p>
                <p className="text-xs text-slate-400 mt-1">Hãy gửi lời chào để bắt đầu kết nối!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && (
                      <img
                        src={
                          msg.sender?.avatar ||
                          otherParticipant.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(msg.sender?.name || 'User')}`
                        }
                        alt=""
                        className="h-7 w-7 rounded-full object-cover border border-slate-200 bg-white shrink-0 mb-1"
                      />
                    )}

                    <div className={`max-w-[80%] md:max-w-[70%] space-y-1`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          isOwn
                            ? 'bg-brand-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <p
                        className={`text-[10px] text-slate-400 px-1 ${
                          isOwn ? 'text-right' : 'text-left'
                        }`}
                      >
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

          {/* Quick suggestions pills */}
          <div className="px-4 py-2 bg-white/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-slate-400 text-[11px] shrink-0 font-medium">Gợi ý:</span>
            <button
              type="button"
              onClick={() => handleQuickSend('Bất động sản này hiện tại còn trống không ạ?')}
              className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition shrink-0"
            >
              Căn này còn không ạ?
            </button>
            <button
              type="button"
              onClick={() => handleQuickSend('Cho tôi hỏi thêm về tình trạng pháp lý và sổ hồng/sổ đỏ?')}
              className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition shrink-0"
            >
              Hỏi pháp lý / sổ
            </button>
            <button
              type="button"
              onClick={() => handleQuickSend('Tôi có thể hẹn lịch xem nhà trực tiếp vào cuối tuần này được không?')}
              className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition shrink-0"
            >
              Hẹn lịch xem nhà
            </button>
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 md:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition shrink-0"
              title="Gửi tin nhắn (Enter)"
            >
              {sending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
        </div>
      ) : (
        /* Empty State when no conversation is selected */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/40">
          <MessageCircle className="h-16 w-16 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Chọn cuộc trò chuyện để bắt đầu nhắn tin</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Kết nối trực tiếp giữa khách hàng và môi giới, trao đổi thông tin bất động sản minh bạch và nhanh chóng.
          </p>
        </div>
      )}
    </div>
  );
}
