import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { authStore, isAuthenticated } from '$lib/stores/auth';

/** @type {import('./$types').LayoutLoad} */
export async function load({ url }) {
  // 현재 경로
  const path = url.pathname;
  
  // 보호된 경로 확인
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/(protected)') || path.startsWith('/receipts');
  
  // 인증 경로 확인
  const isAuthRoute = path === '/login' || path === '/register' || path.startsWith('/(auth)');
  
  // 루트 경로 확인
  const isRootRoute = path === '/';
  
  if (browser) {
    // 사용자 정보 가져오기 시도
    const token = localStorage.getItem('token');
    let isUserLoaded = false;
    
    // 현재 사용자 정보 확인
    authStore.subscribe(state => {
      isUserLoaded = !!state.user;
    })();
    
    if (token && !isUserLoaded) {
      try {
        await authStore.fetchUser();
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      }
    }
    
    // 인증 상태 구독
    const unsubscribe = isAuthenticated.subscribe(value => {
      // 인증되지 않은 사용자가 보호된 경로에 접근하려고 할 때
      if (!value && isProtectedRoute) {
        goto('/login');
      }
      
      // 이미 인증된 사용자가 인증 경로에 접근하려고 할 때
      if (value && isAuthRoute) {
        goto('/tasks');
      }
      
      // 루트 경로에 접근했을 때 자동 리디렉션
      if (isRootRoute) {
        if (value) {
          goto('/dashboard');
        }
      }
    });
    
    // 구독 해제
    setTimeout(() => {
      unsubscribe();
    }, 0);
  }
  
  return {
    path
  };
} 