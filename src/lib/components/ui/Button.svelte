<script lang="ts">
  // 버튼 타입
  export let type: 'button' | 'submit' | 'reset' = 'button';
  
  // 버튼 변형
  export let variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link' = 'primary';
  
  // 버튼 크기
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  // 버튼 전체 너비
  export let fullWidth = false;
  
  // 버튼 비활성화
  export let disabled = false;
  
  // 로딩 상태
  export let loading = false;
  
  // 아이콘 (선택사항)
  export let icon: string | null = null;
  
  // 아이콘 위치
  export let iconPosition: 'left' | 'right' = 'left';
  
  // 추가 클래스
  export let className = '';
  
  // 버튼 스타일 클래스 계산
  $: variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    info: 'bg-blue-400 hover:bg-blue-500 text-white focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800',
    link: 'bg-transparent hover:bg-gray-100 text-blue-600 hover:text-blue-700 focus:ring-blue-300 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-gray-800'
  }[variant];
  
  $: sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl'
  }[size];
  
  $: widthClass = fullWidth ? 'w-full' : '';
  
  // 최종 클래스 계산
  $: buttonClasses = `
    ${variantClasses}
    ${sizeClasses}
    ${widthClass}
    ${className}
    rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
    transition-colors duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
</script>

<button
  {type}
  class={buttonClasses}
  {disabled}
  on:click
  on:focus
  on:blur
  on:mouseenter
  on:mouseleave
>
  {#if loading}
    <span class="inline-block w-4 h-4 mr-2 border-2 border-t-transparent border-white dark:border-gray-200 rounded-full animate-spin"></span>
  {/if}
  
  {#if icon && iconPosition === 'left' && !loading}
    <span class="mr-2">{icon}</span>
  {/if}
  
  <slot />
  
  {#if icon && iconPosition === 'right' && !loading}
    <span class="ml-2">{icon}</span>
  {/if}
</button> 