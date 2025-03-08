import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { ResponseBase } from './auth';

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
    getToken: () => string | null;
    refreshToken: () => Promise<string | null>;
    onUnauthorized: () => void;
  }
) => {
  // 요청 인터셉터
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = options.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
      // 응답 데이터가 없는 경우 기본 응답 형식으로 변환
      if (!response.data) {
        response.data = {
          success: true,
          message: '성공적으로 처리되었습니다.',
          timestamp: new Date().toISOString()
        } as ResponseBase;
      }
      
      // 응답 데이터가 있지만 새로운 형식이 아닌 경우 변환
      if (response.data && typeof response.data === 'object' && !('success' in response.data)) {
        const originalData = response.data;
        response.data = {
          success: true,
          message: '성공적으로 처리되었습니다.',
          timestamp: new Date().toISOString(),
          data: originalData
        };
      }
      
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;
      
      // 401 오류이고 재시도하지 않은 요청인 경우
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // 토큰 갱신 시도
          const newToken = await options.refreshToken();
          
          if (newToken) {
            // 새 토큰으로 요청 헤더 업데이트
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // 원래 요청 재시도
            return axiosInstance(originalRequest);
          } else {
            // 토큰 갱신 실패 시 인증 실패 처리
            options.onUnauthorized();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // 토큰 갱신 중 오류 발생 시 인증 실패 처리
          options.onUnauthorized();
          return Promise.reject(refreshError);
        }
      }
      
      // 오류 응답 형식화
      if (error.response?.data) {
        // 이미 형식화된 오류 응답인 경우 그대로 반환
        if (typeof error.response.data === 'object' && 'success' in error.response.data) {
          return Promise.reject(error);
        }
        
        // 오류 응답 형식화
        const errorMessage = 
          typeof error.response.data === 'object' && 'message' in error.response.data
            ? error.response.data.message
            : '요청 처리 중 오류가 발생했습니다.';
            
        error.response.data = {
          success: false,
          message: errorMessage,
          timestamp: new Date().toISOString()
        };
      } else {
        // 응답 데이터가 없는 경우 기본 오류 응답 생성
        if (error.response) {
          error.response.data = {
            success: false,
            message: error.message || '요청 처리 중 오류가 발생했습니다.',
            timestamp: new Date().toISOString()
          };
        }
      }
      
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}; 