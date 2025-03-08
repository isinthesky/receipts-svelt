<script lang="ts">
  // 버튼 타입
  export let type: 'button' | 'submit' | 'reset' = 'button';
  
  // 버튼 변형
  export let variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark' | 'link' | 'outline' = 'primary';
  
  // 버튼 크기
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  // 버튼 전체 너비
  export let fullWidth = false;
  
  // 버튼 비활성화
  export let disabled = false;
  
  // 링크 URL (버튼을 링크로 사용할 경우)
  export let href: string | undefined = undefined;
  
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
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-cyan-500 hover:bg-cyan-600 text-white',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white',
    link: 'bg-transparent hover:underline text-blue-600',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700'
  }[variant];
  
  $: sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl'
  }[size];
  
  $: widthClass = fullWidth ? 'w-full' : '';
  
  // 최종 클래스 계산
  $: buttonClasses = `inline-flex items-center justify-center font-medium rounded-md transition-colors ${variantClasses} ${sizeClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`;
</script>

{#if href !== undefined}
  <a href={href} class={buttonClasses} role="button" aria-disabled={disabled}>
    <slot />
  </a>
{:else}
  <button {type} class={buttonClasses} {disabled} on:click>
    <slot />
  </button>
{/if} 