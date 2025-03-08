<script lang="ts">
  // 로딩 크기
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  // 로딩 색상
  export let color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'primary';
  
  // 로딩 텍스트
  export let text = '';
  
  // 로딩 타입
  export let type: 'spinner' | 'dots' | 'pulse' = 'spinner';
  
  // 전체 화면 오버레이
  export let fullScreen = false;
  
  // 추가 클래스
  export let className = '';
  
  // 크기 클래스 계산
  $: sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size];
  
  // 색상 클래스 계산
  $: colorClasses = {
    primary: 'text-blue-600 dark:text-blue-500',
    secondary: 'text-gray-600 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-500',
    danger: 'text-red-600 dark:text-red-500',
    warning: 'text-yellow-600 dark:text-yellow-500',
    info: 'text-blue-400 dark:text-blue-300',
    light: 'text-gray-300 dark:text-gray-600',
    dark: 'text-gray-800 dark:text-gray-200'
  }[color];
  
  // 텍스트 크기 클래스 계산
  $: textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }[size];
</script>

{#if fullScreen}
  <div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
    <div class="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {#if type === 'spinner'}
        <div class="{sizeClasses} {colorClasses} {className} animate-spin">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      {:else if type === 'dots'}
        <div class="flex space-x-2 {colorClasses} {className}">
          <div class="{sizeClasses.split(' ')[0].replace('w-', 'w-').replace('h-', 'h-')} rounded-full animate-pulse" style="animation-delay: 0s;"></div>
          <div class="{sizeClasses.split(' ')[0].replace('w-', 'w-').replace('h-', 'h-')} rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
          <div class="{sizeClasses.split(' ')[0].replace('w-', 'w-').replace('h-', 'h-')} rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
        </div>
      {:else if type === 'pulse'}
        <div class="{sizeClasses} {colorClasses} {className} rounded-full animate-ping"></div>
      {/if}
      
      {#if text}
        <p class="mt-3 {textSizeClasses} text-gray-700 dark:text-gray-300">{text}</p>
      {/if}
    </div>
  </div>
{:else}
  <div class="flex flex-col items-center">
    {#if type === 'spinner'}
      <div class="{sizeClasses} {colorClasses} {className} animate-spin">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {:else if type === 'dots'}
      <div class="flex space-x-2 {colorClasses} {className}">
        <div class="{sizeClasses.split(' ')[0].replace('w-', 'w-').replace('h-', 'h-')} bg-current rounded-full animate-pulse" style="animation-delay: 0s;"></div>
        <div class="{sizeClasses.split(' ')[0].replace('w-', 'w-').replace('h-', 'h-')} bg-current rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
        <div class="{sizeClasses.split(' ')[0].replace('w-', 'w-').replace('h-', 'h-')} bg-current rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
      </div>
    {:else if type === 'pulse'}
      <div class="{sizeClasses} {colorClasses} {className} bg-current rounded-full animate-ping"></div>
    {/if}
    
    {#if text}
      <p class="mt-2 {textSizeClasses} text-gray-700 dark:text-gray-300">{text}</p>
    {/if}
  </div>
{/if} 