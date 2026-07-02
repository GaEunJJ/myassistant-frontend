"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { streamChat } from "@/lib/api/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DocumentUploadDialog from "@/components/DocumentUploadDialog";

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, username, logout } = useAuthStore();
  const { messages, isStreaming, addUserMessage, startAssistantMessage, appendToLastMessage, setIsStreaming } =
    useChatStore();

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 비로그인 사용자 로그인 페이지로 이동
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // 새 메시지가 추가될 때마다 스크롤을 최하단으로 이동
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setInput("");
    addUserMessage(trimmed);
    startAssistantMessage();
    setIsStreaming(true);

    await streamChat(
      trimmed,
      // flushSync: 토큰마다 즉시 강제 렌더링하여 스트리밍 효과 구현
      (chunk) => flushSync(() => appendToLastMessage(chunk)),
      () => setIsStreaming(false)
    );
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-lg font-semibold">My Assistant</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{username}</span>
          <DocumentUploadDialog />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      {/* 메시지 목록 */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-24">
              <p className="text-xl font-medium">무엇이든 물어보세요</p>
              <p className="text-sm mt-2">문서를 업로드하면 문서 기반으로 답변합니다</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.content}
                {/* 스트리밍 중인 마지막 assistant 메시지에 커서 표시 */}
                {isStreaming &&
                  message.role === "assistant" &&
                  message === messages[messages.length - 1] && (
                    <span className="inline-block w-1 h-4 ml-0.5 bg-current animate-pulse" />
                  )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* 입력창 */}
      <footer className="px-4 py-4 border-t">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={isStreaming}
            className="flex-1"
          />
          <Button type="submit" disabled={isStreaming || !input.trim()}>
            {isStreaming ? "응답 중..." : "전송"}
          </Button>
        </form>
      </footer>
    </div>
  );
}
