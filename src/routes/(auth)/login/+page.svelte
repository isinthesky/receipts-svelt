<script lang="ts">
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import axios from 'axios';

  // 폼 상태
  let username = '';
  let password = '';
  let rememberMe = false;
  let isSubmitting = false;
  let formError = '';

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  onMount(() => {
    console.log('onMount');
    
    const unsubscribe = isAuthenticated.subscribe(value => {
      if (value) {
        goto('/dashboard');
      }
    });

    return unsubscribe;
  });

  // 로그인 처리
  async function handleSubmit() {
    console.log('handleSubmit 시작:', username, password);

    // 폼 유효성 검사
    if (!username) {
      formError = '아이디를 입력해주세요.';
      return;
    }

    if (!password) {
      formError = '비밀번호를 입력해주세요.';
      return;
    }

    formError = '';
    isSubmitting = true;

    try {
      console.log('authStore.login 호출 직전:', username, password);
      const success = await authStore.login(username, password);
      console.log('로그인 결과:', success);
      
      if (success) {
        // 약간의 지연 후 대시보드로 이동 (상태 업데이트 시간 확보)
        setTimeout(() => {
          goto('/dashboard');
        }, 100);
      } else {
        // 스토어에서 오류 메시지 가져오기
        const unsubscribe = authStore.subscribe(state => {
          formError = state.error || '로그인에 실패했습니다.';
        });
        unsubscribe();
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      formError = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        로그인
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        계정이 없으신가요?
        <a href="/register" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          회원가입
        </a>
      </p>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">아이디</label>
          <input
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            bind:value={username}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="아이디"
          />
        </div>
        <div>
          <label for="password" class="sr-only">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={password}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="비밀번호"
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            bind:checked={rememberMe}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            로그인 상태 유지
          </label>
        </div>

        <div class="text-sm">
          <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            비밀번호를 잊으셨나요?
          </a>
        </div>
      </div>

      {#if formError}
        <div class="text-red-500 text-sm text-center">{formError}</div>
      {/if}

      {#if $authStore.loading}
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">로그인 중...</span>
        </div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={isSubmitting || $authStore.loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          로그인
        </button>
      </div>
    </form>
  </div>
</div> 