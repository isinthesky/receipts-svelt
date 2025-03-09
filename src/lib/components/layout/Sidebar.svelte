<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore } from '$lib/stores/auth';
  import { page } from '$app/stores';

  // 네비게이션 항목
  const navItems = [
    { label: '대시보드', path: '/dashboard', icon: '��' },
    { label: '태스크 관리', path: '/tasks', icon: '📋' },
    { label: '이미지 관리', path: '/images', icon: '🖼️' },
    { label: '영수증 관리', path: '/receipts', icon: '🧾' },
    { label: '설정', path: '/settings', icon: '⚙️' }
  ];

  // 현재 경로 확인
  $: currentPath = $page.url.pathname;

  // 모바일 사이드바 토글
  function toggleSidebar() {
    appStore.toggleSidebar();
  }

  // 키보드 이벤트 핸들러 (Enter 또는 Space 키 누를 때 사이드바 토글)
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // 스페이스바 스크롤 방지
      toggleSidebar();
    }
  }

  // 로그아웃 처리
  async function handleLogout() {
    await authStore.logout();
  }
</script>

<!-- 모바일 사이드바 오버레이 -->
{#if !$appStore.sidebarOpen && window.innerWidth < 768}
  <button 
    type="button"
    class="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden w-full h-full border-0 cursor-pointer"
    on:click={toggleSidebar}
    on:keydown={handleKeyDown}
    aria-label="사이드바 닫기"
  ></button>
{/if}

<!-- 사이드바 -->
<aside 
  class="
    fixed md:relative z-30 md:z-auto
    w-64 h-screen 
    bg-sidebar
    transform transition-transform duration-300 ease-in-out
    {$appStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  "
>
  <!-- 로고 및 앱 이름 -->
  <div class="flex items-center justify-center h-16 border-b border-sidebar-border">
    <span class="text-xl font-medium text-white">Receipts App</span>
  </div>

  <!-- 네비게이션 메뉴 -->
  <nav class="px-5 py-5">
    <ul class="space-y-3">
      {#each navItems as item}
        <li>
          <a 
            href={item.path} 
            class="
              flex items-center px-4 py-2.5 rounded-lg
              transition-colors duration-200
              {currentPath.startsWith(item.path) 
                ? 'bg-sidebar-active text-white' 
                : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'}
            "
            aria-current={currentPath.startsWith(item.path) ? 'page' : undefined}
          >
            <span class="mr-3 text-lg" aria-hidden="true">{item.icon}</span>
            <span class="font-medium">{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- 하단 사용자 정보 -->
  <div class="absolute bottom-0 w-full border-t border-sidebar-border p-4">
    <div class="flex items-center mb-3">
      <div class="w-10 h-10 rounded-full bg-sidebar-user flex items-center justify-center text-white">
        {#if $authStore.user?.name}
          {$authStore.user.name.charAt(0).toUpperCase()}
        {:else if $authStore.user?.email}
          {$authStore.user.email.charAt(0).toUpperCase()}
        {:else}
          U
        {/if}
      </div>
      <div class="ml-3">
        <p class="text-white">{$authStore.user?.name || '사용자 이름'}</p>
      </div>
    </div>
    <button 
      type="button"
      on:click={handleLogout}
      class="flex items-center w-full px-4 py-2 text-sidebar-text hover:bg-sidebar-hover hover:text-white rounded-lg transition-colors duration-200"
    >
      <span class="mr-3 text-lg" aria-hidden="true">🚪</span>
      <span class="font-medium">로그아웃</span>
    </button>
  </div>
</aside>

<style>
  /* 사이드바 색상 변수 */
  :root {
    --sidebar-bg: #2c3e50;
    --sidebar-active: #3498db;
    --sidebar-hover: rgba(52, 152, 219, 0.3);
    --sidebar-text: #ecf0f1;
    --sidebar-border: rgba(236, 240, 241, 0.1);
    --sidebar-user: #bdc3c7;
  }
  
  /* 사이드바 스타일 */
  .bg-sidebar {
    background-color: var(--sidebar-bg);
  }
  
  .bg-sidebar-active {
    background-color: var(--sidebar-active);
    opacity: 0.6;
  }
  
  .bg-sidebar-hover {
    background-color: var(--sidebar-hover);
  }
  
  .text-sidebar-text {
    color: var(--sidebar-text);
  }
  
  .border-sidebar-border {
    border-color: var(--sidebar-border);
  }
  
  .bg-sidebar-user {
    background-color: var(--sidebar-user);
  }
</style> 