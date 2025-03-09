import { writable } from 'svelte/store';
import { imageAPI } from '$lib/api/image';
import type { Image, ImageUploadDto, ImageFilterOptions } from '$lib/types/image.types';

// 이미지 상태 타입 정의
interface ImageState {
  // 태스크별 이미지 목록 (태스크 ID를 키로 사용)
  imagesByTask: Record<string, Image[]>;
  // 현재 선택된 이미지
  currentImage: Image | null;
  // 로딩 상태
  loading: boolean;
  // 오류 상태
  error: string | null;
  // 업로드 상태
  uploading: boolean;
  // 업로드 진행률 (0-100)
  uploadProgress: number;
  // 필터링 옵션
  filterOptions: ImageFilterOptions;
}

// 초기 상태 설정
const initialState: ImageState = {
  imagesByTask: {},
  currentImage: null,
  loading: false,
  error: null,
  uploading: false,
  uploadProgress: 0,
  filterOptions: {
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

// 스토어 생성
const { subscribe, update } = writable(initialState);

// API 응답 데이터를 Image 인터페이스에 맞게 변환하는 함수
function mapApiImageToImage(apiImage: any): Image {
  return {
    id: typeof apiImage.id === 'string' ? apiImage.id : '',
    taskId: typeof apiImage.task_id === 'string' ? apiImage.task_id : (typeof apiImage.taskId === 'string' ? apiImage.taskId : ''),
    fileName: typeof apiImage.file_name === 'string' ? apiImage.file_name : (typeof apiImage.fileName === 'string' ? apiImage.fileName : ''),
    fileSize: typeof apiImage.file_size === 'number' ? apiImage.file_size : (typeof apiImage.fileSize === 'number' ? apiImage.fileSize : 0),
    fileType: typeof apiImage.file_type === 'string' ? apiImage.file_type : (typeof apiImage.fileType === 'string' ? apiImage.fileType : ''),
    filePath: typeof apiImage.file_path === 'string' ? apiImage.file_path : (typeof apiImage.filePath === 'string' ? apiImage.filePath : ''),
    thumbnailPath: typeof apiImage.thumbnail_path === 'string' ? apiImage.thumbnail_path : (typeof apiImage.thumbnailPath === 'string' ? apiImage.thumbnailPath : null),
    description: typeof apiImage.description === 'string' ? apiImage.description : null,
    processingStatus: typeof apiImage.processing_status === 'number' ? apiImage.processing_status : (typeof apiImage.processingStatus === 'number' ? apiImage.processingStatus : 1),
    receiptCount: typeof apiImage.receipt_count === 'number' ? apiImage.receipt_count : (typeof apiImage.receiptCount === 'number' ? apiImage.receiptCount : 0),
    createdAt: typeof apiImage.created_at === 'string' ? apiImage.created_at : (typeof apiImage.createdAt === 'string' ? apiImage.createdAt : new Date().toISOString()),
    updatedAt: typeof apiImage.updated_at === 'string' ? apiImage.updated_at : (typeof apiImage.updatedAt === 'string' ? apiImage.updatedAt : new Date().toISOString()),
    state: typeof apiImage.state === 'number' ? apiImage.state : 1
  };
}

// 이미지 필터링 및 정렬 함수
function filterAndSortImages(images: Image[], options: ImageFilterOptions): Image[] {
  let filteredImages = [...images];
  
  // 처리 상태로 필터링
  if (options.processingStatus !== undefined) {
    filteredImages = filteredImages.filter(img => img.processingStatus === options.processingStatus);
  }
  
  // 검색어로 필터링
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filteredImages = filteredImages.filter(img => 
      img.fileName.toLowerCase().includes(searchLower) || 
      (img.description && img.description.toLowerCase().includes(searchLower))
    );
  }
  
  // 정렬
  if (options.sortBy) {
    filteredImages.sort((a, b) => {
      const aValue = a[options.sortBy as keyof Image];
      const bValue = b[options.sortBy as keyof Image];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return options.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return options.sortOrder === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      return 0;
    });
  }
  
  return filteredImages;
}

// 이미지 스토어 액션 정의
export const imageStore = {
  subscribe,
  
  // 태스크별 이미지 목록 로드
  loadImagesByTaskId: async (taskId: string) => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const images = await imageAPI.getImagesByTaskId(taskId);
      
      // API 응답 데이터를 Image 인터페이스에 맞게 변환
      const mappedImages = Array.isArray(images) 
        ? images.map(image => mapApiImageToImage(image as any))
        : [];
      
      update(state => ({ 
        ...state, 
        imagesByTask: { 
          ...state.imagesByTask, 
          [taskId]: mappedImages 
        }, 
        loading: false 
      }));
      
      return mappedImages;
    } catch (error) {
      console.error('Error in loadImagesByTaskId:', error);
      const errorMsg = error instanceof Error ? error.message : '이미지를 불러오는데 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      return [];
    }
  },
  
  // 이미지 상세 정보 로드
  getImageById: async (id: string): Promise<Image | null> => {
    update(state => ({ ...state, loading: true, error: null }));
    try {
      const image = await imageAPI.getImageById(id);
      
      if (!image) {
        throw new Error('이미지를 찾을 수 없습니다.');
      }
      
      const mappedImage = mapApiImageToImage(image as any);
      
      update(state => ({
        ...state,
        currentImage: mappedImage,
        loading: false
      }));
      
      return mappedImage;
    } catch (error) {
      console.error('Error in getImageById:', error);
      const errorMsg = error instanceof Error ? error.message : '이미지를 불러오는데 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      return null;
    }
  },
  
  // 현재 이미지 설정
  setCurrentImage: (image: Image) => {
    update(state => ({ ...state, currentImage: image }));
  },
  
  // 이미지 업로드
  uploadImage: async (taskId: string, imageData: ImageUploadDto): Promise<Image | null> => {
    update(state => ({ 
      ...state, 
      uploading: true, 
      uploadProgress: 0, 
      error: null 
    }));
    
    try {
      // 실제 업로드 구현 시 진행률 업데이트 로직 추가 필요
      // 여기서는 간단히 구현
      
      // 진행률 시뮬레이션 (실제 구현 시 axios의 onUploadProgress 사용)
      const progressInterval = setInterval(() => {
        update(state => {
          if (state.uploadProgress < 90) {
            return { ...state, uploadProgress: state.uploadProgress + 10 };
          }
          clearInterval(progressInterval);
          return state;
        });
      }, 300);
      
      const image = await imageAPI.uploadImage(taskId, imageData);
      
      clearInterval(progressInterval);
      
      if (!image) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }
      
      const mappedImage = mapApiImageToImage(image as any);
      
      update(state => {
        // 해당 태스크의 이미지 목록에 새 이미지 추가
        const taskImages = state.imagesByTask[taskId] || [];
        
        return { 
          ...state, 
          imagesByTask: { 
            ...state.imagesByTask, 
            [taskId]: [mappedImage, ...taskImages] 
          },
          currentImage: mappedImage,
          uploading: false, 
          uploadProgress: 100 
        };
      });
      
      // 잠시 후 업로드 진행률 초기화
      setTimeout(() => {
        update(state => ({ ...state, uploadProgress: 0 }));
      }, 1000);
      
      return mappedImage;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      const errorMsg = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      update(state => ({ 
        ...state, 
        uploading: false, 
        uploadProgress: 0, 
        error: errorMsg 
      }));
      return null;
    }
  },
  
  // 필터링 옵션 설정
  setFilterOptions: (options: Partial<ImageFilterOptions>) => {
    update(state => ({
      ...state,
      filterOptions: { ...state.filterOptions, ...options }
    }));
  },
  
  // 필터링 및 정렬된 이미지 목록 가져오기
  getFilteredImages: (taskId: string) => {
    let currentState: ImageState | undefined;
    subscribe(s => { currentState = s; })();
    
    if (!currentState) {
      return [];
    }
    
    const images = currentState.imagesByTask[taskId] || [];
    return filterAndSortImages(images, currentState.filterOptions);
  },
  
  // 오류 초기화
  clearError: () => {
    update(state => ({ ...state, error: null }));
  }
}; 