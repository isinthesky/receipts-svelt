import axios from 'axios';
import { browser } from '$app/environment';

// 환경 변수에서 API URL 가져오기
// const API_URL = browser ? import.meta.env.PUBLIC_MAIN_API_URL : '';
const API_URL = 'http://facreport.iptime.org:5008';

// axios 인스턴스 생성
const mainApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default mainApi; 