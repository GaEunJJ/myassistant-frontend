"use client";

import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface SocialProvider {
  id: string;
  label: string;
  bg: string;
  color: string;
  icon: string;
  border?: boolean;
}

const providers: SocialProvider[] = [
  {
    id: "kakao",
    label: "카카오로 시작하기",
    bg: "#FEE500",
    color: "#000000",
    icon: "/kakao.svg",
  },
  {
    id: "naver",
    label: "네이버로 시작하기",
    bg: "#03C75A",
    color: "#FFFFFF",
    icon: "/naver.svg",
  },
  {
    id: "google",
    label: "Google로 시작하기",
    bg: "#FFFFFF",
    color: "#000000",
    icon: "/google.svg",
    border: true,
  },
];

export function SocialLoginButtons() {
  const handleLogin = (provider: string) => {
    window.location.assign(`${BACKEND_URL}/oauth2/authorization/${provider}`);
  };

  return (
    <div className="space-y-3">
      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">또는 소셜 계정으로 로그인</span>
        </div>
      </div>

      {/* 소셜 로그인 버튼 목록 */}
      <div className="space-y-2">
        {providers.map(({ id, label, bg, color, icon, border }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleLogin(id)}
            style={{ backgroundColor: bg, color }}
            className={`w-full flex items-center justify-center gap-2.5 h-10 px-4 rounded-md text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer${border ? " border border-border" : ""}`}
          >
            <Image
              src={icon}
              alt={`${id} 로고`}
              width={18}
              height={18}
              className="shrink-0"
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
