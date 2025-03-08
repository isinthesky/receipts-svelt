import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import * as authApi from '$lib/api/auth';
import type { UserData, UserResponse } from '$lib/api/auth';

// 사용자 타입 정의
type User = UserResponse;

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
  token: browser ? localStorage.getItem('token') : null,
  refreshToken: browser ? localStorage.getItem('refreshToken') : null,
  loading: false,
  error: null
};

// 인증 스토어 생성
const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    // 로그인
    login: async (email: string, password: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await authApi.login(email, password);
        const { access_token, refresh_token, user } = response;
        
        if (browser) {
          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', refresh_token);
        }
        
        update(state => ({
          ...state,
          user,
          token: access_token,
          refreshToken: refresh_token,
          loading: false
        }));
        
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '로그인 실패';
        update(state => ({ ...state, loading: false, error: errorMessage }));
        return false;
      }
    },
    
    // 회원가입
    register: async (userData: UserData) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await authApi.register(userData);
        const { access_token, refresh_token, user } = response;
        
        if (browser) {
          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', refresh_token);
        }
        
        update(state => ({
          ...state,
          user,
          token: access_token,
          refreshToken: refresh_token,
          loading: false
        }));
        
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '회원가입 실패';
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
      }
      
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      
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
    },
    
    // 사용자 정보 가져오기
    fetchUser: async () => {
      // 토큰이 없으면 실행하지 않음
      const token = browser ? localStorage.getItem('token') : null;
      if (!token) return false;
      
      update(state => ({ ...state, loading: true }));
      
      try {
        const user = await authApi.getCurrentUser();
        
        if (user) {
          update(state => ({
            ...state,
            user,
            loading: false
          }));
          return true;
        } else {
          // 사용자 정보를 가져오지 못한 경우 로그아웃 처리
          if (browser) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            loading: false,
            error: '세션이 만료되었습니다.'
          });
          
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '사용자 정보 가져오기 실패';
        update(state => ({ ...state, loading: false, error: errorMessage }));
        return false;
      }
    },
    
    // 오류 초기화
    clearError: () => {
      update(state => ({ ...state, error: null }));
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