<script lang="ts">
  export let variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' = 'p';
  export let color: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'default' = 'default';
  export let align: 'left' | 'center' | 'right' = 'left';
  export let marginBottom: string = '0';
  export let marginTop: string = '0';
  
  // 색상 클래스
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    error: 'text-error',
    success: 'text-success',
    warning: 'text-warning',
    default: 'text-default'
  };
  
  // 정렬 클래스
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
</script>

{#if variant === 'h1'}
  <h1 class="typography h1 {colorClasses[color]} {alignClasses[align]}" style="margin-bottom: {marginBottom}; margin-top: {marginTop}">
    <slot />
  </h1>
{:else if variant === 'h2'}
  <h2 class="typography h2 {colorClasses[color]} {alignClasses[align]}" style="margin-bottom: {marginBottom}; margin-top: {marginTop}">
    <slot />
  </h2>
{:else if variant === 'h3'}
  <h3 class="typography h3 {colorClasses[color]} {alignClasses[align]}" style="margin-bottom: {marginBottom}; margin-top: {marginTop}">
    <slot />
  </h3>
{:else if variant === 'h4'}
  <h4 class="typography h4 {colorClasses[color]} {alignClasses[align]}" style="margin-bottom: {marginBottom}; margin-top: {marginTop}">
    <slot />
  </h4>
{:else if variant === 'h5'}
  <h5 class="typography h5 {colorClasses[color]} {alignClasses[align]}" style="margin-bottom: {marginBottom}; margin-top: {marginTop}">
    <slot />
  </h5>
{:else if variant === 'h6'}
  <h6 class="typography h6 {colorClasses[color]} {alignClasses[align]}" style="margin-bottom: {marginBottom}; margin-top: {marginTop}">
    <slot />
  </h6>
{:else if variant === 'span'}
  <span class="typography span {colorClasses[color]} {alignClasses[align]}" style="margin-bottom: {marginBottom}; margin-top: {marginTop}">
    <slot />
  </span>
{:else}
  <p class="typography p {colorClasses[color]} {alignClasses[align]}" style="margin-bottom: {marginBottom}; margin-top: {marginTop}">
    <slot />
  </p>
{/if}

<style>
  .typography {
    margin: 0;
  }
  
  .h1 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
  }
  
  .h2 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
  }
  
  .h3 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
  }
  
  .h4 {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
  }
  
  .h5 {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
  }
  
  .h6 {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.5;
  }
  
  .p {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .span {
    font-size: inherit;
    line-height: inherit;
  }
  
  .text-primary {
    color: var(--color-text-primary);
  }
  
  .text-secondary {
    color: var(--color-text-secondary);
  }
  
  .text-error {
    color: #ef4444;
  }
  
  .text-success {
    color: #10b981;
  }
  
  .text-warning {
    color: #f59e0b;
  }
  
  .text-default {
    color: inherit;
  }
  
  .text-left {
    text-align: left;
  }
  
  .text-center {
    text-align: center;
  }
  
  .text-right {
    text-align: right;
  }
</style> 