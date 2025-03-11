import axios from 'axios';
import { browser } from '$app/environment';
import { setupInterceptors } from './interceptors';
import type { CreateTaskDto, UpdateTaskDto, Task } from '../types/task.types';
import type { ResponseData, ResponseListData } from './auth';
import { getTokenFromStorage, refreshAuthToken, removeTokensFromStorage } from './auth';

// 태스크 API URL 설정
const TASK_API_URL = 'http://facreport.iptime.org:5008';

// 태스크 API 클라이언트 생성
const taskClient = axios.create({
  baseURL: TASK_API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getTokenFromStorage()}`
  }
});

// 인터셉터 설정 - 모든 요청에 인증 토큰 추가
setupInterceptors(taskClient, {
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

// 태스크 API 함수들
export const taskAPI = {
  // 모든 태스크 가져오기
  getTasks: async () => {
    const response = await taskClient.get<ResponseListData<Task>>('/api/v1/main/tasks');
    if (!response.data.success) {
      throw new Error(response.data.message || '태스크를 불러오는데 실패했습니다.');
    }
    return response.data.data;
  },
  
  // ID로 태스크 가져오기
  getTaskById: async (id: string) => {
    const response = await taskClient.get<ResponseData<Task>>(`/api/v1/main/tasks/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || '태스크를 불러오는데 실패했습니다.');
    }
    return response.data.data;
  },
  
  // 새 태스크 생성하기
  createTask: async (taskData: CreateTaskDto) => {
    const response = await taskClient.post<ResponseData<Task>>('/api/v1/main/tasks', taskData);
    if (!response.data.success) {
      throw new Error(response.data.message || '태스크를 생성하는데 실패했습니다.');
    }
    return response.data.data;
  },
  
  // 태스크 업데이트하기
  updateTask: async (id: string, taskData: UpdateTaskDto) => {
    const response = await taskClient.put<ResponseData<Task>>(`/api/v1/main/tasks/${id}`, taskData);
    if (!response.data.success) {
      throw new Error(response.data.message || '태스크를 업데이트하는데 실패했습니다.');
    }
    return response.data.data;
  },
  
  // 태스크 삭제하기
  deleteTask: async (id: string) => {
    const response = await taskClient.delete<ResponseData<boolean>>(`/api/v1/main/tasks/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || '태스크를 삭제하는데 실패했습니다.');
    }
    return response.data.data;
  }
}; 