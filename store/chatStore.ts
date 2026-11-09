import { create } from "zustand";

export interface SourceInfo {
  filename: string;
  page: number | null;
  chunkIndex: number | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceInfo[];
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  addUserMessage: (content: string) => void;
  startAssistantMessage: () => string;
  appendToLastMessage: (chunk: string) => void;
  setSourcesForLastMessage: (sources: SourceInfo[]) => void;
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

  /**
   * 마지막 assistant 메시지에 출처(파일명/페이지/청크 순번 목록)를 반영한다.
   * 출처 이벤트는 답변 토큰 스트리밍보다 먼저 도착하므로 빈 assistant 메시지에 바로 붙는다.
   */
  setSourcesForLastMessage: (sources) =>
    set((state) => {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = { ...last, sources };
      }
      return { messages };
    }),

  setIsStreaming: (value) => set({ isStreaming: value }),

  clearMessages: () => set({ messages: [] }),
}));
