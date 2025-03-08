import axios from 'axios';
import { browser } from '$app/environment';
import { setupInterceptors } from './interceptors';
// 순환 참조 문제를 해결하기 위해 getToken 가져오기 제거
// import { getToken } from '$lib/stores/auth';

// 환경 변수에서 API URL 가져오기
// const API_URL = browser ? import.meta.env.PUBLIC_AUTH_API_URL : 'http://facreport.iptime.org:5009';
const API_URL = 'http://facreport.iptime.org:5009';
console.log('API_URL', API_URL);

// 사용자 데이터 타입 정의
export interface UserData {
  email: string;
  password: string;
  username?: string;
  name?: string;
  // 필요한 다른 필드 추가
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    [key: string]: unknown;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

// 토큰 가져오기 함수 (인터셉터에서 사용)
export const getTokenFromStorage = (): string | null => {
  if (browser) {
    return localStorage.getItem('token');
  }
  return null;
};

// 리프레시 토큰 가져오기 함수
export const getRefreshTokenFromStorage = (): string | null => {
  if (browser) {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

// 토큰 저장 함수
export const saveTokensToStorage = (accessToken: string, refreshToken: string): void => {
  if (browser) {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// 토큰 삭제 함수
export const removeTokensFromStorage = (): void => {
  if (browser) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

// 리프레시 토큰 요청 중인지 확인하는 플래그
let isRefreshing = false;
// 리프레시 토큰 요청 대기 중인 요청들
let refreshSubscribers: Array<(token: string) => void> = [];

// 리프레시 토큰 성공 시 대기 중인 요청들 처리
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// 리프레시 토큰 실패 시 대기 중인 요청들 처리
const onRefreshFailed = () => {
  refreshSubscribers = [];
};

// 리프레시 토큰 요청을 위한 별도의 axios 인스턴스 (인터셉터 없음)
const refreshApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// axios 인스턴스 생성
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 리프레시 토큰 함수
export const refreshAuthToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshTokenFromStorage();
  if (!refreshToken) return null;

  try {
    // 이미 리프레시 중이면 새로운 Promise 반환
    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        refreshSubscribers.push((token: string) => {
          resolve(token);
        });
      });
    }

    isRefreshing = true;

    // 인터셉터가 없는 인스턴스로 요청
    const response = await refreshApi.post<LoginResponse>('api/v1/auth/common/refresh', {
      refresh_token: refreshToken
    });

    const { tokens } = response.data;
    saveTokensToStorage(tokens.access_token, tokens.refresh_token);
    
    // authStore 업데이트 (동적 가져오기로 순환 참조 방지)
    try {
      const { authStore } = await import('$lib/stores/auth');
      authStore.updateTokens(tokens.access_token, tokens.refresh_token);
    } catch (err) {
      console.error('authStore 업데이트 실패:', err);
    }
    
    isRefreshing = false;
    onRefreshed(tokens.access_token);
    
    return tokens.access_token;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    removeTokensFromStorage();
    isRefreshing = false;
    onRefreshFailed();
    
    // authStore 업데이트 (동적 가져오기로 순환 참조 방지)
    try {
      const { authStore } = await import('$lib/stores/auth');
      authStore.logout();
    } catch (err) {
      console.error('authStore 로그아웃 실패:', err);
      // 브라우저에서 로그인 페이지로 리다이렉트
      if (browser) {
        window.location.href = '/login';
      }
    }
    
    return null;
  }
};

// 인터셉터 설정
setupInterceptors(authApi, {
  getToken: getTokenFromStorage,
  refreshToken: refreshAuthToken,
  onUnauthorized: () => {
    // 인증 실패 시 토큰 삭제 및 로그인 페이지로 이동
    removeTokensFromStorage();
    if (browser) {
      window.location.href = '/login';
    }
  }
});

// API 함수들
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  console.log('API login 호출됨:', email, password);
  const response = await authApi.post<LoginResponse>('api/v1/auth/local/login', {
    username: email,
    password
  });
  
  // 로그인 성공 시 토큰 저장
  const { tokens } = response.data;
  saveTokensToStorage(tokens.access_token, tokens.refresh_token);
  
  return response.data;
};

export const register = async (userData: UserData): Promise<LoginResponse> => {
  const requestData = {
    ...userData,
    username: userData.username || userData.email
  };
  
  const response = await authApi.post<LoginResponse>('api/v1/auth/local/register', requestData);
  
  // 회원가입 성공 시 토큰 저장
  const { tokens } = response.data;
  saveTokensToStorage(tokens.access_token, tokens.refresh_token);
  
  return response.data;
};

export const logout = async (): Promise<boolean> => {
  try {
    await authApi.post('api/v1/auth/common/logout');
    removeTokensFromStorage();
    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    // 로그아웃 실패해도 토큰은 삭제
    removeTokensFromStorage();
    return false;
  }
};

export const getCurrentUser = async (): Promise<UserResponse | null> => {
  try {
    const response = await authApi.get<UserResponse>('api/v1/users/me');
    return response.data;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    return null;
  }
};

export default authApi; 