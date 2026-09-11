import { useSearchParams } from 'react-router-dom';
import { RealtimeChatBox } from '@/components/chat/RealtimeChatBox';

interface BuyerChatProps {
  embedded?: boolean;
  selectedId?: string;
}

export function BuyerChat({ embedded = false, selectedId }: BuyerChatProps) {
  const [searchParams] = useSearchParams();
  const convParam = searchParams.get('conv') || undefined;

  return (
    <div className="w-full">
      <RealtimeChatBox
        initialConversationId={selectedId || convParam}
        embedded={embedded}
      />
    </div>
  );
}
