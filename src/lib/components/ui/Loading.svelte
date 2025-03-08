<script lang="ts">
  // 로딩 크기
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  // 로딩 색상
  export let color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';
  
  // 로딩 텍스트
  export let text = '로딩 중...';
  
  // 전체 화면 오버레이
  export let fullScreen = false;
  
  // 추가 클래스
  export let className = '';
  
  // 크기 클래스 계산
  $: sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }[size];
  
  // 색상 클래스 계산
  $: colorClass = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-500',
    info: 'text-cyan-500'
  }[color];
  
  // 컨테이너 클래스 계산
  $: containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50' 
    : 'flex flex-col items-center justify-center p-8';
</script>

<div class="{containerClass} {className}">
  <div class="flex flex-col items-center">
    <svg 
      class="{sizeClass} {colorClass} animate-spin" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      ></circle>
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    
    {#if text}
      <p class="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">{text}</p>
    {/if}
  </div>
</div> 