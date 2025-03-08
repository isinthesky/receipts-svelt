<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    input: { value: string };
    change: { value: string };
    focus: FocusEvent;
    blur: FocusEvent;
  }>();
  
  // 입력 필드 타입
  export let type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' = 'text';
  
  // 입력 필드 값
  export let value = '';
  
  // 입력 필드 ID
  export let id = '';
  
  // 입력 필드 이름
  export let name = '';
  
  // 입력 필드 레이블
  export let label = '';
  
  // 입력 필드 플레이스홀더
  export let placeholder = '';
  
  // 입력 필드 도움말 텍스트
  export let helpText = '';
  
  // 입력 필드 오류 메시지
  export let error = '';
  
  // 입력 필드 비활성화
  export let disabled = false;
  
  // 입력 필드 읽기 전용
  export let readonly = false;
  
  // 입력 필드 필수 여부
  export let required = false;
  
  // 입력 필드 자동 완성
  export let autocomplete: string = '';
  
  // 입력 필드 최대 길이
  export let maxlength: number | undefined = undefined;
  
  // 입력 필드 최소 길이
  export let minlength: number | undefined = undefined;
  
  // 입력 필드 패턴
  export let pattern: string | undefined = undefined;
  
  // 입력 필드 크기
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  // 입력 필드 전체 너비
  export let fullWidth = true;
  
  // 입력 필드 아이콘 (선택사항)
  export let icon: string | null = null;
  
  // 아이콘 위치
  export let iconPosition: 'left' | 'right' = 'left';
  
  // 추가 클래스
  export let className = '';
  
  // 입력 필드 크기 클래스 계산
  $: sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg'
  }[size];
  
  // 아이콘 패딩 클래스 계산
  $: iconPaddingClass = icon 
    ? iconPosition === 'left' 
      ? 'pl-10' 
      : 'pr-10'
    : '';
  
  // 너비 클래스 계산
  $: widthClass = fullWidth ? 'w-full' : '';
  
  // 상태 클래스 계산
  $: stateClass = error 
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:focus:ring-red-600 dark:focus:border-red-600' 
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500';
  
  // 최종 클래스 계산
  $: inputClasses = `
    ${sizeClasses}
    ${iconPaddingClass}
    ${widthClass}
    ${stateClass}
    ${className}
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-white
    rounded-md
    shadow-sm
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `;
  
  // 이벤트 핸들러
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('input', { value });
  }
  
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('change', { value });
  }
  
  function handleFocus(event: FocusEvent) {
    dispatch('focus', event);
  }
  
  function handleBlur(event: FocusEvent) {
    dispatch('blur', event);
  }
</script>

<div class="mb-4 {widthClass}">
  {#if label}
    <label 
      for={id} 
      class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <div class="relative">
    {#if icon && iconPosition === 'left'}
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
        {icon}
      </div>
    {/if}
    
    <input
      {type}
      {id}
      {name}
      bind:value
      {placeholder}
      {disabled}
      {readonly}
      {required}
      {autocomplete}
      {maxlength}
      {minlength}
      {pattern}
      class={inputClasses}
      on:input={handleInput}
      on:change={handleChange}
      on:focus={handleFocus}
      on:blur={handleBlur}
    />
    
    {#if icon && iconPosition === 'right'}
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
        {icon}
      </div>
    {/if}
  </div>
  
  {#if error}
    <p class="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
  {:else if helpText}
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
  {/if}
</div> 