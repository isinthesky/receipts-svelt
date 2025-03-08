<script lang="ts">
  // 카드 제목
  export let title = '';
  
  // 카드 부제목
  export let subtitle = '';
  
  // 카드 푸터 표시 여부
  export let showFooter = false;
  
  // 카드 헤더 표시 여부
  export let showHeader = true;
  
  // 카드 패딩 여부
  export let padding = true;
  
  // 카드 그림자 크기
  export let shadow = true;
  
  // 카드 둥근 모서리 크기
  export let rounded = true;
  
  // 카드 테두리 표시 여부
  export let border = true;
  
  // 카드 호버 효과
  export let hover = false;
  
  // 추가 클래스
  export let className = '';
  
  // 그림자 클래스 계산
  $: shadowClass = shadow ? 'shadow-md' : '';
  
  // 둥근 모서리 클래스 계산
  $: roundedClass = rounded ? 'rounded-lg' : '';
  
  // 테두리 클래스 계산
  $: borderClass = border ? 'border border-gray-200 dark:border-gray-700' : '';
  
  // 호버 클래스 계산
  $: hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';
  
  // 최종 클래스 계산
  $: cardClasses = `
    ${shadowClass}
    ${roundedClass}
    ${borderClass}
    ${hoverClass}
    ${className}
    bg-white dark:bg-gray-800
    overflow-hidden
    {padding ? 'p-0' : ''}
  `;
  
  // 패딩 클래스 계산
  $: contentClasses = padding ? 'p-4' : '';
</script>

<div class={cardClasses}>
  {#if showHeader && (title || subtitle || $$slots.header)}
    <div class="px-4 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
      {#if $$slots.header}
        <slot name="header" />
      {:else}
        {#if title}
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        {/if}
        {#if subtitle}
          <p class="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        {/if}
      {/if}
    </div>
  {/if}
  
  <div class={contentClasses}>
    <slot />
  </div>
  
  {#if showFooter || $$slots.footer}
    <div class="px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
      <slot name="footer">
        <!-- 기본 푸터 내용 -->
      </slot>
    </div>
  {/if}
</div> 