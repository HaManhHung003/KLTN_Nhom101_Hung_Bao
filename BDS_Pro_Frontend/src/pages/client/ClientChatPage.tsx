import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, MessageSquare } from 'lucide-react';
import { RealtimeChatBox } from '@/components/chat/RealtimeChatBox';
import { ChatbotView } from '@/pages/shared/ChatbotView';
import { CLIENT_ROUTES } from '@/config/routes';

export function ClientChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const convId = searchParams.get('conv') || undefined;
  const initialTab = convId ? 'broker' : searchParams.get('tab') === 'broker' ? 'broker' : 'ai';

  const [activeTab, setActiveTab] = useState<'ai' | 'broker'>(initialTab);

  const switchTab = (tab: 'ai' | 'broker') => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    if (tab === 'ai') {
      nextParams.delete('conv');
    }
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition ${
              activeTab === 'ai'
                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-500/20'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {activeTab === 'ai' ? <Bot className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {activeTab === 'ai' ? 'Trợ lý AI Bất động sản 24/7' : 'Hội thoại trực tiếp với Môi giới'}
            </h1>
            <p className="text-xs text-slate-500">
              {activeTab === 'ai'
                ? 'Hỏi đáp pháp lý, tính lãi suất vay và nhận gợi ý BĐS thông minh từ AI'
                : 'Trò chuyện 1-1 thời gian thực với chủ sở hữu và môi giới niêm yết'}
            </p>
          </div>
        </div>

        {/* Tab pill toggle */}
        <div className="flex rounded-2xl bg-slate-100 p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => switchTab('ai')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>🤖 Trợ lý AI Thông Minh</span>
          </button>
          <button
            type="button"
            onClick={() => switchTab('broker')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'broker'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>💬 Chat với Môi giới</span>
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === 'ai' ? (
        <ChatbotView
          title="Trợ lý AI BDS Pro"
          description="Hỏi bất kỳ điều gì: Tìm nhà theo giá tiền, khu vực, thủ tục sổ hồng hoặc lãi suất vay mua nhà."
          transferPath={CLIENT_ROUTES.activity}
          transferLabel="Chuyển sang nhắn tin với môi giới thật"
        />
      ) : (
        <div className="h-[calc(100vh-14rem)] min-h-[550px]">
          <RealtimeChatBox initialConversationId={convId} />
        </div>
      )}
    </div>
  );
}
