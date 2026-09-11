import { useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { RealtimeChatBox } from '@/components/chat/RealtimeChatBox';

export function ClientChatPage() {
  const [searchParams] = useSearchParams();
  const convId = searchParams.get('conv') || undefined;

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
            <MessageSquare className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Trò chuyện trực tiếp & Trợ lý AI</h1>
            <p className="text-sm text-slate-500">
              Nhắn tin trực tiếp với môi giới bất động sản · Kết nối CSDL MySQL thời gian thực
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <RealtimeChatBox initialConversationId={convId} />
      </div>
    </div>
  );
}
