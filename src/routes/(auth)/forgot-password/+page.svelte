<script lang="ts">
  import { goto } from '$app/navigation';
  
  // 폼 상태
  let email = '';
  let isSubmitting = false;
  let formError = '';
  let formSuccess = '';
  
  // 비밀번호 찾기 처리
  async function handleSubmit() {
    // 폼 유효성 검사
    if (!email) {
      formError = '이메일을 입력해주세요.';
      return;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formError = '유효한 이메일 주소를 입력해주세요.';
      return;
    }
    
    formError = '';
    formSuccess = '';
    isSubmitting = true;
    
    try {
      // 여기에 실제 비밀번호 찾기 API 호출 코드가 들어갈 예정
      // 현재는 임시로 성공 메시지만 표시
      
      // 임시 지연 (실제 API 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      formSuccess = '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.';
    } catch (error) {
      console.error('비밀번호 찾기 처리 중 오류:', error);
      formError = error instanceof Error ? error.message : '비밀번호 찾기 중 오류가 발생했습니다.';
    } finally {
      isSubmitting = false;
    }
  }
  
  // 로그인 페이지로 이동
  function goToLogin() {
    goto('/login');
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        비밀번호 찾기
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
      </p>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
        <div class="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="example@example.com"
          />
        </div>
      </div>

      {#if formError}
        <div class="text-red-500 text-sm">{formError}</div>
      {/if}
      
      {#if formSuccess}
        <div class="text-green-500 text-sm">{formSuccess}</div>
      {/if}

      <div class="flex items-center justify-between">
        <button
          type="button"
          on:click={goToLogin}
          class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          로그인 페이지로 돌아가기
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {#if isSubmitting}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            처리 중...
          {:else}
            비밀번호 재설정 링크 받기
          {/if}
        </button>
      </div>
    </form>
  </div>
</div> 