import type { BaseEntity } from './task.types';

// 이미지 인터페이스
export interface Image extends BaseEntity {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  thumbnailPath: string | null;
  description: string | null;
  processingStatus: number; // 1: 처리 대기, 2: 처리 중, 3: 처리 완료, 0: 처리 실패
  receiptCount: number; // 연결된 영수증 개수
}

// 이미지 업로드 시 필요한 데이터 타입
export interface ImageUploadDto {
  file: File;
  description?: string;
}

// 이미지 업데이트 시 필요한 데이터 타입
export interface UpdateImageDto {
  description?: string;
  state?: number;
}

// 이미지 필터링 옵션
export interface ImageFilterOptions {
  processingStatus?: number;
  sortBy?: 'createdAt' | 'fileSize' | 'fileName';
  sortOrder?: 'asc' | 'desc';
  search?: string;
} 