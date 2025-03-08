import axios from 'axios';
import { browser } from '$app/environment';
import { setupInterceptors } from './interceptors';
import { getToken } from '$lib/stores/auth';

// 환경 변수에서 API URL 가져오기
const API_URL = browser ? import.meta.env.PUBLIC_AUTH_API_URL : '';

// 사용자 데이터 타입 정의
export interface UserData {
  email: string;
  password: string;
  name?: string;
  // 필요한 다른 필드 추가
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    [key: string]: unknown;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

// axios 인스턴스 생성
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 인터셉터 설정
setupInterceptors(authApi, {
  getToken,
  refreshToken: async () => {
    try {
      const refreshToken = browser ? localStorage.getItem('refreshToken') : null;
      if (!refreshToken) return null;

      const response = await authApi.post<LoginResponse>('/auth/refresh', {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token } = response.data;
      
      if (browser) {
        localStorage.setItem('token', access_token);
        localStorage.setItem('refreshToken', refresh_token);
      }
      
      return access_token;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      return null;
    }
  }
});

// API 함수들
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await authApi.post<LoginResponse>('/auth/login', {
    email,
    password
  });
  return response.data;
};

export const register = async (userData: UserData): Promise<LoginResponse> => {
  const response = await authApi.post<LoginResponse>('/auth/register', userData);
  return response.data;
};

export const logout = async (): Promise<boolean> => {
  try {
    await authApi.post('/auth/logout');
    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<UserResponse | null> => {
  try {
    const response = await authApi.get<UserResponse>('/auth/me');
    return response.data;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    return null;
  }
};

export default authApi; 