import { ChatbotView } from '@/pages/shared/ChatbotView'
import { chatbotMessages } from '@/data/mockData'
import { CLIENT_ROUTES } from '@/config/routes'

export function ClientChatbotPage() {
  return (
    <ChatbotView
      messages={chatbotMessages}
      title="Trợ lý AI BĐS"
      description="Mô tả nhu cầu — ngân sách, khu vực, loại BĐS — để nhận gợi ý phù hợp."
      transferPath={CLIENT_ROUTES.activity}
      transferLabel="Chat với môi giới"
    />
  )
}
