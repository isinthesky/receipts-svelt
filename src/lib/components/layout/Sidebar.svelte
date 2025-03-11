<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore } from '$lib/stores/auth';
  import { taskStore } from '$lib/stores/tasks';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { invalidateAll } from '$app/navigation';

  // 네비게이션 항목
  const navItems = [
    { label: '대시보드', path: '/dashboard', icon: '🏠' },
    { label: '태스크 관리', path: '/tasks', icon: '📋' },
    { label: '설정', path: '/settings', icon: '⚙️' }
  ];

  // 현재 경로 확인
  $: currentPath = $page.url.pathname;

  // 태스크 목록 로드
  onMount(async () => {
    await taskStore.loadTasks();
  });

  // 태스크 상세 페이지로 이동
  async function navigateToTask(taskId: string) {
    // 현재 타임스탬프를 URL에 추가하여 항상 새로운 URL로 인식되도록 함
    const timestamp = Date.now();
    const newPath = `/tasks/${taskId}?_t=${timestamp}`;
    
    try {
      // 페이지 데이터 무효화 후 이동
      await invalidateAll();
      await goto(newPath);
    } catch (error) {
      console.error('페이지 이동 중 오류 발생:', error);
      // 오류 발생 시 강제 새로고침으로 대체
      window.location.href = newPath;
    }
  }

  // 모바일 사이드바 토글
  function toggleSidebar() {
    appStore.toggleSidebar();
  }

  // 키보드 이벤트 핸들러 (Enter 또는 Space 키 누를 때 사이드바 토글)
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
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
    <h1 class="px-4 mb-3 text-sm font-medium text-sidebar-text uppercase tracking-wider">Receipts App</h1>
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

    <!-- 태스크 목록 네비게이션 -->
    {#if $taskStore.tasks.length > 0}
      <div class="mt-6">
        <h3 class="px-4 mb-3 text-sm font-medium text-sidebar-text uppercase tracking-wider">태스크 목록</h3>
        <ul class="space-y-2">
          {#each $taskStore.tasks as task}
            <li>
              <button 
                type="button"
                on:click={() => navigateToTask(task.id)}
                class="
                  w-full flex items-center px-4 py-2 rounded-lg
                  transition-colors duration-200
                  {currentPath === `/tasks/${task.id}`
                    ? 'bg-sidebar-active text-white'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'}
                "
                aria-current={currentPath === `/tasks/${task.id}` ? 'page' : undefined}
              >
                <span class="font-medium truncate">{task.taskName}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </nav>

  <!-- 하단 사용자 정보 -->
  <div class="absolute bottom-0 w-full border-t border-sidebar-border p-4">
    <div class="flex items-center mb-3">
      <div class="w-10 h-1 rounded-full bg-sidebar-user flex items-center justify-center text-white">
        {#if $authStore.user?.name}
          {$authStore.user.name.charAt(0).toUpperCase()}
        {:else if $authStore.user?.email}
          {$authStore.user.email.charAt(0).toUpperCase()}
        {:else}
          U
        {/if}
      </div>
      <div class="flex flex-row">
        <p class="text-white">{$authStore.user?.name || '사용자 이름'}</p>
        <button 
          type="button"
          on:click={handleLogout}
          class="flex items-center hover:bg-sidebar-hover hover:text-white rounded-lg transition-colors duration-200"
        >
          <span class="mr-3 text-lg" aria-hidden="true">🚪</span>
          <span class="font-medium">로그아웃</span>
        </button>
      </div>
    </div>
    
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