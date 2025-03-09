<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
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
  <div class="navbar-container">
    <!-- 왼쪽: 모바일 메뉴 버튼 및 페이지 제목 -->
    <div class="navbar-left">
      <!-- 모바일 메뉴 버튼 -->
      <button 
        type="button"
        class="navbar-menu-button"
        on:click={toggleSidebar}
        aria-label="사이드바 열기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <!-- 페이지 제목 -->
      <h1 class="navbar-title">{pageTitle}</h1>
    </div>
    
    <!-- 오른쪽: 검색, 알림 및 사용자 메뉴 -->
    <div class="navbar-right">
      <!-- 검색 -->
      <div class="navbar-search">
        <label for="search-input" class="sr-only">검색</label>
        <input 
          id="search-input"
          type="text" 
          placeholder="검색..." 
          class="navbar-search-input"
        />
        <svg class="navbar-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      
      <!-- 알림 -->
      <div class="navbar-notification">
        <button 
          type="button"
          id="notification-button"
          class="navbar-icon-button"
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
            <span class="navbar-notification-badge">{unreadCount}</span>
          {/if}
        </button>
        
        <!-- 알림 메뉴 -->
        {#if showNotifications}
          <div 
            id="notification-menu"
            class="navbar-dropdown"
            role="menu"
            aria-labelledby="notification-button"
          >
            <div class="navbar-dropdown-header">
              <h3 class="navbar-dropdown-title">알림</h3>
              {#if unreadCount > 0}
                <button 
                  type="button"
                  class="navbar-dropdown-action"
                  on:click={markAllAsRead}
                >
                  모두 읽음 표시
                </button>
              {/if}
            </div>
            
            <div class="navbar-dropdown-content">
              {#if notifications.length === 0}
                <div class="navbar-dropdown-empty">
                  알림이 없습니다.
                </div>
              {:else}
                <ul role="menu" class="navbar-notification-list">
                  {#each notifications as notification}
                    <li role="menuitem">
                      <button 
                        type="button"
                        class="navbar-notification-item {notification.read ? '' : 'unread'}"
                        on:click={() => markAsRead(notification.id)}
                        on:keydown={(e) => handleNotificationKeyDown(e, notification.id)}
                        tabindex="0"
                      >
                        <div class="navbar-notification-header">
                          <h4 class="navbar-notification-title">{notification.title}</h4>
                          <span class="navbar-notification-time">{notification.time}</span>
                        </div>
                        <p class="navbar-notification-message">{notification.message}</p>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            
            <div class="navbar-dropdown-footer">
              <a href="/notifications" class="navbar-dropdown-link">
                모든 알림 보기
              </a>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- 설정 아이콘 -->
      <button 
        type="button"
        class="navbar-icon-button"
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
      </button>
    </div>
  </div>
</header>

<style>
  .navbar {
    background-color: var(--color-content-bg);
    border-bottom: 1px solid var(--color-border);
  }
  
  .navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
  }
  
  .navbar-menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    color: var(--color-text-primary);
    background: none;
    border: none;
    cursor: pointer;
  }
  
  @media (min-width: 768px) {
    .navbar-menu-button {
      display: none;
    }
  }
  
  .navbar-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .navbar-search {
    position: relative;
    display: none;
  }
  
  @media (min-width: 768px) {
    .navbar-search {
      display: block;
    }
  }
  
  .navbar-search-input {
    width: 16rem;
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    border-radius: 9999px;
    background-color: var(--color-main-bg);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    outline: none;
    transition: all 0.2s;
  }
  
  .navbar-search-input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  .navbar-search-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
    pointer-events: none;
  }
  
  .navbar-notification {
    position: relative;
  }
  
  .navbar-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    color: var(--color-text-primary);
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
  }
  
  .navbar-icon-button:hover {
    background-color: var(--color-main-bg);
  }
  
  .navbar-notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    width: 1rem;
    height: 1rem;
    background-color: #ef4444;
    color: white;
    font-size: 0.75rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .navbar-dropdown {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 0.5rem;
    width: 20rem;
    background-color: var(--color-content-bg);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px var(--color-shadow), 0 2px 4px -1px var(--color-shadow);
    border: 1px solid var(--color-border);
    overflow: hidden;
    z-index: 50;
  }
  
  .navbar-dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-main-bg);
  }
  
  .navbar-dropdown-title {
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  .navbar-dropdown-action {
    font-size: 0.875rem;
    color: var(--color-accent);
    background: none;
    border: none;
    cursor: pointer;
  }
  
  .navbar-dropdown-action:hover {
    text-decoration: underline;
  }
  
  .navbar-dropdown-content {
    max-height: 24rem;
    overflow-y: auto;
  }
  
  .navbar-dropdown-empty {
    padding: 1rem;
    text-align: center;
    color: var(--color-text-secondary);
  }
  
  .navbar-notification-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .navbar-notification-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .navbar-notification-item:hover {
    background-color: var(--color-main-bg);
  }
  
  .navbar-notification-item.unread {
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .navbar-notification-header {
    display: flex;
    justify-content: space-between;
  }
  
  .navbar-notification-title {
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0;
  }
  
  .navbar-notification-time {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
  
  .navbar-notification-message {
    font-size: 0.875rem;
    color: var(--color-text-primary);
    margin: 0.25rem 0 0 0;
  }
  
  .navbar-dropdown-footer {
    padding: 0.5rem;
    text-align: center;
    border-top: 1px solid var(--color-border);
    background-color: var(--color-main-bg);
  }
  
  .navbar-dropdown-link {
    font-size: 0.875rem;
    color: var(--color-accent);
    text-decoration: none;
  }
  
  .navbar-dropdown-link:hover {
    text-decoration: underline;
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style> 