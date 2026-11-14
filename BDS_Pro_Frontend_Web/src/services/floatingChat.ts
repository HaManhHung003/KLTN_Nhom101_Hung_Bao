type Listener = () => void;

export type FloatingChatTab = 'broker' | 'ai';

interface FloatingChatState {
  isOpen: boolean;
  activeTab: FloatingChatTab;
  conversationId: string | null;
}

class FloatingChatManager {
  private state: FloatingChatState = {
    isOpen: false,
    activeTab: 'broker',
    conversationId: null,
  };

  private listeners: Set<Listener> = new Set();

  getState(): FloatingChatState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  open(conversationId?: string) {
    this.state = {
      isOpen: true,
      activeTab: 'broker',
      conversationId: conversationId !== undefined ? conversationId : this.state.conversationId,
    };
    this.notify();
  }

  openAi() {
    this.state = {
      ...this.state,
      isOpen: true,
      activeTab: 'ai',
    };
    this.notify();
  }

  setTab(tab: FloatingChatTab) {
    this.state = {
      ...this.state,
      activeTab: tab,
    };
    this.notify();
  }

  close() {
    this.state = {
      ...this.state,
      isOpen: false,
    };
    this.notify();
  }

  toggle() {
    this.state = {
      ...this.state,
      isOpen: !this.state.isOpen,
    };
    this.notify();
  }
}

export const floatingChat = new FloatingChatManager();
