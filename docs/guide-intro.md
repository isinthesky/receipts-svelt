I need more information about integrating Svelte with APIs, so let me search for that:



Let me search for information about structuring a Svelte application to interact with multiple API servers:




Now I have a better understanding of modern Svelte architecture, best practices for API integration, and authentication patterns. Let me create a detailed work instruction document for a Svelte frontend application that will interact with main API and auth API servers.

Based on the search results, I'll create a comprehensive work instruction document that covers:

1. Project structure and organization
2. Authentication flow with the auth API server
3. Integration with the main API server
4. Modern Svelte patterns and best practices
5. Component architecture
6. State management
7. Error handling and loading states
8. Deployment considerations

I'll make the document practical, detailed, and focused on creating modern, maintainable code.

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
│   │   ├── main.js           # Main API 통신 클라이언트
│   │   ├── auth.js           # Auth API 통신 클라이언트
│   │   └── interceptors.js   # API 요청/응답 인터셉터
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   └── features/         # 기능 중심 컴포넌트
│   ├── stores/               # 상태 관리 스토어
│   │   ├── auth.js           # 인증 관련 스토어
│   │   └── app.js            # 애플리케이션 상태 스토어
│   ├── utils/                # 유틸리티 함수
│   └── constants/            # 상수 정의
├── routes/                   # SvelteKit 라우트
│   ├── (auth)/               # 인증 관련 라우트 그룹
│   │   ├── login/+page.svelte
│   │   └── register/+page.svelte
│   ├── (protected)/          # 인증 필요 라우트 그룹
│   │   └── dashboard/+page.svelte
│   ├── +layout.svelte        # 루트 레이아웃
│   └── +layout.js            # 레이아웃 로직(인증 체크 등)
└── app.html                  # HTML 템플릿
```

## 3. 환경 설정 및 초기 설정

### 3.1 개발 환경 설정

```bash
# SvelteKit 프로젝트 생성
npm create svelte@latest my-facreport-app
cd my-facreport-app

# 의존성 설치
npm install

# API 통신을 위한 라이브러리
npm install axios

# UI 컴포넌트 라이브러리 (선택사항)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3.2 환경 변수 설정 (.env 파일)

```
PUBLIC_MAIN_API_URL=http://facreport.iptime.org:8006
PUBLIC_AUTH_API_URL=http://facreport.iptime.org:5009
```

## 4. API 통신 모듈 구현

### 4.1 인증 API 클라이언트 (src/lib/api/auth.js)

```javascript
import axios from 'axios';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/auth';

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
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 응답 인터셉터: 토큰 만료 처리
authClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // 리프레시 토큰으로 재시도 로직 추가 가능
      authStore.update(state => ({ ...state, isAuthenticated: false, user: null }));
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      goto('/login');
    }
    return Promise.reject(error);
  }
);

// 인증 API 함수
export const authAPI = {
  // 로그인 (ID/PW)
  login: async (credentials) => {
    const response = await authClient.post('/api/v1/auth/local/login', credentials);
    if (response.data.tokens && response.data.tokens.access_token) {
      localStorage.setItem('access_token', response.data.tokens.access_token);
      if (response.data.tokens.refresh_token) {
        localStorage.setItem('refresh_token', response.data.tokens.refresh_token);
      }
      return response.data;
    }
    return null;
  },
  
  // 이메일 로그인
  loginWithEmail: async (credentials) => {
    const response = await authClient.post('/api/v1/auth/local/login/email', credentials);
    if (response.data.tokens && response.data.tokens.access_token) {
      localStorage.setItem('access_token', response.data.tokens.access_token);
      if (response.data.tokens.refresh_token) {
        localStorage.setItem('refresh_token', response.data.tokens.refresh_token);
      }
      return response.data;
    }
    return null;
  },
  
  // 회원가입
  register: async (userData) => {
    const response = await authClient.post('/api/v1/auth/local/register', userData);
    return response.data;
  },
  
  // 비밀번호 변경
  changePassword: async (passwordData) => {
    const response = await authClient.post('/api/v1/auth/local/change-password', passwordData);
    return response.data;
  },
  
  // 소셜 로그인 URL 가져오기
  getSocialLoginUrl: (provider, redirectUri) => {
    return `${import.meta.env.PUBLIC_AUTH_API_URL}/api/v1/auth/social/${provider}/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },
  
  // 로그아웃
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authClient.post('/api/v1/auth/common/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    authStore.update(state => ({ ...state, isAuthenticated: false, user: null }));
  },
  
  // 현재 사용자 정보 가져오기
  getCurrentUser: async () => {
    const response = await authClient.get('/api/v1/users/me');
    return response.data;
  },
  
  // 사용자 프로필 업데이트
  updateUserProfile: async (profileData) => {
    const response = await authClient.patch('/api/v1/users/me', profileData);
    return response.data;
  },
  
  // 토큰 갱신
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await authClient.post('/api/v1/auth/common/refresh', {
      refresh_token: refreshToken
    });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      return response.data;
    }
    return null;
  }
};
```

### 4.2 Main API 클라이언트 (src/lib/api/main.js)

```javascript
import axios from 'axios';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/auth';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 응답 인터셉터: 토큰 만료 처리
mainClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      authStore.update(state => ({ ...state, isAuthenticated: false, user: null }));
      localStorage.removeItem('token');
      goto('/login');
    }
    return Promise.reject(error);
  }
);

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

### 5.1 인증 스토어 (src/lib/stores/auth.js)

```javascript
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 초기 상태
const initialState = {
  isAuthenticated: browser ? !!localStorage.getItem('access_token') : false,
  user: null,
  loading: false,
  error: null
};

// 인증 스토어 생성
export const authStore = writable(initialState);

// 인증 스토어 액션
export const authActions = {
  setAuthenticated: (user, accessToken) => {
    if (browser && accessToken) {
      localStorage.setItem('access_token', accessToken);
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    
    authStore.update(state => ({
      ...state,
      isAuthenticated: false,
      user: null
    }));
  },
  
  setLoading: (isLoading) => {
    authStore.update(state => ({
      ...state,
      loading: isLoading
    }));
  },
  
  setError: (error) => {
    authStore.update(state => ({
      ...state,
      error
    }));
  },
  
  setUser: (user) => {
    authStore.update(state => ({
      ...state,
      user
    }));
  },
  
  updateUserProfile: (profileData) => {
    authStore.update(state => {
      if (!state.user) return state;
      
      return {
        ...state,
        user: {
          ...state.user,
          ...profileData
        }
      };
    });
  }
};
```

### 5.2 애플리케이션 스토어 (src/lib/stores/app.js)

```javascript
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

### 6.1 레이아웃 로직 (src/routes/+layout.js)

```javascript
import { authAPI } from '$lib/api/auth';
import { authStore, authActions } from '$lib/stores/auth';
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutLoad} */
export async function load({ url, fetch, params, parent }) {
  // 로그인 상태 확인
  if (browser) {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        authActions.setLoading(true);
        const userData = await authAPI.getCurrentUser();
        authActions.setAuthenticated(userData, accessToken);
      } catch (error) {
        console.error('Failed to get user data:', error);
        
        // 액세스 토큰이 만료된 경우 리프레시 토큰으로 갱신 시도
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await authAPI.refreshToken();
            if (refreshResponse && refreshResponse.access_token) {
              // 토큰 갱신 성공 후 사용자 정보 다시 조회
              const userData = await authAPI.getCurrentUser();
              authActions.setAuthenticated(userData, refreshResponse.access_token);
            } else {
              authActions.setUnauthenticated();
            }
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            authActions.setUnauthenticated();
          }
        } else {
          authActions.setUnauthenticated();
        }
      } finally {
        authActions.setLoading(false);
      }
    }
  }
  
  // 보호된 경로 접근 시 로그인 확인
  const isProtectedRoute = url.pathname.startsWith('/dashboard') || 
                           url.pathname.startsWith('/reports') || 
                           url.pathname.startsWith('/settings');
  
  const isAuthRoute = url.pathname === '/login' || url.pathname === '/register' || url.pathname.startsWith('/auth/callback');
  
  let isAuthenticated;
  let isLoading;
  const unsubscribe = authStore.subscribe(state => {
    isAuthenticated = state.isAuthenticated;
    isLoading = state.loading;
  });
  unsubscribe();
  
  // 로딩 중에는 리다이렉션 하지 않음
  if (isLoading) {
    return {};
  }
  
  if (isProtectedRoute && !isAuthenticated) {
    throw redirect(307, '/login');
  }
  
  if (isAuthRoute && isAuthenticated) {
    throw redirect(307, '/dashboard');
  }
  
  // 소셜 로그인 콜백 처리
  if (url.pathname.startsWith('/auth/callback') && url.searchParams.has('code')) {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const provider = url.pathname.split('/').pop(); // 마지막 경로 세그먼트가 provider
    
    // 여기서 소셜 로그인 콜백 처리 로직 구현 가능
    // 실제 구현은 별도의 페이지나 API 호출로 처리하는 것이 좋음
  }
  
  return {};
}
```

### 6.2 로그인 페이지 (src/routes/(auth)/login/+page.svelte)

```svelte
<script>
  import { authAPI } from '$lib/api/auth';
  import { authStore, authActions } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  
  let email = '';
  let password = '';
  let username = '';
  let loginType = 'email'; // 'email' 또는 'username'
  let loading = false;
  let error = '';
  
  async function handleLogin() {
    error = '';
    loading = true;
    
    try {
      let response;
      
      if (loginType === 'email') {
        response = await authAPI.loginWithEmail({ email, password });
      } else {
        response = await authAPI.login({ username, password });
      }
      
      if (response && response.tokens && response.tokens.access_token) {
        authActions.setAuthenticated(response.user, response.tokens.access_token);
        goto('/dashboard');
      } else {
        error = '로그인에 실패했습니다. 다시 시도해주세요.';
      }
    } catch (err) {
      console.error('Login error:', err);
      error = err.response?.data?.message || '로그인 중 오류가 발생했습니다.';
    } finally {
      loading = false;
    }
  }
  
  function toggleLoginType() {
    loginType = loginType === 'email' ? 'username' : 'email';
  }
</script>

<div class="login-container">
  <h1>로그인</h1>
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={handleLogin}>
    <div class="login-type-toggle">
      <button 
        type="button" 
        class:active={loginType === 'email'} 
        on:click={() => loginType = 'email'}
      >
        이메일 로그인
      </button>
      <button 
        type="button" 
        class:active={loginType === 'username'} 
        on:click={() => loginType = 'username'}
      >
        아이디 로그인
      </button>
    </div>
    
    {#if loginType === 'email'}
      <div class="form-group">
        <label for="email">이메일</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          required 
          disabled={loading}
        />
      </div>
    {:else}
      <div class="form-group">
        <label for="username">아이디</label>
        <input 
          type="text" 
          id="username" 
          bind:value={username} 
          required 
          disabled={loading}
        />
      </div>
    {/if}
    
    <div class="form-group">
      <label for="password">비밀번호</label>
      <input 
        type="password" 
        id="password" 
        bind:value={password} 
        required 
        disabled={loading}
      />
    </div>
    
    <button type="submit" disabled={loading} class="login-button">
      {#if loading}
        로그인 중...
      {:else}
        로그인
      {/if}
    </button>
    
    <div class="social-login">
      <p>소셜 계정으로 로그인</p>
      <div class="social-buttons">
        <a href={authAPI.getSocialLoginUrl('google', window.location.origin + '/auth/callback')} class="social-button google">
          Google로 로그인
        </a>
        <a href={authAPI.getSocialLoginUrl('kakao', window.location.origin + '/auth/callback')} class="social-button kakao">
          Kakao로 로그인
        </a>
      </div>
    </div>
    
    <div class="register-link">
      <a href="/register">계정이 없으신가요? 회원가입하기</a>
    </div>
  </form>
</div>

<style>
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
  
  .login-type-toggle {
    display: flex;
    margin-bottom: 1rem;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .login-type-toggle button {
    flex: 1;
    padding: 0.5rem;
    background-color: #f5f5f5;
    border: none;
    cursor: pointer;
  }
  
  .login-type-toggle button.active {
    background-color: #4A90E2;
    color: white;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4A90E2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 1rem;
  }
  
  .login-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .social-login {
    margin: 1rem 0;
    text-align: center;
  }
  
  .social-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .social-button {
    display: block;
    padding: 0.5rem;
    border-radius: 4px;
    text-decoration: none;
    text-align: center;
  }
  
  .social-button.google {
    background-color: #fff;
    color: #333;
    border: 1px solid #ccc;
  }
  
  .social-button.kakao {
    background-color: #FEE500;
    color: #000;
  }
  
  .register-link {
    margin-top: 1rem;
    text-align: center;
  }
</style>
```

### 6.3 회원가입 페이지 (src/routes/(auth)/register/+page.svelte)

```svelte
<script>
  import { authAPI } from '$lib/api/auth';
  import { goto } from '$app/navigation';
  
  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let name = '';
  let loading = false;
  let error = '';
  
  // 유효성 검사 상태
  let usernameValid = true;
  let emailValid = true;
  let passwordValid = true;
  let passwordMatch = true;
  let nameValid = true;
  
  // 유효성 검사 메시지
  let usernameError = '';
  let emailError = '';
  let passwordError = '';
  let confirmPasswordError = '';
  let nameError = '';
  
  // 유효성 검사 함수
  function validateUsername() {
    if (username.length < 4) {
      usernameValid = false;
      usernameError = '아이디는 최소 4자 이상이어야 합니다.';
    } else {
      usernameValid = true;
      usernameError = '';
    }
  }
  
  function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailValid = false;
      emailError = '유효한 이메일 주소를 입력해주세요.';
    } else {
      emailValid = true;
      emailError = '';
    }
  }
  
  function validatePassword() {
    if (password.length < 8) {
      passwordValid = false;
      passwordError = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else {
      passwordValid = true;
      passwordError = '';
    }
  }
  
  function validateConfirmPassword() {
    if (password !== confirmPassword) {
      passwordMatch = false;
      confirmPasswordError = '비밀번호가 일치하지 않습니다.';
    } else {
      passwordMatch = true;
      confirmPasswordError = '';
    }
  }
  
  function validateName() {
    if (name.length < 2) {
      nameValid = false;
      nameError = '이름은 최소 2자 이상이어야 합니다.';
    } else {
      nameValid = true;
      nameError = '';
    }
  }
  
  // 폼 전체 유효성 검사
  function isFormValid() {
    validateUsername();
    validateEmail();
    validatePassword();
    validateConfirmPassword();
    validateName();
    
    return usernameValid && emailValid && passwordValid && passwordMatch && nameValid;
  }
  
  async function handleRegister() {
    if (!isFormValid()) {
      return;
    }
    
    error = '';
    loading = true;
    
    try {
      const userData = {
        username,
        email,
        password,
        name
      };
      
      const response = await authAPI.register(userData);
      
      if (response && response.user) {
        // 회원가입 성공 후 로그인 페이지로 이동
        goto('/login?registered=true');
      } else {
        error = '회원가입에 실패했습니다. 다시 시도해주세요.';
      }
    } catch (err) {
      console.error('Registration error:', err);
      error = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="register-container">
  <h1>회원가입</h1>
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={handleRegister}>
    <div class="form-group">
      <label for="username">아이디 *</label>
      <input 
        type="text" 
        id="username" 
        bind:value={username} 
        on:blur={validateUsername}
        class:invalid={!usernameValid}
        required 
        disabled={loading}
      />
      {#if !usernameValid}
        <div class="field-error">{usernameError}</div>
      {/if}
      <div class="field-hint">최소 4자 이상의 아이디를 입력하세요.</div>
    </div>
    
    <div class="form-group">
      <label for="email">이메일 *</label>
      <input 
        type="email" 
        id="email" 
        bind:value={email} 
        on:blur={validateEmail}
        class:invalid={!emailValid}
        required 
        disabled={loading}
      />
      {#if !emailValid}
        <div class="field-error">{emailError}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="password">비밀번호 *</label>
      <input 
        type="password" 
        id="password" 
        bind:value={password} 
        on:blur={validatePassword}
        class:invalid={!passwordValid}
        required 
        disabled={loading}
      />
      {#if !passwordValid}
        <div class="field-error">{passwordError}</div>
      {/if}
      <div class="field-hint">최소 8자 이상의 비밀번호를 입력하세요.</div>
    </div>
    
    <div class="form-group">
      <label for="confirmPassword">비밀번호 확인 *</label>
      <input 
        type="password" 
        id="confirmPassword" 
        bind:value={confirmPassword} 
        on:blur={validateConfirmPassword}
        class:invalid={!passwordMatch}
        required 
        disabled={loading}
      />
      {#if !passwordMatch}
        <div class="field-error">{confirmPasswordError}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="name">이름 *</label>
      <input 
        type="text" 
        id="name" 
        bind:value={name} 
        on:blur={validateName}
        class:invalid={!nameValid}
        required 
        disabled={loading}
      />
      {#if !nameValid}
        <div class="field-error">{nameError}</div>
      {/if}
      <div class="field-hint">실명을 입력하세요.</div>
    </div>
    
    <button type="submit" disabled={loading} class="register-button">
      {#if loading}
        회원가입 중...
      {:else}
        회원가입
      {/if}
    </button>
    
    <div class="login-link">
      <a href="/login">이미 계정이 있으신가요? 로그인하기</a>
    </div>
  </form>
</div>

<style>
  .register-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  input.invalid {
    border-color: #dc3545;
  }
  
  .field-error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .field-hint {
    color: #6c757d;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .register-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4A90E2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }
  
  .register-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .login-link {
    margin-top: 1rem;
    text-align: center;
  }
</style>
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

### 9.1 공통 오류 처리 유틸리티 (src/lib/utils/error-handler.js)

```javascript
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

### 10.1 SvelteKit 어댑터 구성 (svelte.config.js)

```javascript
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

### 추가 개선 가능 사항:

1. **테스트 추가**: 단위 테스트, 통합 테스트 및 E2E 테스트를 구현하여 코드 품질 향상
2. **국제화(i18n)**: 다국어 지원을 위한 프레임워크 추가
3. **접근성(a11y)**: 웹 접근성 표준을 준수하도록 개선
4. **성능 최적화**: 코드 분할, 이미지 최적화 등을 통한 성능 향상
5. **모니터링 도구**: 프론트엔드 오류 및 성능 모니터링을 위한 도구 통합

이 작업지시서를 기반으로 현대적이고 견고한 프론트엔드 애플리케이션을 개발할 수 있습니다.