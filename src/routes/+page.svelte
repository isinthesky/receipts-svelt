<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
</script>

<div class="hero-container">
  <div class="hero-card">
    <div class="hero-header">
      <h1 class="hero-title">Receipts App</h1>
    </div>
    
    <div class="hero-content">
      <p class="hero-description">
        Svelte와 SvelteKit을 사용한 보고서 관리 시스템입니다.
      </p>
      
      <div class="theme-toggle-container">
        <button 
          class="theme-toggle-button"
          on:click={() => appStore.toggleDarkMode()}
        >
          {#if $appStore.darkMode}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <span class="ml-2">라이트 모드로 전환</span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <span class="ml-2">다크 모드로 전환</span>
          {/if}
        </button>
      </div>
      
      <div class="action-buttons">
        {#if $isAuthenticated}
          <a href="/receipts" class="action-button receipts-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>영수증 목록으로 이동</span>
          </a>
          <a href="/tasks" class="action-button tasks-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>태스크 목록으로 이동</span>
          </a>
          <button class="action-button logout-button" on:click={() => authStore.logout()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>로그아웃</span>
          </button>
        {:else}
          <a href="/login" class="action-button login-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>로그인</span>
          </a>
          <a href="/register" class="action-button register-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>회원가입</span>
          </a>
        {/if}
      </div>
      
      {#if $authStore.user}
        <div class="user-info">
          <h2 class="user-info-title">로그인 정보:</h2>
          <p class="user-info-text">{$authStore.user.name || $authStore.user.email}님 환영합니다!</p>
        </div>
      {/if}
    </div>
  </div>
</div>

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
