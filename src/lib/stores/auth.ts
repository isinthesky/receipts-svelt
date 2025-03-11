import axios, { AxiosError } from 'axios';
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import * as authApi from '$lib/api/auth';
import type { UserData, UserResponseData } from '$lib/api/auth';
import { 
  getTokenFromStorage, 
  getRefreshTokenFromStorage, 
  saveTokensToStorage, 
  removeTokensFromStorage 
} from '$lib/api/auth';

// 사용자 타입 정의
type User = UserResponseData;

// 인증 상태 타입 정의
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// 초기 상태
const initialState: AuthState = {
  user: null,
  token: getTokenFromStorage(),
  refreshToken: getRefreshTokenFromStorage(),
  loading: false,
  error: null
};

// 인증 스토어 생성
const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    // 로그인
    login: async (email: string, password: string, rememberMe: boolean = false) => {
      console.log('authStore.login 호출됨:', email, password, rememberMe);
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        console.log('authApi.login 호출 직전:', email, password, rememberMe);
        const apiResponse = await authApi.login(email, password, rememberMe);
        console.log('로그인 응답:', apiResponse);
        
        // 응답 구조 확인
        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.message || '유효하지 않은 응답 형식입니다.');
        }
        
        const { user, tokens } = apiResponse.data;
        
        // 토큰 저장 (auth.ts의 함수 사용)
        saveTokensToStorage(tokens.access_token, tokens.refresh_token);
        
        update(state => ({
          ...state,
          user,
          token: tokens.access_token,
          refreshToken: tokens.refresh_token,
          loading: false
        }));
        
        return true;
      } catch (error: unknown) {
        console.error('로그인 오류:', error);
        let errorMessage = '로그인 실패';
        
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          console.error('API 오류 응답:', axiosError.response?.data);
          
          if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
            const data = axiosError.response.data as Record<string, unknown>;
            errorMessage = (data.message as string) || '로그인 실패';
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        update(state => ({ ...state, loading: false, error: errorMessage }));
        return false;
      }
    },
    
    // 회원가입
    register: async (userData: UserData) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await authApi.register(userData);
        
        if (!response.success || !response.data) {
          throw new Error(response.message || '유효하지 않은 응답 형식입니다.');
        }
        
        const { user, tokens } = response.data;
        
        // 토큰 저장 (auth.ts의 함수 사용)
        saveTokensToStorage(tokens.access_token, tokens.refresh_token);
        
        update(state => ({
          ...state,
          user,
          token: tokens.access_token,
          refreshToken: tokens.refresh_token,
          loading: false
        }));
        
        return true;
      } catch (error: unknown) {
        console.error('회원가입 오류:', error);
        let errorMessage = '회원가입 실패';
        
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          console.error('API 오류 응답:', axiosError.response?.data);
          
          if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
            const data = axiosError.response.data as Record<string, unknown>;
            errorMessage = (data.message as string) || '회원가입 실패';
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        update(state => ({ ...state, loading: false, error: errorMessage }));
        return false;
      }
    },
    
    // 로그아웃
    logout: async () => {
      update(state => ({ ...state, loading: true }));
      
      try {
        await authApi.logout();
      } catch (error) {
        console.error('로그아웃 오류:', error);
      } finally {
        // 토큰 삭제 (auth.ts의 함수 사용)
        removeTokensFromStorage();
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          loading: false,
          error: null
        });
        
        // 로그인 페이지로 리다이렉트
        if (browser) {
          goto('/login');
        }
      }
    },
    
    // 사용자 정보 가져오기
    fetchUser: async () => {
      // 토큰이 없으면 실행하지 않음
      const token = getTokenFromStorage();
      if (!token) return false;
      
      update(state => ({ ...state, loading: true }));
      
      try {
        const userResponse = await authApi.getCurrentUser();
        
        if (userResponse && userResponse.success && userResponse.data) {
          const userData = userResponse.data;
          update(state => ({
            ...state,
            user: userData,
            loading: false
          }));
          return true;
        } else {
          // 사용자 정보를 가져오지 못한 경우 false 반환
          // 로그아웃 처리는 호출자에서 결정하도록 함
          update(state => ({
            ...state,
            loading: false,
            error: userResponse?.message || '세션이 만료되었습니다.'
          }));
          return false;
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        let errorMessage = '사용자 정보 가져오기 실패';
        
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          
          // 401 오류인 경우 세션 만료로 처리하지만 토큰은 유지
          // 리프레시 토큰 처리는 호출자에서 수행
          if (axiosError.response?.status === 401) {
            update(state => ({
              ...state,
              loading: false,
              error: '세션이 만료되었습니다.'
            }));
            return false;
          }
          
          if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
            const data = axiosError.response.data as Record<string, unknown>;
            errorMessage = (data.message as string) || errorMessage;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        update(state => ({ ...state, loading: false, error: errorMessage }));
        return false;
      }
    },
    
    // 토큰 업데이트 (리프레시 토큰 성공 시 호출)
    updateTokens: (accessToken: string, refreshToken: string) => {
      saveTokensToStorage(accessToken, refreshToken);
      
      update(state => ({
        ...state,
        token: accessToken,
        refreshToken: refreshToken
      }));
    },
    
    // 오류 초기화
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
    
    // 토큰 가져오기
    getToken: () => {
      return getTokenFromStorage();
    }
  };
};

// 인증 스토어 인스턴스 생성
export const authStore = createAuthStore();

// 파생 스토어: 인증 여부
export const isAuthenticated = derived(
  authStore,
  $authStore => !!$authStore.token && !!$authStore.user
);

// 토큰 가져오기 함수 (인터셉터에서 사용)
export const getToken = () => {
  let token = null;
  
  // 스토어에서 토큰 가져오기
  const unsubscribe = authStore.subscribe(state => {
    token = state.token;
  });
  
  unsubscribe();
  
  return token;
}; 