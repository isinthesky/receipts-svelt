<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore } from '$lib/stores/auth';
  import { page } from '$app/stores';

  // 네비게이션 항목
  const navItems = [
    { label: '대시보드', path: '/dashboard', icon: '📊' },
    { label: '보고서', path: '/reports', icon: '📝' },
    { label: '분석', path: '/analytics', icon: '📈' },
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
    class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden w-full h-full border-0 cursor-pointer"
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
    bg-white dark:bg-gray-800 
    shadow-lg md:shadow-none
    transform transition-transform duration-300 ease-in-out
    {$appStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  "
>
  <!-- 로고 및 앱 이름 -->
  <div class="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
    <div class="flex items-center">
      <span class="text-xl font-semibold text-gray-800 dark:text-white">Receipts App</span>
    </div>
    <!-- 모바일 닫기 버튼 -->
    <button 
      type="button"
      class="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      on:click={toggleSidebar}
      aria-label="사이드바 닫기"
    >
      ✕
    </button>
  </div>

  <!-- 네비게이션 메뉴 -->
  <nav class="px-2 py-4">
    <ul class="space-y-2">
      {#each navItems as item}
        <li>
          <a 
            href={item.path} 
            class="
              flex items-center px-4 py-2 rounded-md
              {currentPath.startsWith(item.path) 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100' 
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
            "
            aria-current={currentPath.startsWith(item.path) ? 'page' : undefined}
          >
            <span class="mr-3" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- 하단 메뉴 -->
  <div class="absolute bottom-0 w-full border-t dark:border-gray-700">
    <ul>
      <li>
        <button 
          type="button"
          on:click={handleLogout}
          class="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <span class="mr-3" aria-hidden="true">🚪</span>
          <span>로그아웃</span>
        </button>
      </li>
    </ul>
  </div>
</aside> 