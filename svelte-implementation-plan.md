# Svelte 프론트엔드 구현 7일 작업 계획

## API 서버 주요 엔드포인트 참조

### Auth API 서버 (http://facreport.iptime.org:8007/docs)

#### 인증 관련 엔드포인트
- `POST /auth/login` - 로그인 (이메일/비밀번호 필요)
- `POST /auth/register` - 회원가입
- `POST /auth/refresh` - 토큰 갱신
- `GET /auth/me` - 현재 사용자 정보 조회
- `POST /auth/logout` - 로그아웃

### Main API 서버 (http://facreport.iptime.org:8006/docs)

#### 사용자 관련 엔드포인트
- `GET /users/profile` - 사용자 프로필 조회
- `PUT /users/profile` - 사용자 프로필 업데이트

#### 보고서 관련 엔드포인트
- `GET /reports` - 보고서 목록 조회 (페이지네이션, 필터링 지원)
- `GET /reports/{id}` - 특정 보고서 상세 조회
- `POST /reports` - 새 보고서 생성
- `PUT /reports/{id}` - 보고서 업데이트
- `DELETE /reports/{id}` - 보고서 삭제

#### 분석 관련 엔드포인트
- `GET /analytics/dashboard` - 대시보드 통계 데이터
- `GET /analytics/reports` - 보고서 관련 분석 데이터

---

## 1일차: Svelte 환경 구성 및 프로젝트 구조

### 개발 환경 설정

- [ ] Node.js 및 npm 설치 확인 (Node.js 18.x 이상 권장)
- [ ] Svelte 프로젝트 생성
  ```bash
  npm create svelte@latest facreport-app
  cd facreport-app
  ```
- [ ] 기본 의존성 설치
  ```bash
  npm install
  ```
- [ ] 추가 필요 라이브러리 설치
  ```bash
  npm install axios
  ```
- [ ] (선택) UI 라이브러리/스타일링 도구 설치
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

### 프로젝트 구조 설정

- [ ] 기본 디렉토리 구조 확인
- [ ] lib 디렉토리 내 하위 폴더 생성
  ```bash
  mkdir -p src/lib/{api,components/{ui,features,layout},stores,utils,constants}
  ```
- [ ] routes 디렉토리 설정
  ```bash
  mkdir -p src/routes/{(auth)/{login,register},(protected)/dashboard}
  ```

### 환경 변수 설정

- [ ] `.env` 파일 생성
  ```
  PUBLIC_MAIN_API_URL=http://facreport.iptime.org:8006
  PUBLIC_AUTH_API_URL=http://facreport.iptime.org:8007
  ```

### API 클라이언트 초기 설정

- [ ] `src/lib/api/auth.js` 파일 생성 (인증 API 클라이언트)
- [ ] `src/lib/api/main.js` 파일 생성 (메인 API 클라이언트)
- [ ] 인터셉터 설정 (`src/lib/api/interceptors.js`)

### 기본 스토어 설정

- [ ] `src/lib/stores/auth.js` 생성 (인증 관련 상태)
- [ ] `src/lib/stores/app.js` 생성 (앱 상태)

### 1일차 작업 검증

- [ ] 개발 서버 실행
  ```bash
  npm run dev
  ```
- [ ] 브라우저에서 `http://localhost:5173` 접속하여 기본 Svelte 페이지 확인
- [ ] 콘솔 오류 없이 정상 실행되는지 확인

---

## 2일차: 인증 기능 구현 (Auth API 통합)

### 인증 스토어 구현

- [ ] `src/lib/stores/auth.js` 완성
  - [ ] 인증 상태 (isAuthenticated)
  - [ ] 사용자 정보 (user)
  - [ ] 로딩 상태 (loading)
  - [ ] 오류 상태 (error)

### Auth API 클라이언트 완성

- [ ] `src/lib/api/auth.js` 완성
  - [ ] login 함수 구현
  - [ ] register 함수 구현
  - [ ] logout 함수 구현
  - [ ] getCurrentUser 함수 구현
  - [ ] refreshToken 함수 구현

### 인증 화면 구현

- [ ] 로그인 페이지 (`src/routes/(auth)/login/+page.svelte`)
  - [ ] 폼 레이아웃 
  - [ ] 상태 관리 연결
  - [ ] API 통합
  - [ ] 오류 처리
- [ ] 회원가입 페이지 (`src/routes/(auth)/register/+page.svelte`)
  - [ ] 폼 레이아웃
  - [ ] 상태 관리 연결
  - [ ] API 통합
  - [ ] 오류 처리

### 인증 레이아웃 구현

- [ ] 레이아웃 로직 (`src/routes/+layout.js`)
  - [ ] 인증 상태 체크
  - [ ] 보호된 경로 처리
  - [ ] 로그인/로그아웃 리다이렉션

### 2일차 작업 검증

- [ ] 개발 서버에서 로그인 페이지 확인
- [ ] 로그인 기능 테스트
- [ ] 회원가입 기능 테스트
- [ ] 비인증 상태에서 보호된 경로 접근 시 리다이렉션 확인

---

## 3일차: 핵심 UI 컴포넌트 및 레이아웃

### 레이아웃 컴포넌트 구현

- [ ] 기본 레이아웃 (`src/routes/+layout.svelte`)
  - [ ] 인증 상태에 따른 레이아웃 변경
  - [ ] 다크모드 지원
- [ ] 사이드바 컴포넌트 (`src/lib/components/layout/Sidebar.svelte`)
  - [ ] 네비게이션 링크
  - [ ] 토글 기능
  - [ ] 반응형 디자인
- [ ] 네비게이션 바 (`src/lib/components/layout/Navbar.svelte`)
  - [ ] 사용자 메뉴
  - [ ] 알림 표시
  - [ ] 검색 기능 (선택사항)

### 공통 UI 컴포넌트 구현

- [ ] 버튼 컴포넌트 (`src/lib/components/ui/Button.svelte`)
- [ ] 입력 필드 컴포넌트 (`src/lib/components/ui/Input.svelte`)
- [ ] 카드 컴포넌트 (`src/lib/components/ui/Card.svelte`)
- [ ] 알림 컴포넌트 (`src/lib/components/ui/Alert.svelte`)
- [ ] 로딩 인디케이터 (`src/lib/components/ui/Loading.svelte`)
- [ ] 알림 목록 컴포넌트 (`src/lib/components/ui/NotificationsList.svelte`)

### 애플리케이션 스토어 구현

- [ ] 앱 스토어 완성 (`src/lib/stores/app.js`)
  - [ ] 다크 모드 설정
  - [ ] 사이드바 상태
  - [ ] 알림 시스템

### 3일차 작업 검증

- [ ] 개발 서버에서 레이아웃 확인
- [ ] 반응형 디자인 테스트 (모바일, 태블릿, 데스크톱)
- [ ] 다크모드 토글 기능 테스트
- [ ] 사이드바 토글 기능 테스트
- [ ] UI 컴포넌트 스타일 및 동작 확인

---

## 4일차: Main API 통합 및 대시보드 구현

### Main API 클라이언트 완성

- [ ] `src/lib/api/main.js` 완성
  - [ ] getUserData 함수 구현
  - [ ] getReports 함수 구현
  - [ ] getReportDetail 함수 구현
  - [ ] createReport 함수 구현
  - [ ] updateReport 함수 구현
  - [ ] deleteReport 함수 구현
  - [ ] getAnalytics 함수 구현

### 대시보드 페이지 구현

- [ ] 대시보드 페이지 (`src/routes/(protected)/dashboard/+page.svelte`)
  - [ ] 통계 카드 섹션
  - [ ] 최근 보고서 목록
  - [ ] 차트/그래프 (선택사항)
- [ ] 대시보드 데이터 로딩 및 표시
  - [ ] API 연동
  - [ ] 로딩 상태 처리
  - [ ] 오류 상태 처리

### 공통 오류 처리 구현

- [ ] 오류 처리 유틸리티 (`src/lib/utils/error-handler.js`)
  - [ ] HTTP 상태 코드별 처리
  - [ ] 네트워크 오류 처리
  - [ ] 사용자 친화적 오류 메시지

### 4일차 작업 검증

- [ ] 개발 서버에서 대시보드 페이지 확인
- [ ] API 데이터 로딩 테스트
- [ ] 로딩 상태 및 오류 상태 표시 확인
- [ ] 다양한 화면 크기에서 대시보드 레이아웃 확인

---

## 5일차: 보고서 및 분석 기능 구현

### 보고서 목록 페이지 구현

- [ ] 보고서 목록 페이지 (`src/routes/(protected)/reports/+page.svelte`)
  - [ ] 테이블/그리드 레이아웃
  - [ ] 정렬 및 필터링
  - [ ] 페이지네이션
  - [ ] 검색 기능
- [ ] API 연동
  - [ ] 데이터 로딩
  - [ ] 필터링/정렬/페이지네이션 연동

### 보고서 상세 페이지 구현

- [ ] 보고서 상세 페이지 (`src/routes/(protected)/reports/[id]/+page.svelte`)
  - [ ] 보고서 정보 표시
  - [ ] 편집 기능
  - [ ] 삭제 기능
- [ ] API 연동
  - [ ] 상세 데이터 로딩
  - [ ] 업데이트 처리
  - [ ] 삭제 처리

### 보고서 생성 페이지 구현

- [ ] 보고서 생성 페이지 (`src/routes/(protected)/reports/new/+page.svelte`)
  - [ ] 폼 구현
  - [ ] 유효성 검사
- [ ] API 연동
  - [ ] 데이터 제출
  - [ ] 성공/오류 처리

### 5일차 작업 검증

- [ ] 개발 서버에서 보고서 목록 페이지 확인
- [ ] 보고서 상세 페이지 확인
- [ ] 보고서 생성 기능 테스트
- [ ] 보고서 편집 및 삭제 기능 테스트
- [ ] 페이지네이션 및 필터링 기능 확인

---

## 6일차: 오류 처리, 로딩 상태 및 UX 개선

### 전역 오류 처리 시스템 개선

- [ ] 전역 오류 핸들러 구현
- [ ] 오류 발생 시 사용자 알림 표시
- [ ] API 오류 코드별 특정 처리 추가

### 로딩 상태 개선

- [ ] 로딩 인디케이터 적용
  - [ ] 페이지 로드 시
  - [ ] API 요청 중
  - [ ] 긴 작업 중
- [ ] 스켈레톤 로더 구현 (선택사항)

### 폼 상호작용 개선

- [ ] 입력 유효성 검사 강화
- [ ] 실시간 피드백 제공
- [ ] 제출 버튼 상태 관리

### 반응형 디자인 개선

- [ ] 모바일 화면 최적화
- [ ] 태블릿 화면 최적화
- [ ] 터치 인터페이스 개선

### 성능 최적화

- [ ] 코드 분할 구현
- [ ] 이미지 최적화
- [ ] 불필요한 리렌더링 방지

### 6일차 작업 검증

- [ ] 개발 서버에서 모든 페이지 반응형 디자인 확인
- [ ] 다양한 오류 시나리오 테스트
- [ ] 로딩 상태 표시 확인
- [ ] 폼 유효성 검사 및 피드백 확인
- [ ] 전반적인 사용자 경험 테스트

---

## 7일차: 테스트, 최적화 및 배포

### 최종 테스트

- [ ] 모든 페이지 기능 검증
- [ ] 인증 흐름 테스트
- [ ] API 통합 테스트
- [ ] 오류 처리 확인
- [ ] 브라우저 호환성 테스트

### 성능 최적화

- [ ] Lighthouse 점수 확인 및 개선
- [ ] 번들 크기 최적화
- [ ] 레이지 로딩 구현
- [ ] 캐시 전략 수립

### 배포 준비

- [ ] 환경 변수 설정 확인
- [ ] 빌드 스크립트 확인
- [ ] 배포 환경 설정 (Node.js 또는 정적 호스팅)

### Docker 배포 설정 (선택사항)

- [ ] Dockerfile 작성
- [ ] Docker 이미지 빌드
- [ ] 컨테이너 실행 테스트

### 배포 및 검증

- [ ] 프로덕션 빌드 생성
  ```bash
  npm run build
  ```
- [ ] 빌드 결과 검증
- [ ] 배포 실행
- [ ] 배포 후 모든 기능 확인

### 문서화

- [ ] README 업데이트
- [ ] API 통합 문서화
- [ ] 컴포넌트 사용법 문서화
- [ ] 배포 가이드 작성

### 7일차 작업 검증

- [ ] 프로덕션 빌드 테스트
- [ ] 모든 기능이 프로덕션 환경에서 정상 작동하는지 확인
- [ ] 성능 지표 확인
- [ ] 문서 완성도 확인
