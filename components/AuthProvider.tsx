"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * 앱 초기 로드 시 localStorage에서 인증 상태를 복원하는 프로바이더
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
