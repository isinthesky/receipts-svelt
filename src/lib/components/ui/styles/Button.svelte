<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let fullWidth: boolean = false;
  export let disabled: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  
  // 버튼 색상 클래스
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white'
  };
  
  // 버튼 크기 클래스
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  };
  
  // 버튼 너비 클래스
  const widthClass = fullWidth ? 'w-full' : '';
</script>

<button
  {type}
  class="button {variantClasses[variant]} {sizeClasses[size]} {widthClass}"
  disabled={disabled}
  on:click
>
  <slot />
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
    border: none;
    cursor: pointer;
  }
  
  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 색상 변수 */
  :global(.bg-blue-600) { background-color: #3b82f6; }
  :global(.hover\:bg-blue-700:hover) { background-color: #2563eb; }
  :global(.bg-gray-200) { background-color: #e5e7eb; }
  :global(.hover\:bg-gray-300:hover) { background-color: #d1d5db; }
  :global(.bg-red-600) { background-color: #ef4444; }
  :global(.hover\:bg-red-700:hover) { background-color: #dc2626; }
  :global(.bg-green-600) { background-color: #10b981; }
  :global(.hover\:bg-green-700:hover) { background-color: #059669; }
  :global(.bg-yellow-500) { background-color: #f59e0b; }
  :global(.hover\:bg-yellow-600:hover) { background-color: #d97706; }
  :global(.text-white) { color: white; }
  :global(.text-gray-800) { color: #1f2937; }
  :global(.w-full) { width: 100%; }
</style> 