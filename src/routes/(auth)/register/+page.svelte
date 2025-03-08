<script lang="ts">
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // 폼 상태
  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let isSubmitting = false;
  let formError = '';

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  onMount(() => {
    const unsubscribe = isAuthenticated.subscribe(value => {
      if (value) {
        goto('/dashboard');
      }
    });

    return unsubscribe;
  });

  // 회원가입 처리
  async function handleSubmit() {
    // 폼 유효성 검사
    if (!name) {
      formError = '이름을 입력해주세요.';
      return;
    }

    if (!email) {
      formError = '이메일을 입력해주세요.';
      return;
    }

    if (!password) {
      formError = '비밀번호를 입력해주세요.';
      return;
    }

    if (password.length < 6) {
      formError = '비밀번호는 최소 6자 이상이어야 합니다.';
      return;
    }

    if (password !== confirmPassword) {
      formError = '비밀번호가 일치하지 않습니다.';
      return;
    }

    formError = '';
    isSubmitting = true;

    try {
      const success = await authStore.register({
        name,
        email,
        password
      });
      
      if (success) {
        goto('/dashboard');
      } else {
        // 스토어에서 오류 메시지 가져오기
        authStore.subscribe(state => {
          formError = state.error || '회원가입에 실패했습니다.';
        })();
      }
    } catch (error) {
      formError = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        회원가입
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        이미 계정이 있으신가요?
        <a href="/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          로그인
        </a>
      </p>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="name" class="sr-only">이름</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            bind:value={name}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="이름"
          />
        </div>
        <div>
          <label for="email-address" class="sr-only">이메일</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="이메일"
          />
        </div>
        <div>
          <label for="password" class="sr-only">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            bind:value={password}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="비밀번호 (6자 이상)"
          />
        </div>
        <div>
          <label for="confirm-password" class="sr-only">비밀번호 확인</label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autocomplete="new-password"
            required
            bind:value={confirmPassword}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="비밀번호 확인"
          />
        </div>
      </div>

      {#if formError}
        <div class="text-red-500 text-sm text-center">{formError}</div>
      {/if}

      {#if $authStore.loading}
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">회원가입 중...</span>
        </div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={isSubmitting || $authStore.loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          회원가입
        </button>
      </div>
    </form>
  </div>
</div> 