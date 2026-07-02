"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * 소셜 로그인 완료 후 백엔드가 리다이렉트하는 콜백 페이지.
 * URL: /auth/callback?token=<JWT>
 *
 * JWT payload의 sub(subject)에서 username을 추출하여
 * 기존 로그인 플로우와 동일하게 localStorage와 Zustand 스토어에 저장한다.
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // 토큰이 없으면 로그인 페이지로 복귀
      router.replace("/login");
      return;
    }

    // JWT payload는 서명 없이 base64로 읽을 수 있음 (표시용으로만 사용)
    const username = extractSubject(token) ?? "social_user";

    localStorage.setItem("token", token);
    localStorage.setItem("username", username);

    // Zustand 스토어에 직접 반영
    useAuthStore.setState({ token, username, isAuthenticated: true });

    router.replace("/chat");
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">로그인 처리 중...</p>
    </div>
  );
}

/**
 * JWT의 payload에서 subject(username)를 추출한다.
 *
 * @param token 서버에서 발급한 JWT 문자열
 * @return sub 클레임 값, 파싱 실패 시 null
 */
function extractSubject(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
