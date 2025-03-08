<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore } from '$lib/stores/app';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Navbar from '$lib/components/layout/Navbar.svelte';
  import '../app.css';

  // 인증 상태 확인
  let authenticated = false;
  isAuthenticated.subscribe(value => {
    authenticated = value;
  });

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  onMount(async () => {
    await authStore.fetchUser();
  });
</script>

<svelte:head>
  <title>Receipts App</title>
</svelte:head>

{#if $appStore.notifications.length > 0}
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
    {#each $appStore.notifications as notification}
      <div 
        class="p-4 rounded-md shadow-md flex items-center justify-between {
          notification.type === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
          notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }"
      >
        <span>{notification.message}</span>
        <button 
          class="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          on:click={() => appStore.removeNotification(notification.id)}
        >
          ✕
        </button>
      </div>
    {/each}
  </div>
{/if}

<div class="min-h-screen {$appStore.darkMode ? 'dark' : ''}">
  {#if authenticated}
    <!-- 인증된 사용자용 레이아웃 -->
    <div class="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <!-- 사이드바 -->
      <Sidebar />
      
      <!-- 메인 콘텐츠 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 네비게이션 바 -->
        <Navbar />
        
        <!-- 페이지 콘텐츠 -->
        <main class="flex-1 overflow-y-auto p-4">
          <slot />
        </main>
      </div>
    </div>
  {:else}
    <!-- 비인증 사용자용 레이아웃 -->
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <slot />
    </div>
  {/if}
</div> 