<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
  <div class="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
    <h1 class="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">receipts 프로젝트</h1>
    
    <div class="space-y-4">
      <p class="text-gray-600 dark:text-gray-300">
        Svelte와 SvelteKit을 사용한 보고서 관리 시스템입니다.
      </p>
      
      <div class="flex justify-center space-x-4">
        <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded" on:click={() => appStore.toggleDarkMode()}>다크모드 토글</button>
      </div>
      
      <div class="mt-8 flex flex-col space-y-4">
        {#if $isAuthenticated}
          <a href="/receipts" class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-center">영수증 목록으로 이동</a>
          <button class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded" on:click={() => authStore.logout()}>로그아웃</button>
        {:else}
          <a href="/login" class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-center">로그인</a>
          <a href="/register" class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-center">회원가입</a>
        {/if}
      </div>
      
      {#if $authStore.user}
        <div class="mt-4 p-4 border rounded dark:border-gray-700">
          <h2 class="font-semibold mb-2 dark:text-white">로그인 정보:</h2>
          <p class="text-sm dark:text-gray-300">{$authStore.user.name || $authStore.user.email}님 환영합니다!</p>
        </div>
      {/if}
    </div>
  </div>
</div>
