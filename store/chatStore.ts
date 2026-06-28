import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  addUserMessage: (content: string) => void;
  startAssistantMessage: () => string;
  appendToLastMessage: (chunk: string) => void;
  setIsStreaming: (value: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,

  addUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: crypto.randomUUID(), role: "user", content },
      ],
    })),

  /**
   * 빈 assistant 메시지를 추가하고 해당 메시지의 id를 반환한다.
   * 스트리밍 토큰을 순차적으로 이어붙이기 위한 슬롯 생성용.
   */
  startAssistantMessage: () => {
    const id = crypto.randomUUID();
    set((state) => ({
      messages: [...state.messages, { id, role: "assistant", content: "" }],
    }));
    return id;
  },

  appendToLastMessage: (chunk) =>
    set((state) => {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          content: last.content + chunk,
        };
      }
      return { messages };
    }),

  setIsStreaming: (value) => set({ isStreaming: value }),

  clearMessages: () => set({ messages: [] }),
}));
