<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    close: void;
  }>();
  
  // 알림 타입
  export let type: 'info' | 'success' | 'warning' | 'error' = 'info';
  
  // 알림 제목
  export let title = '';
  
  // 알림 닫기 버튼 표시 여부
  export let dismissible = true;
  
  // 알림 아이콘 표시 여부
  export let showIcon = true;
  
  // 추가 클래스
  export let className = '';
  
  // 타입별 스타일 및 아이콘 계산
  $: typeStyles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-300 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-100',
      icon: 'ℹ️'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-300 dark:border-green-800',
      text: 'text-green-800 dark:text-green-100',
      icon: '✅'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-300 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-100',
      icon: '⚠️'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-300 dark:border-red-800',
      text: 'text-red-800 dark:text-red-100',
      icon: '❌'
    }
  }[type];
  
  // 알림 닫기 핸들러
  function handleClose() {
    dispatch('close');
  }
</script>

<div 
  class="
    p-4 mb-4 rounded-md border
    {typeStyles.bg}
    {typeStyles.border}
    {typeStyles.text}
    {className}
  "
  role="alert"
>
  <div class="flex items-start">
    {#if showIcon}
      <div class="flex-shrink-0 mr-3">
        <span class="text-lg">{typeStyles.icon}</span>
      </div>
    {/if}
    
    <div class="flex-1">
      {#if title}
        <h3 class="text-lg font-medium mb-1">{title}</h3>
      {/if}
      
      <div class="text-sm">
        <slot />
      </div>
    </div>
    
    {#if dismissible}
      <button 
        type="button"
        class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="닫기"
        on:click={handleClose}
      >
        <span class="sr-only">닫기</span>
        <span class="text-lg">✕</span>
      </button>
    {/if}
  </div>
</div> 