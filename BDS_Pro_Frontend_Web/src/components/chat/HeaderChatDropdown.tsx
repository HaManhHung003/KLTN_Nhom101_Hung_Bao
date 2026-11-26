import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MessageCircle, RefreshCw, Search, Shield } from 'lucide-react';
import { chatService, type ConversationItem } from '@/services/chat.service';
import { authStorage } from '@/services/auth.service';
import { floatingChat } from '@/services/floatingChat';
import { CLIENT_ROUTES } from '@/config/routes';

export function HeaderChatDropdown() {
  const currentUser = authStorage.getUser();
  const currentUserId = currentUser?.id || '';

  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const list = await chatService.getConversations();
      setConversations(list);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // Poll every 10s for new message notifications on header
    const timer = setInterval(() => {
      chatService.getConversations().then(setConversations).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpenConversation = (convId: string) => {
    setOpen(false);
    floatingChat.open(convId);
  };

  const filtered = conversations.filter((c) => {
    const other = chatService.getOtherParticipant(c, currentUserId);
    const query = search.toLowerCase();
    const nameMatch = other?.name?.toLowerCase().includes(query);
    const propMatch = c.property?.title?.toLowerCase().includes(query);
    return nameMatch || propMatch;
  });

  return (
    <div className="relative" ref={popoverRef}>
      {/* ── HEADER ICON BUTTON ── */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) loadConversations();
        }}
        className={`relative rounded-xl p-2 sm:p-2.5 transition ${
          open ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        }`}
        title="Tin nhắn với Môi giới"
        aria-label="Tin nhắn với Môi giới"
      >
        <MessageCircle className="h-5 w-5" />
        {conversations.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {conversations.length}
          </span>
        )}
      </button>

      {/* ── DROPDOWN POPOVER ── */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[340px] sm:w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden transition animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="border-b border-slate-100 p-3.5 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Đoạn chat ({conversations.length})</h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Môi giới
                </span>
              </div>
              <button
                type="button"
                onClick={loadConversations}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                title="Cập nhật"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm môi giới hoặc bài đăng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
            {loading && conversations.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                <RefreshCw className="mx-auto h-5 w-5 animate-spin text-brand-600 mb-2" />
                Đang nạp cuộc trò chuyện...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 px-4 text-center text-xs text-slate-400">
                <MessageCircle className="mx-auto h-8 w-8 text-slate-300 mb-1.5" />
                <p className="font-semibold text-slate-600">Chưa có cuộc trò chuyện nào</p>
                <p className="mt-1">
                  Khi bạn bấm "Chat với môi giới" tại trang BĐS, đoạn chat sẽ tự động lưu tại đây.
                </p>
              </div>
            ) : (
              filtered.map((conv) => {
                const other = chatService.getOtherParticipant(conv, currentUserId);
                const name = other?.name || 'Môi giới BĐS';
                const avatar =
                  other?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleOpenConversation(conv.id)}
                    className="w-full text-left p-3 hover:bg-slate-50 transition flex items-start gap-3 group"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={avatar}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-slate-900 text-xs truncate group-hover:text-brand-600 transition flex items-center gap-1">
                          {name}
                          {other?.role === 'agent' && (
                            <Shield className="h-3 w-3 text-brand-600 shrink-0" />
                          )}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {conv.lastMessageAt
                            ? new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      {/* Associated Property */}
                      {conv.property && (
                        <p className="text-[11px] font-medium text-emerald-700 truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {conv.property.title}
                        </p>
                      )}

                      {/* Last Message */}
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/70 p-2.5 text-center">
            <Link
              to={CLIENT_ROUTES.chat}
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1"
            >
              Xem tất cả trong Hộp thư ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
