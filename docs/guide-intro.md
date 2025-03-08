# 프론트엔드 개발 작업지시서: Svelte 프레임워크 구현

## 1. 프로젝트 개요

본 문서는 Svelte 프레임워크를 사용하여 개발할 프론트엔드 서버의 작업지시서입니다. 이 프론트엔드는 다음 두 서버와 통신합니다:
- **Main API 서버** (http://facreport.iptime.org:8006/docs)
- **Auth API 서버** (http://facreport.iptime.org:5009/docs)

## 2. 프로젝트 구조

```
src/
├── lib/
│   ├── api/                  # API 통신 관련 모듈
│   │   ├── main.ts           # Main API 통신 클라이언트
│   │   ├── auth.ts           # Auth API 통신 클라이언트
│   │   └── interceptors.ts   # API 요청/응답 인터셉터
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   └── features/         # 기능 중심 컴포넌트
│   ├── stores/               # 상태 관리 스토어
│   │   ├── auth.ts           # 인증 관련 스토어
│   │   └── app.ts            # 애플리케이션 상태 스토어
│   ├── types/                # 타입 정의
│   │   └── auth.types.ts     # 인증 관련 타입 정의
│   ├── utils/                # 유틸리티 함수
│   │   └── token.ts          # 토큰 관리 유틸리티
│   └── constants/            # 상수 정의
├── routes/                   # SvelteKit 라우트
│   ├── (auth)/               # 인증 관련 라우트 그룹
│   │   ├── login/+page.svelte
│   │   └── register/+page.svelte
│   ├── (protected)/          # 인증 필요 라우트 그룹
│   │   └── dashboard/+page.svelte
│   ├── +layout.svelte        # 루트 레이아웃
│   └── +layout.ts            # 레이아웃 로직(인증 체크 등)
├── app.html                  # HTML 템플릿
├── vite.config.ts            # Vite 설정
└── tsconfig.json             # TypeScript 설정
```

## 3. 환경 설정 및 초기 설정

### 3.1 개발 환경 설정

```bash
# SvelteKit 프로젝트 생성
npm create svelte@latest my-facreport-app
cd my-facreport-app

# 의존성 설치
npm install

# TypeScript 설치 및 설정
npm install -D typescript @tsconfig/svelte
npx svelte-add typescript

# API 통신을 위한 라이브러리
npm install axios

# UI 컴포넌트 라이브러리 (선택사항)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3.2 TypeScript 설정 (tsconfig.json)

```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": true,
    "isolatedModules": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "$lib": ["src/lib"],
      "$lib/*": ["src/lib/*"]
    }
  },
  "include": ["src/**/*.d.ts", "src/**/*.ts", "src/**/*.js", "src/**/*.svelte"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3.3 Vite 설정 (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib')
    }
  },
  server: {
    port: 5173
  }
});
```

### 3.4 환경 변수 설정 (.env 파일)

```
PUBLIC_MAIN_API_URL=http://facreport.iptime.org:8006
PUBLIC_AUTH_API_URL=http://facreport.iptime.org:5009
```

## 4. API 통신 모듈 구현

### 4.1 순환 참조 문제 해결을 위한 모듈 구조 수정

순환 참조 문제는 모듈 간에 서로 의존하는 구조가 생길 때 발생합니다. 이를 해결하기 위해 다음과 같이 모듈 구조를 수정합니다.

#### 4.1.1 인증 타입 정의 (src/lib/types/auth.types.ts)

```typescript
// src/lib/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
```

#### 4.1.2 토큰 관리 유틸리티 분리 (src/lib/utils/token.ts)

```typescript
// src/lib/utils/token.ts
import { browser } from '$app/environment';

// 토큰 관리 함수들
export const getToken = (): string | null => {
  if (browser) {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string): void => {
  if (browser) {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (browser) {
    localStorage.removeItem('token');
  }
};
```

#### 4.1.3 API 인터셉터 모듈 분리 (src/lib/api/interceptors.ts)

```typescript
// src/lib/api/interceptors.ts
import type { AxiosInstance } from 'axios';
import { goto } from '$app/navigation';
import { authActions } from '$lib/stores/auth';

// API 인터셉터 설정 함수
export const setupApiInterceptors = (apiClient: AxiosInstance) => {
  // 응답 인터셉터: 인증 오류 처리
  apiClient.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        // 인증 상태 초기화
        authActions.setUnauthenticated();
        
        // 로그인 페이지로 리다이렉트
        goto('/login');
      }
      return Promise.reject(error);
    }
  );
  
  return apiClient;
};
```

### 4.2 인증 API 클라이언트 (src/lib/api/auth.ts)

```typescript
// src/lib/api/auth.ts
import axios from 'axios';
import { browser } from '$app/environment';
import { getToken, removeToken } from '$lib/utils/token';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '$lib/types/auth.types';

// Auth API 클라이언트 인스턴스 생성
const authClient = axios.create({
  baseURL: import.meta.env.PUBLIC_AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터: 토큰 추가
authClient.interceptors.request.use(config => {
  if (browser) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API 함수
export const authAPI = {
  // 로그인
  login: async (credentials: LoginCredentials): Promise<AuthResponse | null> => {
    const response = await authClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  // 회원가입
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
  
  // 로그아웃
  logout: async (): Promise<void> => {
    try {
      await authClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },
  
  // 현재 사용자 정보 가져오기
  getCurrentUser: async (): Promise<User> => {
    const response = await authClient.get<User>('/auth/me');
    return response.data;
  },
  
  // 토큰 갱신
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>('/auth/refresh');
    return response.data;
  }
};
```

### 4.3 Main API 클라이언트 (src/lib/api/main.ts)

```typescript
// src/lib/api/main.ts
import axios from 'axios';
import { browser } from '$app/environment';
import { getToken } from '$lib/utils/token';

// Main API 클라이언트 인스턴스 생성
const mainClient = axios.create({
  baseURL: import.meta.env.PUBLIC_MAIN_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터: 토큰 추가
mainClient.interceptors.request.use(config => {
  if (browser) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Main API 함수 - 실제 엔드포인트는 API 문서에 맞게 구현
export const mainAPI = {
  // 사용자 데이터 가져오기
  getUserData: async () => {
    const response = await mainClient.get('/users/data');
    return response.data;
  },
  
  // 보고서 목록 가져오기
  getReports: async (params) => {
    const response = await mainClient.get('/reports', { params });
    return response.data;
  },
  
  // 특정 보고서 상세 정보 가져오기
  getReportDetail: async (reportId) => {
    const response = await mainClient.get(`/reports/${reportId}`);
    return response.data;
  },
  
  // 보고서 생성
  createReport: async (reportData) => {
    const response = await mainClient.post('/reports', reportData);
    return response.data;
  },
  
  // 보고서 업데이트
  updateReport: async (reportId, reportData) => {
    const response = await mainClient.put(`/reports/${reportId}`, reportData);
    return response.data;
  }
};
```

## 5. 상태 관리 구현

### 5.1 인증 스토어 (src/lib/stores/auth.ts)

```typescript
// src/lib/stores/auth.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getToken, setToken, removeToken } from '$lib/utils/token';
import type { AuthState, User } from '$lib/types/auth.types';

// 초기 상태
const initialState: AuthState = {
  isAuthenticated: browser ? !!getToken() : false,
  user: null,
  loading: false,
  error: null
};

// 인증 스토어 생성
export const authStore = writable<AuthState>(initialState);

// 인증 스토어 액션
export const authActions = {
  setAuthenticated: (user: User, token: string) => {
    if (browser && token) {
      setToken(token);
    }
    
    authStore.update(state => ({
      ...state,
      isAuthenticated: true,
      user,
      error: null
    }));
  },
  
  setUnauthenticated: () => {
    if (browser) {
      removeToken();
    }
    
    authStore.update(state => ({
      ...state,
      isAuthenticated: false,
      user: null
    }));
  },
  
  setLoading: (isLoading: boolean) => {
    authStore.update(state => ({
      ...state,
      loading: isLoading
    }));
  },
  
  setError: (error: string | null) => {
    authStore.update(state => ({
      ...state,
      error
    }));
  }
};
```

### 5.2 애플리케이션 스토어 (src/lib/stores/app.ts)

```typescript
// src/lib/stores/app.ts
import { writable } from 'svelte/store';

// 초기 상태
const initialState = {
  isDarkMode: false,
  sidebarOpen: true,
  notifications: [],
  currentPage: 'dashboard'
};

// 앱 스토어 생성
export const appStore = writable(initialState);

// 앱 스토어 액션
export const appActions = {
  toggleDarkMode: () => {
    appStore.update(state => ({
      ...state,
      isDarkMode: !state.isDarkMode
    }));
  },
  
  toggleSidebar: () => {
    appStore.update(state => ({
      ...state,
      sidebarOpen: !state.sidebarOpen
    }));
  },
  
  setCurrentPage: (page) => {
    appStore.update(state => ({
      ...state,
      currentPage: page
    }));
  },
  
  addNotification: (notification) => {
    appStore.update(state => {
      const notifications = [...state.notifications, { ...notification, id: Date.now() }];
      return {
        ...state,
        notifications
      };
    });
  },
  
  removeNotification: (id) => {
    appStore.update(state => {
      const notifications = state.notifications.filter(n => n.id !== id);
      return {
        ...state,
        notifications
      };
    });
  }
};
```

## 6. 인증 및 라우트 보호

### 6.1 레이아웃 로직 (src/routes/+layout.ts)

```typescript
// src/routes/+layout.ts
import { authAPI } from '$lib/api/auth';
import { authStore, authActions } from '$lib/stores/auth';
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { getToken } from '$lib/utils/token';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
  // 로그인 상태 확인
  if (browser) {
    const token = getToken();
    if (token) {
      try {
        authActions.setLoading(true);
        const userData = await authAPI.getCurrentUser();
        authActions.setAuthenticated(userData, token);
      } catch (error) {
        console.error('Failed to get user data:', error);
        authActions.setUnauthenticated();
      } finally {
        authActions.setLoading(false);
      }
    }
  }
  
  // 보호된 경로 접근 시 로그인 확인
  const isProtectedRoute = url.pathname.startsWith('/dashboard') || 
                           url.pathname.startsWith('/reports') || 
                           url.pathname.startsWith('/settings');
  
  const isAuthRoute = url.pathname === '/login' || url.pathname === '/register';
  
  let isAuthenticated = false;
  
  // authStore의 현재 값 가져오기
  const unsubscribe = authStore.subscribe(state => {
    isAuthenticated = state.isAuthenticated;
  });
  unsubscribe();
  
  if (isProtectedRoute && !isAuthenticated) {
    throw redirect(307, '/login');
  }
  
  if (isAuthRoute && isAuthenticated) {
    throw redirect(307, '/dashboard');
  }
  
  return {};
};
```

## 7. 대시보드 페이지 구현

### 7.1 대시보드 페이지 (src/routes/(protected)/dashboard/+page.svelte)

```svelte
<script>
  import { onMount } from 'svelte';
  import { mainAPI } from '$lib/api/main';
  import { authStore } from '$lib/stores/auth';
  import { appActions } from '$lib/stores/app';
  
  // 사용자 정보 로드
  let user;
  authStore.subscribe(state => {
    user = state.user;
  });
  
  // 대시보드 데이터
  let reports = [];
  let stats = {};
  let loading = true;
  let error = null;
  
  onMount(async () => {
    appActions.setCurrentPage('dashboard');
    await loadDashboardData();
  });
  
  async function loadDashboardData() {
    loading = true;
    error = null;
    
    try {
      // 데이터 로드 (병렬 처리)
      const [reportsData, statsData] = await Promise.all([
        mainAPI.getReports({ limit: 5 }),
        mainAPI.getUserData()
      ]);
      
      reports = reportsData.items || [];
      stats = statsData || {};
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      error = '대시보드 데이터를 불러오는 중 오류가 발생했습니다.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="dashboard-container">
  {#if loading}
    <div class="loading">데이터를 불러오는 중...</div>
  {:else if error}
    <div class="error">{error}</div>
    <button on:click={loadDashboardData}>다시 시도</button>
  {:else}
    <header>
      <h1>안녕하세요, {user?.name || '사용자'}님!</h1>
      <p>오늘의 대시보드 요약입니다.</p>
    </header>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>총 보고서</h3>
        <div class="stat-value">{stats.totalReports || 0}</div>
      </div>
      
      <div class="stat-card">
        <h3>완료된 보고서</h3>
        <div class="stat-value">{stats.completedReports || 0}</div>
      </div>
      
      <div class="stat-card">
        <h3>진행 중 보고서</h3>
        <div class="stat-value">{stats.inProgressReports || 0}</div>
      </div>
      
      <div class="stat-card">
        <h3>문제 보고서</h3>
        <div class="stat-value">{stats.issueReports || 0}</div>
      </div>
    </div>
    
    <section class="recent-reports">
      <div class="section-header">
        <h2>최근 보고서</h2>
        <a href="/reports" class="view-all">모두 보기</a>
      </div>
      
      {#if reports.length === 0}
        <div class="empty-state">최근 보고서가 없습니다.</div>
      {:else}
        <div class="reports-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>상태</th>
                <th>작성일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {#each reports as report}
                <tr>
                  <td>{report.id}</td>
                  <td>{report.title}</td>
                  <td>
                    <span class="status status-{report.status.toLowerCase()}">
                      {report.status}
                    </span>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    <a href="/reports/{report.id}">상세보기</a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .dashboard-container {
    padding: 1rem;
  }
  
  .loading, .error {
    padding: 2rem;
    text-align: center;
  }
  
  .error {
    color: #e74c3c;
  }
  
  header {
    margin-bottom: 2rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    margin-top: 0.5rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .view-all {
    color: #4A90E2;
    text-decoration: none;
  }
  
  .reports-table {
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .status-completed {
    background-color: #e6f7e6;
    color: #2ecc71;
  }
  
  .status-inprogress {
    background-color: #e6f3ff;
    color: #3498db;
  }
  
  .status-issue {
    background-color: #fff2e6;
    color: #f39c12;
  }
  
  .empty-state {
    padding: 2rem;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
</style>
```

## 8. 재사용 가능한 컴포넌트

### 8.1 메인 레이아웃 (src/routes/+layout.svelte)

```svelte
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';
  import { appStore } from '$lib/stores/app';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Navbar from '$lib/components/layout/Navbar.svelte';
  import NotificationsList from '$lib/components/ui/NotificationsList.svelte';
  
  let isAuthenticated = false;
  let darkMode = false;
  let sidebarOpen = true;
  
  // 구독
  authStore.subscribe(state => {
    isAuthenticated = state.isAuthenticated;
  });
  
  appStore.subscribe(state => {
    darkMode = state.isDarkMode;
    sidebarOpen = state.sidebarOpen;
  });
  
  onMount(() => {
    // 다크모드 설정 복원
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      appStore.update(state => ({ ...state, isDarkMode: true }));
    }
  });
  
  // URL 경로에 따라 사이드바 보이기/숨기기
  $: showSidebar = isAuthenticated && !$page.url.pathname.includes('/login') && !$page.url.pathname.includes('/register');
</script>

<div class="app-container" class:dark-mode={darkMode}>
  {#if showSidebar}
    <Sidebar open={sidebarOpen} />
  {/if}
  
  <div class="main-content" class:with-sidebar={showSidebar && sidebarOpen}>
    {#if isAuthenticated}
      <Navbar />
    {/if}
    
    <main>
      <slot />
    </main>
  </div>
  
  <NotificationsList />
</div>

<style>
  :global(:root) {
    --primary-color: #4A90E2;
    --text-color: #333;
    --bg-color: #fff;
    --sidebar-width: 250px;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .app-container {
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-color);
  }
  
  .app-container.dark-mode {
    --text-color: #f5f5f5;
    --bg-color: #222;
  }
  
  .main-content {
    transition: margin-left 0.3s ease;
  }
  
  .main-content.with-sidebar {
    margin-left: var(--sidebar-width);
  }
  
  main {
    padding: 1rem;
  }
  
  @media (max-width: 768px) {
    .main-content.with-sidebar {
      margin-left: 0;
    }
  }
</style>
```

### 8.2 사이드바 컴포넌트 (src/lib/components/layout/Sidebar.svelte)

```svelte
<script>
  import { appActions } from '$lib/stores/app';
  import { authAPI } from '$lib/api/auth';
  import { goto } from '$app/navigation';
  
  export let open = true;
  
  function toggleSidebar() {
    appActions.toggleSidebar();
  }
  
  function handleLogout() {
    authAPI.logout();
    goto('/login');
  }
</script>

<aside class="sidebar" class:collapsed={!open}>
  <div class="sidebar-header">
    <h2 class="logo">FacReport</h2>
    <button class="toggle-btn" on:click={toggleSidebar}>
      {open ? '←' : '→'}
    </button>
  </div>
  
  <nav class="sidebar-nav">
    <ul>
      <li>
        <a href="/dashboard" class:active={window.location.pathname === '/dashboard'}>
          <span class="icon">📊</span>
          <span class="text">대시보드</span>
        </a>
      </li>
      <li>
        <a href="/reports" class:active={window.location.pathname.startsWith('/reports')}>
          <span class="icon">📝</span>
          <span class="text">보고서</span>
        </a>
      </li>
      <li>
        <a href="/analytics" class:active={window.location.pathname.startsWith('/analytics')}>
          <span class="icon">📈</span>
          <span class="text">분석</span>
        </a>
      </li>
      <li>
        <a href="/settings" class:active={window.location.pathname.startsWith('/settings')}>
          <span class="icon">⚙️</span>
          <span class="text">설정</span>
        </a>
      </li>
    </ul>
  </nav>
  
  <div class="sidebar-footer">
    <button class="logout-btn" on:click={handleLogout}>
      <span class="icon">🚪</span>
      <span class="text">로그아웃</span>
    </button>
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: var(--sidebar-width);
    background-color: #2c3e50;
    color: white;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .logo {
    margin: 0;
    font-size: 1.25rem;
    white-space: nowrap;
    overflow: hidden;
  }
  
  .toggle-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.25rem;
  }
  
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
  }
  
  .sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .sidebar-nav a {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: white;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  
  .sidebar-nav a:hover, .sidebar-nav a.active {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .icon {
    margin-right: 1rem;
    width: 20px;
    text-align: center;
  }
  
  .sidebar.collapsed .text {
    display: none;
  }
  
  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  .logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }
    
    .sidebar.open {
      transform: translateX(0);
    }
  }
</style>
```

## 9. API 오류 처리

### 9.1 공통 오류 처리 유틸리티 (src/lib/utils/error-handler.ts)

```typescript
import { appActions } from '$lib/stores/app';

/**
 * API 오류를 처리하는 공통 함수
 * @param {Error} error - 발생한 오류
 * @param {Object} options - 추가 옵션
 * @returns {string} 사용자에게 표시할 오류 메시지
 */
export function handleApiError(error, options = {}) {
  const { showNotification = true, defaultMessage = '요청 처리 중 오류가 발생했습니다.' } = options;
  
  // HTTP 응답이 있는 경우
  if (error.response) {
    const { status, data } = error.response;
    
    // 오류 코드별 처리
    switch (status) {
      case 400:
        const message = data.message || '잘못된 요청입니다.';
        if (showNotification) {
          appActions.addNotification({ 
            type: 'error', 
            message 
          });
        }
        return message;
        
      case 401:
        // 인증 오류는 인터셉터에서 처리하므로 여기서는 메시지만 반환
        return '인증이 필요합니다. 다시 로그인해주세요.';
        
      case 403:
        const forbiddenMsg = '이 작업을 수행할 권한이 없습니다.';
        if (showNotification) {
          appActions.addNotification({ 
            type: 'error', 
            message: forbiddenMsg 
          });
        }
        return forbiddenMsg;
        
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
        
      case 422:
        // 유효성 검사 오류
        let validationMsg = '입력 정보가 유효하지 않습니다:';
        
        if (data.errors && Array.isArray(data.errors)) {
          validationMsg += ' ' + data.errors.map(err => err.message).join(', ');
        } else if (data.message) {
          validationMsg = data.message;
        }
        
        if (showNotification) {
          appActions.addNotification({ 
            type: 'error', 
            message: validationMsg 
          });
        }
        return validationMsg;
        
      case 500:
      case 502:
      case 503:
      case 504:
        const serverErrorMsg = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        if (showNotification) {
          appActions.addNotification({ 
            type: 'error', 
            message: serverErrorMsg 
          });
        }
        return serverErrorMsg;
        
      default:
        const defaultErrorMsg = data.message || defaultMessage;
        if (showNotification) {
          appActions.addNotification({ 
            type: 'error', 
            message: defaultErrorMsg 
          });
        }
        return defaultErrorMsg;
    }
  }
  
  // 네트워크 오류
  if (error.request && !error.response) {
    const networkErrorMsg = '네트워크 연결을 확인해주세요.';
    if (showNotification) {
      appActions.addNotification({ 
        type: 'error', 
        message: networkErrorMsg 
      });
    }
    return networkErrorMsg;
  }
  
  // 기타 오류
  console.error('Unexpected error:', error);
  if (showNotification) {
    appActions.addNotification({ 
      type: 'error', 
      message: defaultMessage 
    });
  }
  return defaultMessage;
}
```

## 10. 배포 구성

### 10.1 SvelteKit 어댑터 구성 (svelte.config.ts)

```typescript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  
  kit: {
    adapter: adapter({
      // 노드 서버로 배포하기 위한 설정
      out: 'build',
      precompress: true,
      envPrefix: 'PUBLIC_'
    }),
    csrf: {
      checkOrigin: true,
    }
  }
};

export default config;
```

### 10.2 배포 스크립트 (package.json)

```json
{
  "name": "facreport-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "start": "node build/index.js",
    "docker:build": "docker build -t facreport-frontend .",
    "docker:run": "docker run -p 3000:3000 -e PUBLIC_MAIN_API_URL=http://facreport.iptime.org:8006 -e PUBLIC_AUTH_API_URL=http://facreport.iptime.org:5009 facreport-frontend"
  },
  "devDependencies": {
    "@sveltejs/adapter-node": "^1.0.0",
    "@sveltejs/kit": "^1.0.0",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.28.0",
    "eslint-plugin-svelte": "^2.30.0",
    "postcss": "^8.4.27",
    "svelte": "^4.0.5",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.2"
  },
  "dependencies": {
    "axios": "^1.4.0"
  },
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 10.3 Docker 배포 (Dockerfile)

```dockerfile
# 빌드 스테이지
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/build build/
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules node_modules/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "build/index.js"]
```

## 11. 결론 및 추가 고려사항

이 작업지시서는 Svelte 프레임워크를 사용하여 두 개의 API 서버(Main API, Auth API)와 통신하는 프론트엔드 애플리케이션의 구현 방법을 상세히 설명했습니다. 구현 시 다음 사항을 고려하세요:

1. **모듈식 구조**: 코드는 기능별로 분리되어 유지보수가 용이합니다.
2. **인증 처리**: 토큰 기반 인증을 통해 보안을 강화했습니다.
3. **상태 관리**: Svelte의 내장 스토어를 활용하여 효율적인 상태 관리를 구현했습니다.
4. **오류 처리**: 일관된 오류 처리 메커니즘을 통해 사용자 경험을 향상했습니다.
5. **반응형 디자인**: 모바일 기기를 포함한 다양한 디바이스에서 원활하게 작동합니다.
6. **TypeScript 지원**: 타입 안전성을 통해 개발 경험과 코드 품질을 향상시켰습니다.
7. **모듈 구조화**: 순환 참조 문제를 해결하기 위한 모듈 구조화로 코드의 안정성을 높였습니다.

### 추가 개선 가능 사항:

1. **테스트 추가**: 단위 테스트, 통합 테스트 및 E2E 테스트를 구현하여 코드 품질 향상
2. **국제화(i18n)**: 다국어 지원을 위한 프레임워크 추가
3. **접근성(a11y)**: 웹 접근성 표준을 준수하도록 개선
4. **성능 최적화**: 코드 분할, 이미지 최적화 등을 통한 성능 향상
5. **모니터링 도구**: 프론트엔드 오류 및 성능 모니터링을 위한 도구 통합

## 12. 개발 일정 및 작업 계획

### 1일차: 프로젝트 설정 및 기본 구조 구축

- [ ] SvelteKit 프로젝트 생성
- [ ] 의존성 설치 (axios, tailwindcss 등)
- [ ] TypeScript 설치 및 설정
  ```bash
  npm install -D typescript @tsconfig/svelte
  ```
- [ ] `tsconfig.json` 생성
  ```bash
  npx svelte-add typescript
  ```
- [ ] Vite 설정 파일 생성 (`vite.config.ts`)
- [ ] 타입 정의 파일 구성
  ```bash
  mkdir -p src/lib/types
  ```
- [ ] 프로젝트 구조 설정
- [ ] 환경 변수 설정 (.env 파일)

### 2일차: 인증 모듈 및 API 클라이언트 구현

- [ ] 인증 타입 정의 (`src/lib/types/auth.types.ts`)
- [ ] 토큰 관리 유틸리티 분리 (`src/lib/utils/token.ts`)
- [ ] API 인터셉터 모듈 분리 (`src/lib/api/interceptors.ts`)
- [ ] Auth API 클라이언트 구현
- [ ] Main API 클라이언트 구현
- [ ] 인증 스토어 구현
- [ ] 애플리케이션 스토어 구현

### 3일차: 인증 페이지 및 라우트 보호 구현

- [ ] 레이아웃 로직 구현 (인증 체크)
- [ ] 로그인 페이지 구현
- [ ] 회원가입 페이지 구현
- [ ] 소셜 로그인 연동

### 4일차: 대시보드 및 기본 UI 컴포넌트 구현

- [ ] 메인 레이아웃 구현
- [ ] 사이드바 컴포넌트 구현
- [ ] 네비게이션 바 구현
- [ ] 대시보드 페이지 구현

### 5일차: 오류 처리 및 마무리

- [ ] 공통 오류 처리 유틸리티 구현
- [ ] 알림 컴포넌트 구현
- [ ] 배포 설정 (SvelteKit 어댑터, Docker)
- [ ] 최종 테스트 및 버그 수정