import axios from 'axios';
import { browser } from '$app/environment';
import { setupInterceptors } from './interceptors';
import type { Image, ImageUploadDto } from '../types/image.types';
import type { ResponseData, ResponseListData } from './auth';
import { getTokenFromStorage, refreshAuthToken, removeTokensFromStorage } from './auth';

// 이미지 API URL 설정
const IMAGE_API_URL = 'http://facreport.iptime.org:5008';
console.log('IMAGE_API_URL', IMAGE_API_URL);

// 이미지 API 클라이언트 생성
const imageClient = axios.create({
  baseURL: IMAGE_API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getTokenFromStorage()}`
  }
});

// 인터셉터 설정 - 모든 요청에 인증 토큰 추가
setupInterceptors(imageClient, {
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

// 이미지 API 함수들
export const imageAPI = {
  // 태스크별 이미지 목록 가져오기
  getImagesByTaskId: async (taskId: string) => {
    const response = await imageClient.get<ResponseListData<Image>>(`/api/v1/main/tasks/${taskId}/images`);
    console.log('getImagesByTaskId response', response);
    if (!response.data.success) {
      throw new Error(response.data.message || '이미지를 불러오는데 실패했습니다.');
    }
    return response.data.data;
  },
  
  // ID로 이미지 가져오기
  getImageById: async (id: string) => {
    const response = await imageClient.get<ResponseData<Image>>(`/api/v1/main/images/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || '이미지를 불러오는데 실패했습니다.');
    }
    return response.data.data;
  },
  
  // 이미지 업로드하기 (태스크 ID 연결)
  uploadImage: async (taskId: string, imageData: ImageUploadDto) => {
    // FormData 객체 생성
    const formData = new FormData();
    
    // 이미지 파일 추가
    if (imageData.file) {
      formData.append('file', imageData.file);
    }
    
    // 이미지 메타데이터 추가
    if (imageData.description) {
      formData.append('description', imageData.description);
    }
    
    // 태스크 ID 연결
    formData.append('taskId', taskId);
    
    // 헤더 설정 (multipart/form-data)
    const headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${getTokenFromStorage()}`
    };
    
    const response = await imageClient.post<ResponseData<Image>>(
      `/api/v1/main/tasks/${taskId}/images`, 
      formData,
      { headers }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || '이미지 업로드에 실패했습니다.');
    }
    
    return response.data.data;
  }
}; 