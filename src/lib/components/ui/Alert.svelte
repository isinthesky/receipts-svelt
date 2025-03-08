<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    close: void;
  }>();
  
  // 알림 타입
  export let type: 'info' | 'success' | 'warning' | 'error' = 'info';
  
  // 알림 제목
  export let title: string | undefined = undefined;
  
  // 알림 메시지
  export let message: string | undefined = undefined;
  
  // 알림 닫기 버튼 표시 여부
  export let dismissible = false;
  
  // 알림 아이콘 표시 여부
  export let showIcon = true;
  
  // 추가 클래스
  export let className = '';
  
  let visible = true;
  
  // 알림 닫기 핸들러
  function handleClose() {
    dispatch('close');
    visible = false;
  }

  $: typeClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  }[type];

  $: iconClasses = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  }[type];

  $: icon = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>`
  }[type];
</script>

{#if visible}
  <div class={`flex items-start p-4 mb-4 border rounded-lg ${typeClasses} ${className}`} role="alert">
    {#if showIcon}
      <div class={`flex-shrink-0 mr-3 ${iconClasses}`}>
        {@html icon}
      </div>
    {/if}
    
    <div class="flex-1">
      {#if title}
        <h3 class="text-lg font-medium">{title}</h3>
      {/if}
      
      {#if message}
        <div class="text-sm">
          {message}
        </div>
      {:else}
        <div class="text-sm">
          <slot />
        </div>
      {/if}
    </div>
    
    {#if dismissible}
      <button 
        type="button" 
        class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:outline-none" 
        aria-label="Close"
        on:click={handleClose}
      >
        <span class="sr-only">닫기</span>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    {/if}
  </div>
{/if} 