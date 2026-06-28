import { create } from "zustand";
import { login as loginApi, register as registerApi } from "@/lib/api/auth";
import type { LoginRequest, RegisterRequest } from "@/lib/api/auth";

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  isAuthenticated: false,

  /**
   * 로그인 후 JWT 토큰을 localStorage와 상태에 저장한다.
   */
  login: async (data) => {
    const response = await loginApi(data);
    localStorage.setItem("token", response.accessToken);
    localStorage.setItem("username", data.username);
    set({
      token: response.accessToken,
      username: data.username,
      isAuthenticated: true,
    });
  },

  /**
   * 회원가입 후 JWT 토큰을 localStorage와 상태에 저장한다.
   */
  register: async (data) => {
    const response = await registerApi(data);
    localStorage.setItem("token", response.accessToken);
    localStorage.setItem("username", data.username);
    set({
      token: response.accessToken,
      username: data.username,
      isAuthenticated: true,
    });
  },

  /**
   * 로그아웃 시 localStorage와 상태를 초기화한다.
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    set({ token: null, username: null, isAuthenticated: false });
  },

  /**
   * 앱 초기 로드 시 localStorage에서 인증 상태를 복원한다.
   */
  initializeAuth: () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      set({ token, username, isAuthenticated: true });
    }
  },
}));
