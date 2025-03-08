import axios from 'axios';
import { browser } from '$app/environment';

// 환경 변수에서 API URL 가져오기
const API_URL = browser ? import.meta.env.PUBLIC_MAIN_API_URL : '';

// axios 인스턴스 생성
const mainApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 인터셉터 설정 (추후 구현)

// 보고서 타입 정의
interface Report {
  id?: string;
  title: string;
  content: string;
  // 필요한 다른 필드 추가
}

// API 함수들 (추후 구현)
export const getUserData = async () => {
  // 구현 예정
  console.log('사용자 데이터 요청');
  return null;
};

export const getReports = async (page = 1, limit = 10) => {
  // 구현 예정
  console.log(`보고서 목록 요청: 페이지 ${page}, 한계 ${limit}`);
  return { reports: [], total: 0 };
};

export const getReportDetail = async (id: string) => {
  // 구현 예정
  console.log(`보고서 상세 요청: ID ${id}`);
  return null;
};

export const createReport = async (reportData: Report) => {
  // 구현 예정
  console.log('보고서 생성 요청', reportData);
  return { id: '1' };
};

export const updateReport = async (id: string, reportData: Partial<Report>) => {
  // 구현 예정
  console.log(`보고서 업데이트 요청: ID ${id}`, reportData);
  return true;
};

export const deleteReport = async (id: string) => {
  // 구현 예정
  console.log(`보고서 삭제 요청: ID ${id}`);
  return true;
};

export const getAnalytics = async () => {
  // 구현 예정
  console.log('분석 데이터 요청');
  return { stats: {} };
};

export default mainApi; 