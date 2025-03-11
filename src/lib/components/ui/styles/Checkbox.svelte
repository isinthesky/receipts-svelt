<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    change: { checked: boolean };
  }>();
  
  // 체크박스 속성
  export let id = '';
  export let name = '';
  export let label = '';
  export let checked = false;
  export let disabled = false;
  export let required = false;
  export let error = '';
  export let helpText = '';
  export let className = '';
  
  // 상태 클래스 계산
  $: stateClass = error 
    ? 'border-red-500 focus:ring-red-500 dark:border-red-600 dark:focus:ring-red-600' 
    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-500';
  
  // 최종 클래스 계산
  $: checkboxClasses = `
    ${stateClass}
    ${className}
    h-4 w-4
    text-blue-600 dark:text-blue-500
    bg-white dark:bg-gray-800
    rounded
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `;
  
  // 이벤트 핸들러
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    dispatch('change', { checked });
  }
</script>

<div class="flex items-start mb-2">
  <div class="flex items-center h-5">
    <input
      type="checkbox"
      {id}
      {name}
      bind:checked
      {disabled}
      {required}
      class={checkboxClasses}
      on:change={handleChange}
    />
  </div>
  
  {#if label}
    <div class="ml-2 text-sm">
      <label 
        for={id} 
        class="font-medium text-gray-700 dark:text-gray-300 {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
      >
        {label}
        {#if required}
          <span class="text-red-500">*</span>
        {/if}
      </label>
      
      {#if error}
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      {:else if helpText}
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      {/if}
    </div>
  {/if}
</div> 