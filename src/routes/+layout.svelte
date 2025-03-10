<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { appStore } from '$lib/stores/app';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Navbar from '$lib/components/layout/Navbar.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import '../app.css';

  // 인증 상태 확인
  let authenticated = false;
  isAuthenticated.subscribe(value => {
    authenticated = value;
  });

  // 사이드바 토글 함수
  function toggleSidebar() {
    appStore.toggleSidebar();
  }
  
  // 다크모드 토글 함수
  function toggleDarkMode() {
    appStore.toggleDarkMode();
  }
  
  // 현재 경로가 보호된 경로인지 확인
  $: isProtectedRoute = $page.url.pathname.startsWith('/tasks') || 
                        $page.url.pathname.startsWith('/images') || 
                        $page.url.pathname.startsWith('/receipts');
  
  // 현재 경로가 인증 경로인지 확인
  $: isAuthRoute = $page.url.pathname.startsWith('/login') || 
                  $page.url.pathname.startsWith('/register');
  
  // 현재 활성화된 메뉴 아이템 확인
  $: activeMenuItem = $page.url.pathname.split('/')[1] || 'dashboard';

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  onMount(async () => {
    // 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token && refreshToken) {
      // 토큰이 있으면 사용자 정보 가져오기 시도
      const success = await authStore.fetchUser();
      
      // 사용자 정보 가져오기 실패 시 (토큰 만료 등) 자동으로 리프레시 토큰으로 갱신 시도
      if (!success && refreshToken) {
        try {
          // 동적으로 auth API 모듈 가져오기
          const { refreshAuthToken } = await import('$lib/api/auth');
          const newToken = await refreshAuthToken();
          
          if (newToken) {
            // 새 토큰으로 다시 사용자 정보 가져오기 시도
            await authStore.fetchUser();
          }
        } catch (error) {
          console.error('토큰 갱신 실패:', error);
          // 실패 시 로그인 페이지로 리다이렉트 (authStore.logout에서 처리됨)
          // authStore.logout();
        }
      }
    }
  });
</script>

<svelte:head>
  <title>Receipts App</title>
</svelte:head>

{#if $appStore.notifications.length > 0}
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
    {#each $appStore.notifications as notification}
      <Alert 
        type={notification.type} 
        message={notification.message} 
        dismissible={true}
        on:dismiss={() => appStore.removeNotification(notification.id)} 
      />
    {/each}
  </div>
{/if}

<div class="min-h-screen app-container {$appStore.darkMode ? 'dark-mode' : 'light-mode'}">
  {#if authenticated}
    <!-- 인증된 사용자용 레이아웃 -->
    <div class="flex h-screen">
      <Sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main class="flex-1 overflow-y-auto p-5 content-area">
          <slot />
        </main>
      </div>
    </div>
  {:else}
    <!-- 비인증 사용자용 레이아웃 -->
    <div class="min-h-screen content-area">
      <slot />
    </div>
  {/if}
</div> 