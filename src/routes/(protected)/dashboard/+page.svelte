<script lang="ts">
  import { authStore } from '$lib/stores/auth';
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
  <div class="py-10">
    <header>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
          대시보드
        </h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="px-4 py-8 sm:px-0">
          <div class="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
            {#if $authStore.loading}
              <div class="flex justify-center items-center h-32">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span class="ml-2 text-gray-600 dark:text-gray-400">로딩 중...</span>
              </div>
            {:else if $authStore.user}
              <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    사용자 정보
                  </h3>
                  <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    로그인한 사용자의 기본 정보입니다.
                  </p>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700">
                  <dl>
                    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        이름
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {$authStore.user.name || '이름 없음'}
                      </dd>
                    </div>
                    <div class="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        이메일
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {$authStore.user.email}
                      </dd>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        ID
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                        {$authStore.user.id}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end">
                <button
                  on:click={() => authStore.logout()}
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  로그아웃
                </button>
              </div>
            {:else}
              <div class="text-center py-10">
                <p class="text-red-500">사용자 정보를 불러올 수 없습니다.</p>
                <button
                  on:click={() => authStore.logout()}
                  class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  로그인 페이지로 이동
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </main>
  </div>
</div> 