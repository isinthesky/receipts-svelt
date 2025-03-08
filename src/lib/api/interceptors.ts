import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

// 확장된 요청 설정 타입
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * API 인터셉터 설정 함수
 * @param axiosInstance axios 인스턴스
 * @param options 인터셉터 옵션
 */
export const setupInterceptors = (
  axiosInstance: AxiosInstance,
  options: {
    onUnauthorized?: () => void;
    getToken?: () => string | null;
    refreshToken?: () => Promise<string | null>;
  } = {}
) => {
  // 요청 인터셉터
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 토큰이 있으면 헤더에 추가
      if (options.getToken) {
        const token = options.getToken();
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      // 원본 요청 설정
      const originalRequest = error.config as ExtendedAxiosRequestConfig;
      
      // 리프레시 토큰 요청 자체에 대한 오류는 바로 반환
      if (originalRequest.url?.includes('refresh') && error.response?.status === 401) {
        // 리프레시 토큰 요청 실패 시 인증 실패 처리
        if (options.onUnauthorized) {
          options.onUnauthorized();
        }
        return Promise.reject(error);
      }
      
      // 401 Unauthorized 오류 처리
      if (error.response?.status === 401 && !originalRequest._retry) {
        // 토큰 갱신 시도
        if (options.refreshToken) {
          try {
            // 재시도 플래그 설정
            originalRequest._retry = true;
            
            const newToken = await options.refreshToken();
            if (newToken) {
              // 새 토큰으로 요청 재시도
              originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
              return axiosInstance(originalRequest);
            } else {
              // 토큰 갱신 실패 시 인증 실패 처리
              if (options.onUnauthorized) {
                options.onUnauthorized();
              }
            }
          } catch (refreshError) {
            console.error('토큰 갱신 실패:', refreshError);
            // 토큰 갱신 실패 시 인증 실패 처리
            if (options.onUnauthorized) {
              options.onUnauthorized();
            }
          }
        } else {
          // 리프레시 토큰 함수가 없는 경우 인증 실패 처리
          if (options.onUnauthorized) {
            options.onUnauthorized();
          } else if (browser) {
            // 기본 동작: 로그인 페이지로 리다이렉트
            goto('/login');
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}; 