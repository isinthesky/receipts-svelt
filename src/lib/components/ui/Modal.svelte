<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let title: string = '';
  export let showClose: boolean = true;
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  const dispatch = createEventDispatcher();

  // 모달 닫기 함수
  function close() {
    dispatch('close');
  }

  // ESC 키 누를 때 모달 닫기
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }

  // 모달 외부 클릭 시 닫기
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      close();
    }
  }

  // 모달이 열릴 때 스크롤 방지
  onMount(() => {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  // 모달 크기에 따른 클래스
  $: sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }[size];
</script>

<div 
  class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black bg-opacity-50"
  on:click={handleOutsideClick}
  transition:fade={{ duration: 200 }}
>
  <div 
    class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full {sizeClass} overflow-hidden"
    transition:fade={{ duration: 150, delay: 50 }}
  >
    {#if title || showClose}
      <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        {#if title}
          <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200">{title}</h3>
        {:else}
          <div></div>
        {/if}
        
        {#if showClose}
          <button 
            type="button"
            class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
            on:click={close}
            aria-label="닫기"
          >
            ✕
          </button>
        {/if}
      </div>
    {/if}
    
    <div>
      <slot></slot>
    </div>
  </div>
</div> 