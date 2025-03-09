import type { BaseEntity } from './task.types';

// 이미지 인터페이스
export interface Image extends BaseEntity {
  taskId: string;
  fileName: string;
  rectUrl: string;
  thumbnailUrl: string | null;
  filePath?: string; // 파일 경로 (UI 표시용)
  fileSize: number; // 파일 크기 (바이트)
  fileType?: string; // 파일 타입 (MIME 타입)
  description?: string; // 이미지 설명
  ocrConfidence: number;
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