import apiClient from "./client";

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

/**
 * 회원가입 후 JWT 토큰을 반환한다.
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/api/auth/register", data);
  return response.data;
};

/**
 * 로그인 후 JWT 토큰을 반환한다.
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
  return response.data;
};
