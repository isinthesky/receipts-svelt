<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import HeroCard from '$lib/components/ui/HeroCard.svelte';
</script>

<HeroCard />

<style>
  .hero-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }
  
  .hero-card {
    max-width: 28rem;
    width: 100%;
    background-color: var(--color-content-bg);
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px var(--color-shadow), 0 2px 4px -1px var(--color-shadow);
    border: 1px solid var(--color-border);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .hero-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-border);
    background: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  }
  
  .hero-title {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    color: var(--color-text-primary);
  }
  
  .hero-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .hero-description {
    color: var(--color-text-secondary);
    text-align: center;
  }
  
  .theme-toggle-container {
    display: flex;
    justify-content: center;
  }
  
  .theme-toggle-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    background-color: var(--color-main-bg);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    transition: all 0.2s;
    cursor: pointer;
  }
  
  .theme-toggle-button:hover {
    background-color: var(--color-border);
  }
  
  .ml-2 {
    margin-left: 0.5rem;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    color: white;
    text-decoration: none;
    gap: 0.5rem;
  }
  
  .receipts-button {
    background-color: #10b981;
  }
  
  .receipts-button:hover {
    background-color: #059669;
  }
  
  .tasks-button {
    background-color: #3b82f6;
  }
  
  .tasks-button:hover {
    background-color: #2563eb;
  }
  
  .logout-button {
    background-color: #ef4444;
  }
  
  .logout-button:hover {
    background-color: #dc2626;
  }
  
  .login-button {
    background-color: #3b82f6;
  }
  
  .login-button:hover {
    background-color: #2563eb;
  }
  
  .register-button {
    background-color: #10b981;
  }
  
  .register-button:hover {
    background-color: #059669;
  }
  
  .user-info {
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    background-color: var(--color-main-bg);
  }
  
  .user-info-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
  }
  
  .user-info-text {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
</style>
