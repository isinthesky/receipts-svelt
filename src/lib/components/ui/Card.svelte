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
  
  // 카드 그림자 크기 (flat 스타일에서는 기본값을 false로 변경)
  export let shadow = false;
  
  // 카드 둥근 모서리 크기 (flat 스타일에서는 더 작은 값 사용)
  export let rounded = true;
  
  // 카드 테두리 표시 여부
  export let border = true;
  
  // 카드 호버 효과
  export let hover = false;
  
  // 추가 클래스
  export let className = '';
  
  // flat 스타일 적용 여부
  export let flat = true;
  
  // 그림자 클래스 계산 (flat 스타일에서는 더 작은 그림자 또는 없음)
  $: shadowClass = shadow ? (flat ? 'shadow-sm' : 'shadow-md') : '';
  
  // 둥근 모서리 클래스 계산 (flat 스타일에서는 더 작은 값)
  $: roundedClass = rounded ? (flat ? 'rounded-md' : 'rounded-lg') : '';
  
  // 테두리 클래스 계산 (flat 스타일에서는 더 얇은 테두리)
  $: borderClass = border ? (flat ? 'border border-gray-100 dark:border-gray-800' : 'border border-gray-200 dark:border-gray-700') : '';
  
  // 호버 클래스 계산 (flat 스타일에서는 더 미묘한 효과)
  $: hoverClass = hover ? (flat ? 'hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200' : 'hover:shadow-lg transition-shadow duration-300') : '';
  
  // 최종 클래스 계산
  $: cardClasses = `
    ${shadowClass}
    ${roundedClass}
    ${borderClass}
    ${hoverClass}
    ${className}
    ${flat ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}
    overflow-hidden
    {padding ? 'p-0' : ''}
  `;
  
  // 패딩 클래스 계산
  $: contentClasses = padding ? 'p-4' : '';
  
  // 헤더와 푸터 배경 클래스 계산
  $: headerFooterClass = flat ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700';
</script>

<div class={cardClasses}>
  {#if showHeader && (title || subtitle || $$slots.header)}
    <div class={`px-4 py-3 border-b ${headerFooterClass}`}>
      {#if $$slots.header}
        <slot name="header" />
      {:else}
        {#if title}
          <h3 class={`text-lg font-medium ${flat ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
        {/if}
        {#if subtitle}
          <p class={`text-sm ${flat ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>{subtitle}</p>
        {/if}
      {/if}
    </div>
  {/if}
  
  <div class={contentClasses}>
    <slot />
  </div>
  
  {#if showFooter || $$slots.footer}
    <div class={`px-4 py-3 border-t ${headerFooterClass}`}>
      <slot name="footer">
        <!-- 기본 푸터 내용 -->
      </slot>
    </div>
  {/if}
</div> 