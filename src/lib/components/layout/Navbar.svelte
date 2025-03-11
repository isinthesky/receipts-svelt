<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../ui/styles/common.css';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';
  
  // 사용자 메뉴 표시 여부
  let showUserMenu = false;
  let showNotifications = false;
  
  // 사용자 정보
  $: user = $authStore.user;
  
  // 알림 목록 (예시)
  let notifications = [
    { id: '1', title: '새 보고서', message: '새로운 보고서가 등록되었습니다.', read: false, time: '10분 전' },
    { id: '2', title: '시스템 알림', message: '시스템 점검이 예정되어 있습니다.', read: true, time: '1시간 전' }
  ];
  
  // 읽지 않은 알림 수
  $: unreadCount = notifications.filter(n => !n.read).length;
  
  // 알림 읽음 처리
  function markAsRead(id: string) {
    notifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
  }
  
  // 모든 알림 읽음 처리
  function markAllAsRead() {
    notifications = notifications.map(n => ({ ...n, read: true }));
  }
  
  // 사이드바 토글
  function toggleSidebar() {
    appStore.toggleSidebar();
  }
  
  // 다크모드 토글
  function toggleDarkMode() {
    appStore.toggleDarkMode();
  }
  
  // 키보드 이벤트 핸들러 (Enter 또는 Space 키 누를 때 실행)
  function handleKeyDown(event: KeyboardEvent, callback: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // 스페이스바 스크롤 방지
      callback();
    }
  }
  
  // 알림 항목 키보드 이벤트 핸들러
  function handleNotificationKeyDown(event: KeyboardEvent, id: string) {
    handleKeyDown(event, () => markAsRead(id));
  }
  
  // 클릭 이벤트 핸들러 (메뉴 외부 클릭 시 닫기)
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    if (!target.closest('#user-menu-button') && !target.closest('#user-menu')) {
      showUserMenu = false;
    }
    
    if (!target.closest('#notification-button') && !target.closest('#notification-menu')) {
      showNotifications = false;
    }
  }
  
  // 현재 페이지 제목 가져오기
  $: pageTitle = getPageTitle($page.url.pathname);
  
  function getPageTitle(path: string): string {
    if (path.startsWith('/dashboard')) return '대시보드';
    if (path.startsWith('/tasks')) return '태스크 관리';
    if (path.startsWith('/images')) return '이미지 관리';
    if (path.startsWith('/receipts')) return '영수증 관리';
    if (path.startsWith('/settings')) return '설정';
    return 'Receipts App';
  }
  
  // 컴포넌트 마운트 시 이벤트 리스너 등록
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<header class="navbar">
  <div class="container flex items-center justify-between">
    <!-- 왼쪽: 메뉴 버튼 및 제목 -->
    <div class="flex items-center gap-md">
      <Button 
        variant="ghost"
        size="icon"
        class="md:hidden"
        on:click={toggleSidebar}
        aria-label="사이드바 열기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </Button>
      
      <h1 class="text-lg font-medium">{pageTitle}</h1>
    </div>
    
    <!-- 오른쪽: 검색, 알림, 테마 -->
    <div class="flex items-center gap-md">
      <!-- 검색 -->
      <div class="hidden md:block relative">
        <Input
          type="search"
          id="search-input"
          placeholder="검색..."
          class="w-64"
        >
          <svg slot="suffix" class="text-muted" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </Input>
      </div>
      
      <!-- 알림 -->
      <div class="relative">
        <Button
          variant="ghost"
          size="icon"
          id="notification-button"
          on:click={() => showNotifications = !showNotifications}
          aria-haspopup="true"
          aria-expanded={showNotifications}
          aria-label="알림 {unreadCount > 0 ? `${unreadCount}개 읽지 않음` : ''}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {#if unreadCount > 0}
            <span class="notification-badge">{unreadCount}</span>
          {/if}
        </Button>
        
        {#if showNotifications}
          <div 
            id="notification-menu"
            class="dropdown"
            role="menu"
            aria-labelledby="notification-button"
          >
            <div class="dropdown-header">
              <h3 class="text-base font-medium">알림</h3>
              {#if unreadCount > 0}
                <Button 
                  variant="link"
                  size="sm"
                  on:click={markAllAsRead}
                >
                  모두 읽음 표시
                </Button>
              {/if}
            </div>
            
            <div class="dropdown-content">
              {#if notifications.length === 0}
                <div class="empty-state">
                  알림이 없습니다.
                </div>
              {:else}
                <ul role="menu" class="notification-list">
                  {#each notifications as notification}
                    <li role="menuitem">
                      <button 
                        type="button"
                        class="notification-item {notification.read ? '' : 'unread'}"
                        on:click={() => markAsRead(notification.id)}
                        on:keydown={(e) => handleNotificationKeyDown(e, notification.id)}
                      >
                        <div class="flex justify-between">
                          <h4 class="font-medium">{notification.title}</h4>
                          <span class="text-xs text-muted">{notification.time}</span>
                        </div>
                        <p class="text-sm mt-1">{notification.message}</p>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            
            <div class="dropdown-footer">
              <a href="/notifications" class="text-sm text-primary hover:underline">
                모든 알림 보기
              </a>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- 테마 토글 -->
      <Button
        variant="ghost"
        size="icon"
        on:click={toggleDarkMode}
        aria-label="{$appStore.darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}"
      >
        {#if $appStore.darkMode}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        {/if}
      </Button>
    </div>
  </div>
</header>

<style>
  .navbar {
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-content-bg);
  }

  .notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    width: 1rem;
    height: 1rem;
    background-color: var(--color-error);
    color: white;
    font-size: var(--font-size-xs);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dropdown {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: var(--spacing-sm);
    width: 20rem;
    background-color: var(--color-content-bg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
    z-index: 50;
  }

  .dropdown-header,
  .dropdown-footer {
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--color-main-bg);
    border-bottom: 1px solid var(--color-border);
  }

  .dropdown-content {
    max-height: 24rem;
    overflow-y: auto;
  }

  .empty-state {
    padding: var(--spacing-md);
    text-align: center;
    color: var(--color-text-muted);
  }

  .notification-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .notification-item {
    width: 100%;
    text-align: left;
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    background: none;
    border: none;
    cursor: pointer;
  }

  .notification-item:hover {
    background-color: var(--color-main-bg);
  }

  .notification-item.unread {
    background-color: var(--color-primary-light);
  }
</style> 