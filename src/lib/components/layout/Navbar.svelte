<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  
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
  
  // 컴포넌트 마운트 시 이벤트 리스너 등록
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<header class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
  <div class="px-4 py-3 flex items-center justify-between">
    <!-- 왼쪽: 모바일 메뉴 버튼 및 검색 -->
    <div class="flex items-center">
      <!-- 모바일 메뉴 버튼 -->
      <button 
        type="button"
        class="md:hidden mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        on:click={toggleSidebar}
        aria-label="사이드바 열기"
      >
        <span aria-hidden="true">☰</span>
      </button>
      
      <!-- 검색 -->
      <div class="relative hidden md:block">
        <label for="search-input" class="sr-only">검색</label>
        <input 
          id="search-input"
          type="text" 
          placeholder="검색..." 
          class="w-64 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" aria-hidden="true">🔍</span>
      </div>
    </div>
    
    <!-- 오른쪽: 알림 및 사용자 메뉴 -->
    <div class="flex items-center space-x-4">
      <!-- 다크모드 토글 -->
      <button 
        type="button"
        class="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        on:click={toggleDarkMode}
        aria-label="{$appStore.darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}"
      >
        <span aria-hidden="true">
          {#if $appStore.darkMode}
            ☀️
          {:else}
            🌙
          {/if}
        </span>
      </button>
      
      <!-- 알림 -->
      <div class="relative">
        <button 
          type="button"
          id="notification-button"
          class="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative"
          on:click={() => showNotifications = !showNotifications}
          aria-haspopup="true"
          aria-expanded={showNotifications}
          aria-label="알림 {unreadCount > 0 ? `${unreadCount}개 읽지 않음` : ''}"
        >
          <span aria-hidden="true">🔔</span>
          {#if unreadCount > 0}
            <span class="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center" aria-hidden="true">
              {unreadCount}
            </span>
          {/if}
        </button>
        
        <!-- 알림 메뉴 -->
        {#if showNotifications}
          <div 
            id="notification-menu"
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700"
            role="menu"
            aria-labelledby="notification-button"
          >
            <div class="p-3 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 class="font-medium text-gray-800 dark:text-gray-200">알림</h3>
              {#if unreadCount > 0}
                <button 
                  type="button"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  on:click={markAllAsRead}
                >
                  모두 읽음 표시
                </button>
              {/if}
            </div>
            
            <div class="max-h-96 overflow-y-auto">
              {#if notifications.length === 0}
                <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                  알림이 없습니다.
                </div>
              {:else}
                <ul role="menu">
                  {#each notifications as notification}
                    <li role="menuitem">
                      <button 
                        type="button"
                        class="w-full text-left p-3 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 {notification.read ? '' : 'bg-blue-50 dark:bg-blue-900/20'}"
                        on:click={() => markAsRead(notification.id)}
                        on:keydown={(e) => handleNotificationKeyDown(e, notification.id)}
                        tabindex="0"
                      >
                        <div class="flex justify-between">
                          <h4 class="font-medium text-gray-800 dark:text-gray-200">{notification.title}</h4>
                          <span class="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            
            <div class="p-2 border-t dark:border-gray-700 text-center">
              <a href="/notifications" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                모든 알림 보기
              </a>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- 사용자 메뉴 -->
      <div class="relative">
        <button 
          type="button"
          id="user-menu-button"
          class="flex items-center space-x-2 focus:outline-none"
          on:click={() => showUserMenu = !showUserMenu}
          aria-haspopup="true"
          aria-expanded={showUserMenu}
          aria-label="사용자 메뉴"
        >
          <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300" aria-hidden="true">
            {#if user?.name}
              {user.name.charAt(0).toUpperCase()}
            {:else if user?.email}
              {user.email.charAt(0).toUpperCase()}
            {:else}
              U
            {/if}
          </div>
          <span class="hidden md:block text-gray-800 dark:text-gray-200">
            {user?.name || user?.email || '사용자'}
          </span>
        </button>
        
        <!-- 사용자 메뉴 -->
        {#if showUserMenu}
          <div 
            id="user-menu"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700"
            role="menu"
            aria-labelledby="user-menu-button"
          >
            <div class="p-3 border-b dark:border-gray-700">
              <p class="font-medium text-gray-800 dark:text-gray-200">
                {user?.name || '사용자'}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {user?.email || ''}
              </p>
            </div>
            
            <div class="py-1">
              <a 
                href="/profile" 
                class="block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                role="menuitem"
              >
                프로필
              </a>
              <a 
                href="/settings" 
                class="block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                role="menuitem"
              >
                설정
              </a>
              <button 
                type="button"
                on:click={() => authStore.logout()}
                class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                role="menuitem"
              >
                로그아웃
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header> 