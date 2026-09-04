import { ChatbotView } from '@/pages/shared/ChatbotView';
import { CLIENT_ROUTES } from '@/config/routes';

export function ClientChatbotPage() {
  return (
    <ChatbotView
      messages={[]}
      title="Trợ lý AI BĐS"
      description="Mô tả nhu cầu — ngân sách, khu vực, loại BĐS — để nhận gợi ý phù hợp."
      transferPath={CLIENT_ROUTES.activity}
      transferLabel="Chat với môi giới"
    />
  );
}
