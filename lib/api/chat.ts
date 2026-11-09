import type { SourceInfo } from "@/store/chatStore";

/**
 * fetch API 기반 SSE 스트리밍으로 AI 채팅 응답과 출처를 수신한다.
 * EventSource는 Authorization 헤더를 지원하지 않아 fetch 방식 사용.
 *
 * @param message 사용자 질문
 * @param onSources 답변에 사용된 출처(파일명/페이지/청크 순번 목록) 수신 시 호출되는 콜백
 * @param onChunk 답변 토큰 수신 시마다 호출되는 콜백
 * @param onDone 스트리밍 완료 시 호출되는 콜백
 */
export const streamChat = async (
  message: string,
  onSources: (sources: SourceInfo[]) => void,
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
  // fetch 청크 경계가 SSE 이벤트 경계와 일치하지 않을 수 있어 완전한 이벤트가 쌓일 때까지 버퍼링
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE 이벤트는 빈 줄("\n\n")로 구분됨
    const rawEvents = buffer.split("\n\n");
    buffer = rawEvents.pop() ?? "";

    for (const rawEvent of rawEvents) {
      const { event, data } = parseEvent(rawEvent);
      if (event === "sources") {
        onSources(JSON.parse(data) as SourceInfo[]);
      } else if (event === "token") {
        onChunk(data);
      }
    }
  }

  onDone();
};

/**
 * SSE 이벤트 블록에서 event 타입과 data 값을 추출한다.
 *
 * @param rawEvent "event: ...\ndata: ..." 형태의 SSE 이벤트 블록
 * @return 이벤트 타입과 data 문자열
 */
function parseEvent(rawEvent: string): { event: string; data: string } {
  let event = "message";
  const dataLines: string[] = [];

  for (const line of rawEvent.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.replace(/^event:\s*/, "");
    } else if (line.startsWith("data:")) {
      // "data:" 만 제거하고 trim 하지 않음 — LLM 토큰은 앞 공백이 단어 구분자
      dataLines.push(line.replace(/^data:/, ""));
    }
  }

  return { event, data: dataLines.join("\n") };
}
