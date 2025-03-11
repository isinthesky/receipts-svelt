import { writable } from 'svelte/store';
import { imageAPI } from '$lib/api/image';
import type { Image, ImageUploadDto, ImageFilterOptions } from '$lib/types/image.types';

// 이미지 처리 상태 상수 정의
export const IMAGE_STATUS = {
  DELETED: -1,      // 삭제됨
  HIDDEN: 0,        // 숨김
  WAITING: 1,       // 처리 대기
  AREA_CREATING: 2, // 영역 생성 중
  AREA_CREATED: 3,  // 영역 생성 완료
  AREA_SELECTING: 4,// 영역 선택 중
  OCR_WAITING: 5,   // 문자열 추출 대기
  OCR_PROCESSING: 6,// 문자열 추출 중
  COMPLETED: 7      // 처리 완료
};

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
function mapApiImageToImage(apiImage: Image): Image {
  return {
    id: typeof apiImage.id === 'string' ? apiImage.id : '',
    taskId: typeof apiImage.taskId === 'string' ? apiImage.taskId : '',
    fileName: typeof apiImage.fileName === 'string' ? apiImage.fileName : '',
    rectUrl: typeof apiImage.rectUrl === 'string' ? apiImage.rectUrl : '',
    thumbnailUrl: typeof apiImage.thumbnailUrl === 'string' ? apiImage.thumbnailUrl : null,
    filePath: typeof apiImage.filePath === 'string' ? apiImage.filePath : apiImage.rectUrl,
    fileSize: typeof apiImage.fileSize === 'number' ? apiImage.fileSize : 0,
    fileType: typeof apiImage.fileType === 'string' ? apiImage.fileType : 'image/jpeg',
    ocrConfidence: typeof apiImage.ocrConfidence === 'number' ? apiImage.ocrConfidence : 0,
    processingStatus: typeof apiImage.processingStatus === 'number' ? apiImage.processingStatus : IMAGE_STATUS.WAITING,
    receiptCount: typeof apiImage.receiptCount === 'number' ? apiImage.receiptCount : 0,
    createdAt: typeof apiImage.createdAt === 'string' ? apiImage.createdAt : new Date().toISOString(),
    updatedAt: typeof apiImage.updatedAt === 'string' ? apiImage.updatedAt : new Date().toISOString(),
    state: typeof apiImage.state === 'number' ? apiImage.state : 1
  };
}

// 이미지 필터링 및 정렬 함수
function filterAndSortImages(images: Image[], options: ImageFilterOptions): Image[] {
  // 삭제된 이미지는 필터링에서 제외
  let filteredImages = images.filter(img => img.processingStatus !== IMAGE_STATUS.DELETED);
  
  // 처리 상태로 필터링
  if (options.processingStatus !== undefined) {
    filteredImages = filteredImages.filter(img => img.processingStatus === options.processingStatus);
  }
  
  // 검색어로 필터링
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filteredImages = filteredImages.filter(img => 
      img.fileName.toLowerCase().includes(searchLower)
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

// 현재 이미지 상태 가져오기
function getImageCurrentState(imageId: string): Image | null {
  let result: Image | null = null;
  
  subscribe(state => {
    // 모든 태스크를 순회하며 이미지 찾기
    for (const images of Object.values(state.imagesByTask)) {
      const image = images.find(img => img.id === imageId);
      if (image) {
        result = image;
        break;
      }
    }
  })();
  
  return result;
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
        ? images.map(image => mapApiImageToImage(image as Image))
        : [];

      console.log('loadImagesByTaskId mappedImages', mappedImages);
      
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
      
      const mappedImage = mapApiImageToImage(image as Image);
      
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
      // 진행률 시뮬레이션
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
      
      const mappedImage = mapApiImageToImage(image as Image);
      
      // 업로드 후 처리 대기 상태로 설정
      await imageAPI.updateImageStatus(mappedImage.id, IMAGE_STATUS.WAITING);
      mappedImage.processingStatus = IMAGE_STATUS.WAITING;
      
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
  
  // 이미지 업데이트 (반환된 이미지 정보로 스토어 갱신)
  updateImage: async (updatedImage: Image) => {
    try {
      // 이미지 매핑
      const mappedImage = mapApiImageToImage(updatedImage);
      const imageId = mappedImage.id;
      const taskId = mappedImage.taskId;
      
      if (!imageId || !taskId) {
        console.error('유효하지 않은 이미지 정보입니다.');
        return false;
      }
      
      update(state => {
        // 해당 태스크의 이미지 목록에서 업데이트할 이미지 찾기
        const taskImages = state.imagesByTask[taskId] || [];
        const updatedTaskImages = taskImages.map(img => 
          img.id === imageId ? mappedImage : img
        );
        
        // 현재 선택된 이미지가 업데이트 대상인 경우 함께 업데이트
        const updatedCurrentImage = state.currentImage && state.currentImage.id === imageId
          ? mappedImage
          : state.currentImage;
        
        return {
          ...state,
          imagesByTask: {
            ...state.imagesByTask,
            [taskId]: updatedTaskImages
          },
          currentImage: updatedCurrentImage
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateImage:', error);
      return false;
    }
  },
  
  // 이미지 상태 업데이트
  updateImageStatus: async (imageId: string, status: number) => {
    try {
      // API를 통해 이미지 상태 업데이트
      const updatedImage = await imageAPI.updateImageStatus(imageId, status);
      
      if (!updatedImage) {
        throw new Error('이미지 상태 업데이트에 실패했습니다.');
      }
      
      // 업데이트된 이미지 정보로 스토어 갱신
      return await imageStore.updateImage(updatedImage);
    } catch (error) {
      console.error('Error in updateImageStatus:', error);
      return false;
    }
  },
  
  // 이미지 삭제 (상태 변경으로 처리)
  deleteImage: async (imageId: string) => {
    try {
      // API를 통해 이미지 삭제 처리
      const updatedImage = await imageAPI.deleteImage(imageId);
      
      if (!updatedImage) {
        throw new Error('이미지 삭제에 실패했습니다.');
      }
      
      // 업데이트된 이미지 정보로 스토어 갱신
      return await imageStore.updateImage(updatedImage);
    } catch (error) {
      console.error('Error in deleteImage:', error);
      return false;
    }
  },
  
  // 이미지 숨김 처리
  hideImage: async (imageId: string) => {
    try {
      // API를 통해 이미지 숨김 처리
      const updatedImage = await imageAPI.hideImage(imageId);
      
      if (!updatedImage) {
        throw new Error('이미지 숨김 처리에 실패했습니다.');
      }
      
      // 업데이트된 이미지 정보로 스토어 갱신
      return await imageStore.updateImage(updatedImage);
    } catch (error) {
      console.error('Error in hideImage:', error);
      return false;
    }
  },
  
  // 영수증 영역 생성
  createReceiptArea: async (imageId: string, taskId: string) => {
    update(state => ({ ...state, loading: true, error: null }));
    
    try {
      // 이미지 상태 확인
      const currentState = getImageCurrentState(imageId);
      
      // 이미 처리 중이거나 완료된 경우 중복 처리 방지
      if (currentState && (
          currentState.processingStatus === IMAGE_STATUS.AREA_CREATING ||
          currentState.processingStatus === IMAGE_STATUS.AREA_CREATED ||
          currentState.processingStatus >= IMAGE_STATUS.AREA_SELECTING
      )) {
        console.log('이미 영역 생성이 진행 중이거나 완료되었습니다.');
        return currentState;
      }
      
      // 영수증 영역 생성 API 호출 (내부적으로 상태 업데이트 포함)
      const updatedImage = await imageAPI.createReceiptArea(imageId, taskId);
      
      if (!updatedImage) {
        throw new Error('영수증 영역 생성에 실패했습니다.');
      }
      
      // 업데이트된 이미지 정보로 스토어 갱신
      await imageStore.updateImage(updatedImage);
      
      update(state => ({ ...state, loading: false }));
      return updatedImage;
    } catch (error) {
      console.error('Error in createReceiptArea:', error);
      const errorMsg = error instanceof Error ? error.message : '영수증 영역 생성에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      return null;
    }
  },
  
  // 영수증 영역 선택
  selectReceiptArea: async (imageId: string, areaType: string = 'blue_area') => {
    update(state => ({ ...state, loading: true, error: null }));
    
    try {
      // 이미지 상태 확인
      const currentState = getImageCurrentState(imageId);
      
      // 이미 처리 중이거나 완료된 경우 중복 처리 방지
      if (currentState && (
          currentState.processingStatus === IMAGE_STATUS.AREA_SELECTING ||
          currentState.processingStatus >= IMAGE_STATUS.OCR_WAITING
      )) {
        console.log('이미 영역 선택이 진행 중이거나 완료되었습니다.');
        return currentState;
      }
      
      // 영역 생성이 완료되지 않은 경우 처리 불가
      if (currentState && currentState.processingStatus < IMAGE_STATUS.AREA_CREATED) {
        throw new Error('영역 생성이 완료되지 않아 영역 선택을 할 수 없습니다.');
      }
      
      // 영수증 영역 선택 API 호출 (내부적으로 상태 업데이트 포함)
      const updatedImage = await imageAPI.selectReceiptArea(imageId, areaType);
      
      if (!updatedImage) {
        throw new Error('영수증 영역 선택에 실패했습니다.');
      }
      
      // 업데이트된 이미지 정보로 스토어 갱신
      await imageStore.updateImage(updatedImage);
      
      update(state => ({ ...state, loading: false }));
      return updatedImage;
    } catch (error) {
      console.error('Error in selectReceiptArea:', error);
      const errorMsg = error instanceof Error ? error.message : '영수증 영역 선택에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      return null;
    }
  },
  
  // 영수증 문자열 추출
  extractOcr: async (imageId: string, areaType: string = 'blue_area') => {
    update(state => ({ ...state, loading: true, error: null }));
    
    try {
      // 이미지 상태 확인
      const currentState = getImageCurrentState(imageId);
      
      // 이미 처리 중이거나 완료된 경우 중복 처리 방지
      if (currentState && (
          currentState.processingStatus === IMAGE_STATUS.OCR_PROCESSING ||
          currentState.processingStatus === IMAGE_STATUS.COMPLETED
      )) {
        console.log('이미 문자열 추출이 진행 중이거나 완료되었습니다.');
        return currentState;
      }
      
      // 영역 선택이 완료되지 않은 경우 처리 불가
      if (currentState && currentState.processingStatus < IMAGE_STATUS.OCR_WAITING) {
        throw new Error('영역 선택이 완료되지 않아 문자열 추출을 할 수 없습니다.');
      }
      
      // 영수증 문자열 추출 API 호출 (내부적으로 상태 업데이트 포함)
      const updatedImage = await imageAPI.extractOcr(imageId, areaType);
      
      if (!updatedImage) {
        throw new Error('문자열 추출에 실패했습니다.');
      }
      
      // 업데이트된 이미지 정보로 스토어 갱신
      await imageStore.updateImage(updatedImage);
      
      update(state => ({ ...state, loading: false }));
      return updatedImage;
    } catch (error) {
      console.error('Error in extractOcr:', error);
      const errorMsg = error instanceof Error ? error.message : '문자열 추출에 실패했습니다.';
      update(state => ({ ...state, loading: false, error: errorMsg }));
      return null;
    }
  },
  
  // 오류 초기화
  clearError: () => {
    update(state => ({ ...state, error: null }));
  }
};
