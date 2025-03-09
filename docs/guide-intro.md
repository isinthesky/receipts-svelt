# Svelte 프레임워크 프론트엔드 개발 상세 가이드

## 1. 프로젝트 개요

스마트 문서 기반 영수증 처리 시스템을 위한 Svelte 프론트엔드 구현 계획을 수정했습니다. 보고서와 분석 관련 엔드포인트를 제거하고 Task, Image, Receipt 모델을 효과적으로 다루는 UI 구성으로 변경했습니다.

## 2. 프로젝트 주요 모델 및 관계

## 3. 프로젝트 구조

```
src/
├── lib/
│   ├── api/                  # API 통신 관련 모듈
│   │   ├── main.ts           # Main API 통신 클라이언트
│   │   ├── auth.ts           # Auth API 통신 클라이언트
│   │   ├── task.ts           # 태스크 API
│   │   ├── image.ts          # 이미지 API
│   │   ├── receipt.ts        # 영수증 API
│   │   └── interceptors.ts   # API 요청/응답 인터셉터
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   └── features/         # 기능 중심 컴포넌트
│   │   │   ├── TaskImages.svelte          # 태스크별 이미지 목록 컴포넌트
│   │   │   ├── ImageCard.svelte           # 이미지 카드 컴포넌트
│   │   │   ├── ImageModal.svelte          # 이미지 상세 모달 컴포넌트
│   │   │   ├── ImageUpload.svelte         # 이미지 업로드 컴포넌트
│   │   │   ├── BatchImageActions.svelte   # 이미지 일괄 액션 컴포넌트
│   │   │   ├── ImageFilters.svelte        # 이미지 필터 컴포넌트
│   │   │   ├── ReceiptList.svelte         # 영수증 목록 컴포넌트
│   │   │   └── ReceiptCard.svelte         # 영수증 카드 컴포넌트
│   ├── stores/               # 상태 관리 스토어
│   │   ├── auth.ts           # 인증 관련 스토어
│   │   ├── app.ts            # 애플리케이션 상태 스토어
│   │   ├── tasks.ts          # 태스크 관련 스토어
│   │   ├── images.ts         # 이미지 관련 스토어
│   │   └── receipts.ts       # 영수증 관련 스토어
│   ├── types/                # 타입 정의
│   │   ├── auth.types.ts     # 인증 관련 타입 정의
│   │   ├── task.types.ts     # 태스크 관련 타입 정의
│   │   ├── image.types.ts    # 이미지 관련 타입 정의
│   │   └── receipt.types.ts  # 영수증 관련 타입 정의
│   ├── utils/                # 유틸리티 함수
│   │   ├── token.ts          # 토큰 관리 유틸리티
│   │   └── error-handler.ts  # 오류 처리 유틸리티
│   └── constants/            # 상수 정의
├── routes/                   # SvelteKit 라우트
│   ├── (auth)/               # 인증 관련 라우트 그룹
│   │   ├── login/+page.svelte
│   │   └── register/+page.svelte
│   ├── (protected)/
│   │   ├── tasks/
│   │   │   ├── +page.svelte               # 태스크 목록 페이지
│   │   │   ├── [id]/+page.svelte          # 태스크 상세 페이지
│   │   │   └── new/+page.svelte           # 태스크 생성 페이지
│   │   ├── images/
│   │   │   ├── [id]/+page.svelte          # 이미지 상세 페이지
│   │   │   └── new/+page.svelte           # 이미지 업로드 페이지
│   │   └── receipts/
│   │       └── [id]/+page.svelte          # 영수증 상세 페이지
│   ├── +layout.svelte        # 루트 레이아웃
│   └── +layout.ts            # 레이아웃 로직(인증 체크 등)
├── app.html                  # HTML 템플릿
├── vite.config.ts            # Vite 설정
└── tsconfig.json             # TypeScript 설정
```

## 4. 주요 API 엔드포인트

### Auth API 엔드포인트 (Swagger 기준, Auth API 서버: http://facreport.iptime.org:5009)
- `POST /api/v1/auth/login` - 로그인 (이메일/비밀번호 필요)
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/refresh` - 토큰 갱신
- `GET /api/v1/auth/me` - 현재 사용자 정보 조회
- `POST /api/v1/auth/logout` - 로그아웃

### Task API 엔드포인트 (Swagger 기준, Main API 서버: http://facreport.iptime.org:5008)
- `GET /api/v1/tasks` - 태스크 목록 조회
- `GET /api/v1/tasks/{id}` - 특정 태스크 상세 조회
- `POST /api/v1/tasks` - 새 태스크 생성
- `PUT /api/v1/tasks/{id}` - 태스크 업데이트
- `DELETE /api/v1/tasks/{id}` - 태스크 삭제

### Image API 엔드포인트 (Swagger 기준, Main API 서버: http://facreport.iptime.org:5008)
- `GET /api/v1/main/tasks/{task_id}/images` - 태스크별 이미지 목록 조회
- `GET /api/v1/main/images/{id}` - 특정 이미지 상세 조회
- `POST /api/v1/main/tasks/{task_id}/images` - 이미지 업로드
- `PUT /api/v1/main/images/{id}` - 이미지 정보 업데이트
- `DELETE /api/v1/main/images/{id}` - 이미지 삭제
- `POST /api/v1/main/images/{image_id}/receipt-area` - **영수증 영역 생성**
- `PATCH /api/v1/main/images/{image_id}/receipt-area` - **영수증 영역 선택**
- `POST /api/v1/main/images/{image_id}/ocr` - **영수증의 문자열 추출**


### Receipt API 엔드포인트 (Swagger 기준, Main API 서버: http://facreport.iptime.org:5008)
- `GET /api/v1/main/images/{image_id}/receipts` - 이미지별 영수증 목록 조회
- `GET /api/v1/main/receipts/{id}` - 특정 영수증 상세 조회
- `POST /api/v1/main/images/{image_id}/receipts` - 영수증 정보 추가
- `PUT /api/v1/main/receipts/{id}` - 영수증 정보 업데이트
- `DELETE /api/v1/main/receipts/{id}` - 영수증 정보 삭제
- `POST /api/main/v1/main//receipts/{receipt_id}/gpt-analysis` - **Analyze Receipt With Gpt**



## 5. 개발 규칙 및 지침

### 5.1 코드 구성 원칙

#### 모듈 분리 및 책임 명확화
- **단일 책임 원칙**: 각 모듈은 하나의 책임만 가져야 합니다.
- **API 클라이언트 분리**: 각 엔티티(태스크, 이미지, 영수증)별로 독립적인 API 클라이언트 모듈을 생성합니다.
- **스토어 분리**: 각 엔티티별로 독립적인 스토어를 구현하여 상태 관리를 캡슐화합니다.

#### 순환 참조 방지
- 모듈 간 의존성 방향을 단방향으로 유지합니다(예: 타입 → 유틸리티 → API → 스토어 → 컴포넌트).
- 공통 유틸리티와 타입은 별도 파일로 분리하여 순환 참조를 방지합니다.

### 5.2 타입 정의 규칙

- 모든 데이터 구조는 TypeScript 인터페이스로 명확히 정의합니다.
- API 응답 타입과 내부 사용 타입을 구분합니다.
- 기본값이 있는 속성과 선택적 속성을 명확히 구분합니다.

예제:
```typescript
// 공통 필드 재사용 (공유 속성)
interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  state: number; // 1: enable, 2: hide, 0: disable
}

// 태스크 인터페이스
export interface Task extends BaseEntity {
  user_id: string;
  task_name: string;
  description: string | null;
  due_date: string | null;
  receipts: any | null;
}
```

### 5.3 API 클라이언트 구현 규칙

- Axios 인스턴스를 사용하여 일관된 설정을 공유합니다.
- 인터셉터를 통해 토큰 관리와 오류 처리를 중앙화합니다.
- 모든 API 함수는 비동기(async/await) 패턴을 사용합니다.
- API 오류 처리를 통일된 방식으로 구현합니다.

예제 구조:
```typescript
// 1. Axios 인스턴스 생성
const taskClient = axios.create({
  baseURL: import.meta.env.PUBLIC_MAIN_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// 2. 인터셉터 설정
setupApiInterceptors(taskClient);

// 3. API 함수 구현
export const taskAPI = {
  getTasks: async (params) => {
    try {
      const response = await taskClient.get('/tasks', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, { defaultMessage: '태스크 로드 실패' });
    }
  },
  // 나머지 API 함수들...
};
```

### 5.4 상태 관리 규칙

#### 스토어 구현 원칙
- Svelte의 writable 스토어를 사용하여 상태를 관리합니다.
- 각 스토어는 상태와 액션을 함께 제공하는 구조로 구현합니다.
- 비동기 작업은 스토어 액션 내에서 처리하고, 로딩 및 오류 상태를 함께 관리합니다.

```typescript
// 1. 초기 상태 정의
const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null
};

// 2. 스토어 생성
export const taskStore = writable(initialState);

// 3. 스토어 액션 정의
export const taskActions = {
  setLoading: (isLoading) => {
    taskStore.update(state => ({ ...state, loading: isLoading }));
  },
  
  // CRUD 액션들...
  
  // 비동기 데이터 로드 액션
  loadTasks: async () => {
    taskActions.setLoading(true);
    
    try {
      const tasks = await taskAPI.getTasks();
      taskStore.update(state => ({ ...state, tasks, error: null }));
    } catch (error) {
      taskStore.update(state => ({
        ...state, 
        error: error.message || '태스크 로드 실패'
      }));
    } finally {
      taskActions.setLoading(false);
    }
  }
};
```

#### 컴포넌트에서 스토어 사용 규칙
- 컴포넌트에서는 스토어를 구독하여 최신 상태에 접근합니다.
- 컴포넌트에서는 UI 로직만 처리하고, 데이터 로직은 스토어 액션에 위임합니다.

### 5.5 컴포넌트 설계 규칙

#### 컴포넌트 계층 구조
- **UI 컴포넌트**: 순수 스타일링과 기본 동작만 담당하는 재사용 가능한 컴포넌트
- **특성 컴포넌트**: 특정 기능에 특화된 컴포넌트(예: ImageUpload, ReceiptOcrView)
- **페이지 컴포넌트**: 라우트에 연결되는 최상위 컴포넌트

#### 속성(Props) 관리
- 모든 컴포넌트 속성은 타입을 명시적으로 정의합니다.
- 필수 속성과 선택적 속성을 명확히 구분합니다.
- 기본값을 사용하여 컴포넌트의 유연성을 높입니다.

```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  
  // 속성 정의
  export let task; // 필수 속성
  export let editable = false; // 선택적 속성 (기본값 제공)
  
  const dispatch = createEventDispatcher();
  
  function handleEdit() {
    dispatch('edit', { task });
  }
</script>
```

#### 이벤트 처리
- 컴포넌트 간 통신에는 이벤트 디스패치를 사용합니다.
- 이벤트 핸들러 이름은 `handle`로 시작하는 일관된 명명 규칙을 사용합니다.
- 데이터 변경은 부모 컴포넌트에 위임하고, 자식 컴포넌트는 변경 이벤트만 발생시킵니다.

### 5.6 라우터 및 네비게이션 규칙

#### 라우트 구조화
- 인증 여부에 따라 라우트 그룹을 분리합니다(`(auth)`, `(protected)`).
- 엔티티별로 중첩 라우트를 사용합니다(예: `/tasks/[id]`, `/images/[id]`).
- RESTful 구조를 따르는 URL 패턴을 사용합니다.

#### 인증 보호
- 보호된 라우트에 접근 시 인증 상태를 확인하고 미인증 시 리다이렉션합니다.
- 인증 상태 확인 로직은 레이아웃 로직(`+layout.ts`)에 중앙화합니다.

```typescript
export const load: LayoutLoad = async ({ url }) => {
  // 보호된 경로 접근 시 로그인 확인
  const isProtectedRoute = url.pathname.startsWith('/tasks') || 
                          url.pathname.startsWith('/images') || 
                          url.pathname.startsWith('/receipts');
  
  // 인증 상태 확인 및 리다이렉션 처리
  if (isProtectedRoute && !isAuthenticated) {
    throw redirect(307, '/login');
  }
  
  return {};
};
```

### 5.7 오류 처리 규칙

- 모든 API 호출은 try-catch로 감싸서 오류를 처리합니다.
- 오류 메시지를 사용자 친화적으로 변환하는 중앙 처리 메커니즘을 구현합니다.
- HTTP 상태 코드별로 적절한 오류 처리 전략을 구현합니다.
- 오류 발생 시 사용자에게 명확한 피드백을 제공합니다.

```typescript
export function handleApiError(error, options = {}) {
  const { showNotification = true, defaultMessage = '요청 처리 중 오류가 발생했습니다.' } = options;
  
  // HTTP 응답이 있는 경우
  if (error.response) {
    const { status, data } = error.response;
    
    // 오류 코드별 처리
    switch (status) {
      case 400: return '잘못된 요청입니다.';
      case 401: return '인증이 필요합니다. 다시 로그인해주세요.';
      case 403: return '이 작업을 수행할 권한이 없습니다.';
      case 404: return '요청한 리소스를 찾을 수 없습니다.';
      // ... 기타 상태 코드 처리
    }
  }
  
  // 네트워크 오류
  if (error.request && !error.response) {
    return '네트워크 연결을 확인해주세요.';
  }
  
  // 기타 오류
  return defaultMessage;
}
```

### 5.8 이미지 및 파일 처리 규칙

#### 이미지 업로드
- FormData를 사용하여 이미지 파일을 전송합니다.
- 업로드 진행 상태를 사용자에게 표시합니다.
- 이미지 유효성 검사(파일 크기, 형식 등)를 클라이언트 측에서 수행합니다.

#### 이미지 표시
- 이미지 로딩 상태를 처리합니다(로딩 중, 오류 시 대체 이미지 등).
- 고해상도 이미지의 경우 썸네일 또는 최적화된 버전을 사용합니다.
- 반응형 이미지 처리를 위해 적절한 CSS를 적용합니다.

#### OCR 영역 표시
- Canvas API를 사용하여 이미지 위에 영역을 표시합니다.
- 이미지 스케일에 따라 영역 좌표를 적절히 변환합니다.
- 상호작용을 위한 이벤트 핸들러를 구현합니다.

### 5.9 상태와 UI 동기화 규칙

- 로딩 상태, 오류 상태, 성공 상태를 명확히 구분하여 UI에 반영합니다.
- 반응형 UI를 위해 스토어 상태 변화에 따라 UI를 자동으로 업데이트합니다.
- 사용자 상호작용 후 피드백을 즉시 제공합니다.

```svelte
{#if loading}
  <LoadingSpinner />
{:else if error}
  <ErrorMessage message={error} />
{:else if data.length === 0}
  <EmptyState message="데이터가 없습니다." />
{:else}
  <!-- 데이터 표시 UI -->
{/if}
```

### 5.10 성능 최적화 규칙

- 리스트 렌더링 시 `{#each}` 블록에 키를 제공하여 DOM 업데이트를 최적화합니다.
- 큰 이미지의 경우 지연 로딩(lazy loading)을 구현합니다.
- 컴포넌트 라이프사이클 함수(`onMount`, `onDestroy` 등)를 적절히 사용하여 리소스를 관리합니다.
- 불필요한 렌더링을 방지하기 위해 메모이제이션 기법을 활용합니다.

## 6. 기능별 구현 가이드

### 6.1 인증 기능

#### 인증 상태 관리
- 토큰은 localStorage에 안전하게 저장합니다.
- 인증 상태는 중앙 스토어에서 관리하고 전역에서 접근할 수 있게 합니다.
- 토큰 만료 시 자동 갱신 메커니즘을 구현합니다.

#### 로그인/로그아웃 처리
- 로그인 성공 시 토큰을 저장하고 인증 상태를 업데이트합니다.
- 로그아웃 시 토큰을 제거하고 인증 상태를 초기화합니다.
- 보호된 경로에 미인증 접근 시 로그인 페이지로 리다이렉션합니다.

### 6.2 태스크 관리 기능

#### 태스크 목록 및 필터링
- 페이지네이션, 정렬, 필터링 기능을 구현합니다.
- 검색 기능으로 태스크를 쉽게 찾을 수 있게 합니다.
- 상태별 태스크 구분(활성, 숨김, 비활성)을 시각적으로 표현합니다.

#### 태스크 CRUD 작업
- 태스크 생성, 조회, 수정, 삭제 기능을 구현합니다.
- 태스크에 마감일 설정 및 알림 기능을 추가합니다.
- 태스크와 연결된 이미지 목록을 효과적으로 표시합니다.

### 6.3 이미지 관리 기능

#### 이미지 업로드 및 표시
- 드래그 앤 드롭 기능을 포함한 이미지 업로드 컴포넌트를 구현합니다.
- 이미지 썸네일 그리드 레이아웃으로 효율적인 탐색 경험을 제공합니다.
- 이미지 메타데이터(파일 크기, 날짜 등)를 표시합니다.

#### 이미지 처리
- 이미지 편집 기능(회전, 자르기 등)을 구현합니다.
- 이미지별 영수증 OCR 영역을 시각적으로 표시합니다.
- 이미지와 태스크 간의 연결 관계를 관리합니다.

### 6.4 영수증 관리 기능

#### 영수증 데이터 표시
- 영수증 OCR 데이터를 구조화된 형태로 표시합니다.
- 영수증 영역을 이미지 위에 하이라이트하여 시각적으로 구분합니다.
- 영수증 메타데이터(상점명, 날짜, 금액 등)를 효과적으로 표시합니다.

#### 영수증 편집 및 검증
- 영수증 데이터 수동 편집 기능을 구현합니다.
- 영수증 데이터의 유효성 검사(금액 계산 등)를 구현합니다.
- 영수증 처리 상태를 관리합니다(인식 중, 검증 필요, 검증 완료 등).

## 7. 개발 일정 및 작업 계획

### 세부 작업 일정

#### 1일차: Svelte 환경 구성 및 프로젝트 구조

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
  npm install axios uuid date-fns
  ```
- [ ] UI 라이브러리/스타일링 도구 설치
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

- [ ] 기본 디렉토리 구조 확인
- [ ] lib 디렉토리 내 하위 폴더 생성
  ```bash
  mkdir -p src/lib/{api,components/{ui,features,layout},stores,utils,constants}
  ```
- [ ] routes 디렉토리 설정
  ```bash
  mkdir -p src/routes/{(auth)/{login,register},(protected)/{tasks,images,receipts}}
  ```

- [ ] 환경 변수 설정
  ```
  PUBLIC_MAIN_API_URL=http://facreport.iptime.org:8006
  PUBLIC_AUTH_API_URL=http://facreport.iptime.org:8007
  ```

- [ ] API 클라이언트 초기 설정
  - [ ] `src/lib/api/auth.js` 파일 생성 (인증 API 클라이언트)
  - [ ] `src/lib/api/main.js` 파일 생성 (메인 API 클라이언트)
  - [ ] 인터셉터 설정 (`src/lib/api/interceptors.js`)

- [ ] 기본 스토어 설정
  - [ ] `src/lib/stores/auth.js` 생성 (인증 관련 상태)
  - [ ] `src/lib/stores/app.js` 생성 (앱 상태)
  - [ ] `src/lib/stores/tasks.js` 생성 (태스크 관련 상태)
  - [ ] `src/lib/stores/images.js` 생성 (이미지 관련 상태)
  - [ ] `src/lib/stores/receipts.js` 생성 (영수증 관련 상태)

- [ ] 개발 서버 실행
  ```bash
  npm run dev
  ```
- [ ] 브라우저에서 `http://localhost:5173` 접속하여 기본 Svelte 페이지 확인
- [ ] 콘솔 오류 없이 정상 실행되는지 확인

#### 2일차: 인증 기능 구현 (Auth API 통합)

- [ ] 인증 스토어 구현
  - [ ] 인증 상태 (isAuthenticated)
  - [ ] 사용자 정보 (user)
  - [ ] 로딩 상태 (loading)
  - [ ] 오류 상태 (error)

- [ ] Auth API 클라이언트 완성
  - [ ] login 함수 구현
  - [ ] register 함수 구현
  - [ ] logout 함수 구현
  - [ ] getCurrentUser 함수 구현
  - [ ] refreshToken 함수 구현

- [ ] 인증 화면 구현
  - [ ] 로그인 페이지 (`src/routes/(auth)/login/+page.svelte`)
  - [ ] 회원가입 페이지 (`src/routes/(auth)/register/+page.svelte`)

- [ ] 인증 레이아웃 구현
  - [ ] 레이아웃 로직 (`src/routes/+layout.js`)
  - [ ] 인증 상태 체크
  - [ ] 보호된 경로 처리
  - [ ] 로그인/로그아웃 리다이렉션

- [ ] 2일차 작업 검증
  - [ ] 개발 서버에서 로그인 페이지 확인
  - [ ] 로그인 기능 테스트
  - [ ] 회원가입 기능 테스트
  - [ ] 비인증 상태에서 보호된 경로 접근 시 리다이렉션 확인

#### 3일차: 핵심 UI 컴포넌트 및 레이아웃

- [ ] 레이아웃 컴포넌트 구현
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

- [ ] 공통 UI 컴포넌트 구현
  - [ ] 버튼 컴포넌트 (`src/lib/components/ui/Button.svelte`)
  - [ ] 입력 필드 컴포넌트 (`src/lib/components/ui/Input.svelte`)
  - [ ] 카드 컴포넌트 (`src/lib/components/ui/Card.svelte`)
  - [ ] 알림 컴포넌트 (`src/lib/components/ui/Alert.svelte`)
  - [ ] 로딩 인디케이터 (`src/lib/components/ui/Loading.svelte`)
  - [ ] 모달 컴포넌트 (`src/lib/components/ui/Modal.svelte`)
  - [ ] 드롭존 컴포넌트 (`src/lib/components/ui/Dropzone.svelte`) - 이미지 업로드용

- [ ] 애플리케이션 스토어 구현
  - [ ] 앱 스토어 완성 (`src/lib/stores/app.js`)
  - [ ] 다크 모드 설정
  - [ ] 사이드바 상태
  - [ ] 알림 시스템

- [ ] 3일차 작업 검증
  - [ ] 개발 서버에서 레이아웃 확인
  - [ ] 반응형 디자인 테스트 (모바일, 태블릿, 데스크톱)
  - [ ] 다크모드 토글 기능 테스트
  - [ ] 사이드바 토글 기능 테스트
  - [ ] UI 컴포넌트 스타일 및 동작 확인

#### 4일차: 태스크 관리 및 이미지 목록 기능 구현 (수정)

- [ ] Main API 태스크 및 이미지 클라이언트 완성
  - [ ] getTasks 함수 구현
  - [ ] getTaskById 함수 구현
  - [ ] createTask 함수 구현
  - [ ] updateTask 함수 구현
  - [ ] deleteTask 함수 구현

- [ ] 태스크 관련 화면 구현
  - [ ] 태스크 목록 페이지 (`src/routes/(protected)/tasks/+page.svelte`)
  - [ ] 테이블/카드 레이아웃
  - [ ] 정렬 및 필터링
  - [ ] 페이지네이션
  - [ ] 검색 기능

  - [ ] 태스크 상세 페이지 (`src/routes/(protected)/tasks/[id]/+page.svelte`)
  - [ ] 태스크 정보 표시
  - [ ] 편집 기능
  - [ ] 삭제 기능
  - [ ] 이미지 목록 통합 섹션 (새로 강화)
    - [ ] 이미지 목록 그리드/갤러리 뷰
    - [ ] 이미지 필터링 (상태별)
    - [ ] 이미지 정렬 (날짜/크기별)
    - [ ] 이미지 검색 기능
    - [ ] 이미지 업로드 버튼 (해당 태스크에 직접 연결)
    - [ ] 이미지 카드 클릭 시 상세 정보 모달
    - [ ] 이미지별 영수증 정보 요약 표시

  - [ ] 태스크 생성 페이지 (`src/routes/(protected)/tasks/new/+page.svelte`)
  - [ ] 폼 구현
  - [ ] 유효성 검사
  - [ ] 제출 처리

- [ ] 태스크 및 이미지 스토어 구현
  - [ ] `src/lib/stores/tasks.ts` 완성
  - [ ] 태스크 목록 상태
  - [ ] 현재 태스크 상태
  - [ ] 로딩/오류 상태
  - [ ] CRUD 액션

  - [ ] `src/lib/stores/images.ts` 부분 구현
  - [ ] 태스크별 이미지 목록 상태 - 새로 추가
  - [ ] 이미지 로딩 상태
  - [ ] 이미지 업로드 상태 및 진행률

- [ ] 이미지 관련 컴포넌트 구현
  - [ ] `src/lib/components/features/TaskImages.svelte` - 새로 추가
  - [ ] 태스크별 이미지 목록 그리드 표시
  - [ ] 필터링 및 정렬 컨트롤
  - [ ] 페이지네이션
  - [ ] 검색 기능

  - [ ] `src/lib/components/features/ImageCard.svelte` - 새로 추가
  - [ ] 이미지 썸네일 표시
  - [ ] 이미지 기본 정보 표시 (파일명, 크기, 날짜)
  - [ ] 연결된 영수증 개수 표시
  - [ ] 액션 메뉴 (상세보기, 삭제 등)

  - [ ] `src/lib/components/features/ImageUpload.svelte` - 새로 추가
  - [ ] 드래그 앤 드롭 기능
  - [ ] 다중 파일 업로드
  - [ ] 업로드 진행 상태
  - [ ] 오류 처리

- [ ] 4일차 작업 검증
  - [ ] 개발 서버에서 태스크 목록 페이지 확인
  - [ ] 태스크 생성 기능 테스트
  - [ ] 태스크 상세 정보 조회 테스트
  - [ ] 태스크 상세 페이지에서 이미지 목록 표시 확인 (새로 추가)
  - [ ] 태스크에 이미지 업로드 기능 테스트 (새로 추가)
  - [ ] 태스크 편집 및 삭제 기능 테스트

#### 5일차: 이미지 관리 기능 구현

- [ ] 이미지 API 클라이언트 완성
  - [ ] getImages 함수 구현
  - [ ] getImageById 함수 구현
  - [ ] uploadImage 함수 구현
  - [ ] updateImage 함수 구현
  - [ ] deleteImage 함수 구현

- [ ] 이미지 관련 화면 구현
  - [ ] 이미지 목록 컴포넌트 (`src/lib/components/features/ImageList.svelte`)
  - [ ] 그리드/갤러리 뷰
  - [ ] 이미지 썸네일 표시
  - [ ] 업로드 버튼
  - [ ] 이미지 선택 기능

- [ ] 이미지 상세 페이지 (`src/routes/(protected)/images/[id]/+page.svelte`)
  - [ ] 이미지 표시
  - [ ] 이미지 메타데이터 표시
  - [ ] 이미지 편집 기능
  - [ ] 영수증 정보 표시

- [ ] 이미지 업로드 컴포넌트 (`src/lib/components/features/ImageUpload.svelte`)
  - [ ] 드래그 앤 드롭 기능
  - [ ] 다중 파일 업로드
  - [ ] 업로드 진행 상태
  - [ ] 오류 처리

- [ ] 이미지 스토어 완성
  - [ ] `src/lib/stores/images.ts` 완성
  - [ ] 이미지 목록 상태
  - [ ] 현재 이미지 상태
  - [ ] 업로드 상태
  - [ ] CRUD 액션

- [ ] 5일차 작업 검증
  - [ ] 개발 서버에서 이미지 목록 확인
  - [ ] 이미지 업로드 기능 테스트
  - [ ] 이미지 상세 보기 테스트
  - [ ] 이미지 편집 및 삭제 기능 테스트

#### 6일차: 영수증 관리 기능 구현

- [ ] 영수증 API 클라이언트 완성
  - [ ] getReceipts 함수 구현
  - [ ] getReceiptById 함수 구현
  - [ ] createReceipt 함수 구현
  - [ ] updateReceipt 함수 구현
  - [ ] deleteReceipt 함수 구현

- [ ] 영수증 관련 화면 구현
  - [ ] 영수증 목록 컴포넌트 (`src/lib/components/features/ReceiptList.svelte`)
  - [ ] 테이블/카드 레이아웃
  - [ ] 정렬 및 필터링
  - [ ] 영수증 요약 정보 표시

- [ ] 영수증 상세 페이지 (`src/routes/(protected)/receipts/[id]/+page.svelte`)
  - [ ] 영수증 정보 표시
  - [ ] 원본 이미지 표시
  - [ ] 편집 기능
  - [ ] 삭제 기능

- [ ] 영수증 편집 폼 (`src/lib/components/features/ReceiptForm.svelte`)
  - [ ] 영수증 데이터 입력 필드
  - [ ] 유효성 검사
  - [ ] 제출 처리

- [ ] 영수증 스토어 완성
  - [ ] `src/lib/stores/receipts.ts` 완성
  - [ ] 영수증 목록 상태
  - [ ] 현재 영수증 상태
  - [ ] 로딩/오류 상태
  - [ ] CRUD 액션

- [ ] 영수증 시각화 컴포넌트
  - [ ] 영수증 OCR 영역 표시 컴포넌트 (`src/lib/components/features/ReceiptOcrView.svelte`)
  - [ ] 이미지 위에 영역 표시
  - [ ] 영역 선택 및 편집
  - [ ] 인식된 텍스트 하이라이트

- [ ] 6일차 작업 검증
  - [ ] 개발 서버에서 영수증 목록 확인
  - [ ] 영수증 생성 기능 테스트
  - [ ] 영수증 상세 정보 조회 테스트
  - [ ] 영수증 편집 및 삭제 기능 테스트
  - [ ] OCR 영역 표시 기능 테스트

#### 7일차: 대시보드, 오류 처리, 최적화 및 배포

- [ ] 대시보드 구현
  - [ ] 대시보드 페이지 (`src/routes/(protected)/dashboard/+page.svelte`)
  - [ ] 태스크 요약 카드
  - [ ] 최근 업로드 이미지
  - [ ] 영수증 통계 (총액, 개수 등)
  - [ ] 사용자 활동 요약

- [ ] 전역 오류 처리 시스템 개선
  - [ ] 전역 오류 핸들러 구현
  - [ ] 오류 발생 시 사용자 알림 표시
  - [ ] API 오류 코드별 특정 처리 추가

- [ ] 성능 최적화
  - [ ] 코드 분할 구현
  - [ ] 이미지 최적화 (lazy loading)
  - [ ] 불필요한 리렌더링 방지
  - [ ] 캐시 전략 수립

- [ ] 배포 준비
  - [ ] 환경 변수 설정 확인
  - [ ] 빌드 스크립트 확인
  - [ ] 빌드 테스트
    ```bash
    npm run build
    ```
  - [ ] 배포 환경 설정 (Node.js 또는 정적 호스팅)

- [ ] 문서화
  - [ ] README 업데이트
  - [ ] API 통합 문서화
  - [ ] 컴포넌트 사용법 문서화
  - [ ] 배포 가이드 작성

- [ ] 7일차 작업 검증
  - [ ] 대시보드 기능 테스트
  - [ ] 전체 애플리케이션 흐름 테스트
  - [ ] 성능 및 반응성 확인
  - [ ] 빌드 결과물 검증
  - [ ] 문서 완성도 확인

## 상용 서비스에서 채택하는 방법 및 추가 고려사항

### 프론트엔드 아키텍처 패턴

1. **컴포넌트 기반 설계**
   - 재사용 가능한 UI 컴포넌트를 만들어 개발 효율성 향상
   - 스토리북(Storybook)을 도입하여 컴포넌트 문서화 고려

2. **상태 관리 전략**
   - Svelte 자체 스토어를 사용하여 간결한 상태 관리
   - 대규모 애플리케이션으로 확장 시 Pinia나 Redux 도입 고려

3. **API 통신 패턴**
   - 요청/응답 인터셉터 활용으로 일관된 오류 처리
   - 캐시 전략 사용으로 중복 요청 최소화

### 최신 개발 트렌드

1. **점진적 향상 기법(Progressive Enhancement)**
   - 기본 기능부터 구현 후 고급 기능 추가
   - 오프라인 지원을 위한 서비스 워커 고려

2. **마이크로 프론트엔드 고려**
   - 확장성을 위해 독립적으로 배포 가능한 기능 단위로 설계
   - 페이지/기능별 지연 로딩 구현

3. **접근성(Accessibility) 고려**
   - WCAG 2.1 가이드라인 준수
   - 스크린 리더 지원 및 키보드 네비게이션 구현

### 성능 최적화 기법

1. **코드 분할(Code Splitting)**
   - 라우트 기반 지연 로딩 구현
   - 큰 라이브러리는 별도 청크로 분리

2. **이미지 최적화**
   - 이미지 압축 및 적절한 포맷 사용
   - 반응형 이미지 및 지연 로딩 구현
   - WebP 형식 활용

3. **캐싱 전략**
   - 정적 자산 캐싱
   - API 응답 캐싱

### 배포 및 운영 전략

1. **CI/CD 파이프라인**
   - GitHub Actions 또는 GitLab CI 설정
   - 자동화된 테스트 및 배포

2. **컨테이너화**
   - Docker를 사용한 일관된 환경
   - Kubernetes 배포 고려

3. **모니터링**
   - Sentry 또는 LogRocket을 통한 오류 추적
   - 사용자 행동 분석을 위한 이벤트 로깅

### 보안 강화 방안

1. **HTTPS 적용**
   - 모든 API 통신에 HTTPS 사용

2. **인증 토큰 보안**
   - JWT 토큰 안전한 저장
   - 자동 토큰 갱신 메커니즘

3. **입력 데이터 검증**
   - 프론트엔드에서 모든 사용자 입력 유효성 검사
   - XSS 방지를 위한 특수문자 처리

### 추가 기능 제안

1. **영수증 데이터 시각화**
   - 지출 분석 차트 및 그래프
   - 시간별/카테고리별 지출 분석

2. **사용자 설정**
   - 개인화된 대시보드 레이아웃
   - 알림 설정 기능

3. **협업 기능**
   - 팀원 간 태스크 공유
   - 코멘트 및 알림 시스템
