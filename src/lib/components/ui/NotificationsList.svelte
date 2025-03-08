<script lang="ts">
  import { appStore } from '$lib/stores/app';
  
  // 알림 최대 표시 개수
  export let maxItems = 5;
  
  // 알림 목록 표시 위치
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  
  // 알림 간격
  export let gap = 'gap-2';
  
  // 알림 너비
  export let width = 'max-w-md';
  
  // 위치 클래스 계산
  $: positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50'
  }[position];
  
  // 표시할 알림 목록 계산
  $: notifications = $appStore.notifications.slice(0, maxItems);
</script>

<div class="{positionClasses} flex flex-col {gap} {width}">
  {#each notifications as notification (notification.id)}
    <div 
      class="p-4 rounded-md shadow-md flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-right-5 {
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