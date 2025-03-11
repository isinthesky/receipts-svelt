<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { createEventDispatcher } from 'svelte';
  
  interface $$Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark' | 'outline' | 'link' | 'ghost';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
  }
  
  export let variant: $$Props['variant'] = 'primary';
  export let size: $$Props['size'] = 'md';
  export let fullWidth = false;
  export let loading = false;
  export let disabled = false;
  export let className = '';
  
  const dispatch = createEventDispatcher();
  
  $: classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth && 'button--full-width',
    loading && 'button--loading',
    className
  ].filter(Boolean).join(' ');
</script>

<button
  class={classes}
  {disabled}
  on:click
  on:mouseover
  on:mouseenter
  on:mouseleave
  on:focus
  on:blur
  {...$$restProps}
>
  {#if loading}
    <span class="button__spinner" />
  {/if}
  <slot />
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-md);
    transition: all 0.2s;
    cursor: pointer;
    border: 1px solid transparent;
  }
  
  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Sizes */
  .button--xs {
    padding: 0.25rem 0.5rem;
    font-size: var(--font-size-xs);
  }
  
  .button--sm {
    padding: 0.375rem 0.75rem;
    font-size: var(--font-size-sm);
  }
  
  .button--md {
    padding: 0.5rem 1rem;
    font-size: var(--font-size-md);
  }
  
  .button--lg {
    padding: 0.75rem 1.5rem;
    font-size: var(--font-size-lg);
  }
  
  .button--xl {
    padding: 1rem 2rem;
    font-size: var(--font-size-xl);
  }
  
  .button--icon {
    padding: 0.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
  
  /* Variants */
  .button--primary {
    background-color: var(--color-primary);
    color: white;
  }
  
  .button--primary:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }
  
  .button--secondary {
    background-color: var(--color-secondary);
    color: white;
  }
  
  .button--secondary:hover:not(:disabled) {
    background-color: var(--color-secondary-dark);
  }
  
  .button--danger {
    background-color: var(--color-error);
    color: white;
  }
  
  .button--danger:hover:not(:disabled) {
    background-color: var(--color-error-dark);
  }
  
  .button--success {
    background-color: var(--color-success);
    color: white;
  }
  
  .button--success:hover:not(:disabled) {
    background-color: var(--color-success-dark);
  }
  
  .button--warning {
    background-color: var(--color-warning);
    color: var(--color-text-dark);
  }
  
  .button--warning:hover:not(:disabled) {
    background-color: var(--color-warning-dark);
  }
  
  .button--info {
    background-color: var(--color-info);
    color: white;
  }
  
  .button--info:hover:not(:disabled) {
    background-color: var(--color-info-dark);
  }
  
  .button--light {
    background-color: var(--color-light);
    color: var(--color-text-dark);
  }
  
  .button--light:hover:not(:disabled) {
    background-color: var(--color-light-dark);
  }
  
  .button--dark {
    background-color: var(--color-dark);
    color: white;
  }
  
  .button--dark:hover:not(:disabled) {
    background-color: var(--color-dark-light);
  }
  
  .button--outline {
    background-color: transparent;
    border-color: var(--color-border);
    color: var(--color-text-primary);
  }
  
  .button--outline:hover:not(:disabled) {
    background-color: var(--color-main-bg);
  }
  
  .button--link {
    background-color: transparent;
    color: var(--color-primary);
    padding: 0;
  }
  
  .button--link:hover:not(:disabled) {
    text-decoration: underline;
  }
  
  .button--ghost {
    background-color: transparent;
    color: var(--color-text-primary);
  }
  
  .button--ghost:hover:not(:disabled) {
    background-color: var(--color-main-bg);
  }
  
  .button--full-width {
    width: 100%;
  }
  
  .button--loading {
    position: relative;
    color: transparent;
  }
  
  .button__spinner {
    position: absolute;
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-radius: 50%;
    border-right-color: transparent;
    animation: spin 0.75s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style> 