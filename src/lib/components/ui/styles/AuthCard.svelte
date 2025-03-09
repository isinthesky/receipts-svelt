<script lang="ts">
  export let title: string;
  export let subtitle: string = '';
  export let subtitleLink: string = '';
  export let subtitleLinkText: string = '';
</script>

<div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <h2 class="auth-title">{title}</h2>
      {#if subtitle}
        <p class="auth-subtitle">
          {subtitle}
          {#if subtitleLink && subtitleLinkText}
            <a href={subtitleLink} class="auth-link">{subtitleLinkText}</a>
          {/if}
        </p>
      {/if}
    </div>
    
    <div class="auth-content">
      <slot />
    </div>
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  
  .auth-card {
    width: 100%;
    max-width: 28rem;
    background-color: var(--color-content-bg);
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px var(--color-shadow), 0 2px 4px -1px var(--color-shadow);
    border: 1px solid var(--color-border);
    overflow: hidden;
  }
  
  .auth-header {
    padding: 1.5rem;
    text-align: center;
  }
  
  .auth-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }
  
  .auth-subtitle {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
  
  .auth-link {
    color: #3b82f6;
    font-weight: 500;
    text-decoration: none;
  }
  
  .auth-link:hover {
    text-decoration: underline;
  }
  
  .auth-content {
    padding: 0 1.5rem 1.5rem;
  }
</style> 