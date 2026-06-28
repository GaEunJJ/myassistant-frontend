/**
 * fetch API 기반 SSE 스트리밍으로 AI 채팅 응답을 수신한다.
 * EventSource는 Authorization 헤더를 지원하지 않아 fetch 방식 사용.
 *
 * @param message 사용자 질문
 * @param onChunk 토큰 단위로 수신할 때마다 호출되는 콜백
 * @param onDone 스트리밍 완료 시 호출되는 콜백
 */
export const streamChat = async (
  message: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> => {
  const token = localStorage.getItem("token");
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/chat/stream?message=${encodeURIComponent(message)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
  });

  if (!response.body) {
    onDone();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // SSE 형식 "data: ...\n\n" 에서 실제 데이터 추출
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data:")) {
        onChunk(line.replace("data:", "").trim());
      }
    }
  }

  onDone();
};
