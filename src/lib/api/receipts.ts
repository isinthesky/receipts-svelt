import axios from 'axios';
import { browser } from '$app/environment';
import { setupInterceptors } from './interceptors';
import type { ResponseData, ResponseListData } from './auth';
import { getTokenFromStorage, refreshAuthToken, removeTokensFromStorage } from './auth';
import type { ProcessedReceipt } from '$lib/types/receipt.types';
// 영수증 타입 정의
export interface Receipt {
  id: string;
  imageId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  state: number;
}

// 영수증 분석 결과 타입 정의
export interface ReceiptAnalysis {
  id: string;
  receiptId: string;
  analysisResult: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  state: number;
}

// 영수증 API URL 설정
const RECEIPT_API_URL = 'http://facreport.iptime.org:5008';

// 영수증 API 클라이언트 생성
const receiptClient = axios.create({
  baseURL: RECEIPT_API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getTokenFromStorage()}`
  }
});

// 인터셉터 설정 - 모든 요청에 인증 토큰 추가
setupInterceptors(receiptClient, {
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

// 영수증 API 함수들
export const receiptAPI = {
  // 이미지별 영수증 목록 조회 API
  getReceiptsByImageId: async (imageId: string): Promise<Receipt[]> => {
    const response = await receiptClient.get<ResponseListData<Receipt>>(
      `/api/v1/main/images/${imageId}/receipts`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || '영수증 목록을 불러오는데 실패했습니다.');
    }
    
    return response.data.data;
  },
  
  // 영수증 GPT 분석 API
  analyzeReceiptWithGpt: async (receiptId: string): Promise<ReceiptAnalysis> => {
    const response = await receiptClient.post<ResponseData<ReceiptAnalysis>>(
      `/api/main/v1/main/receipts/${receiptId}/gpt-analysis`,
      {}
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'GPT 분석에 실패했습니다.');
    }
    
    return response.data.data as ReceiptAnalysis;
  },
  
  // 영수증 목록 조회 및 GPT 분석 함수
  processReceiptsWithGpt: async (imageId: string): Promise<void> => {
    try {
      // 영수증 목록 조회
      const receipts = await receiptAPI.getReceiptsByImageId(imageId);
      
      if (!receipts || receipts.length === 0) {
        console.log('영수증이 없습니다.');
        return;
      }
      
      console.log(`${receipts.length}개의 영수증을 찾았습니다.`);
      
      // 각 영수증에 대해 GPT 분석 실행
      for (let i = 0; i < receipts.length; i++) {
        const receipt = receipts[i];
        try {
          console.log(`영수증 ${i + 1}/${receipts.length} 분석 중...`);
          await receiptAPI.analyzeReceiptWithGpt(receipt.id);
          console.log(`영수증 ${i + 1}/${receipts.length} 분석 완료`);
        } catch (err) {
          console.error(`영수증 ${receipt.id} GPT 분석 오류:`, err);
        }
      }
      
      return;
    } catch (err) {
      console.error('영수증 처리 오류:', err);
      throw err;
    }
  },

  /**
   * 여러 영수증 이미지를 처리하는 함수
   * @param imageIds 처리할 이미지 ID 배열
   * @returns 처리된 영수증 데이터 배열
   */
  async processReceiptImages(imageIds: string[]): Promise<ProcessedReceipt[]> {
    try {
      // API 엔드포인트 설정 - 실제 서버 URL로 변경 필요
      const apiUrl = '/api/receipts/process-batch';
      
      // POST 요청으로 이미지 ID 배열 전송
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '영수증 처리 중 오류가 발생했습니다');
      }
      
      const data = await response.json();
      return data.receipts as ProcessedReceipt[];
    } catch (error) {
      console.error('영수증 처리 오류:', error);
      throw error;
    }
  }
}; 