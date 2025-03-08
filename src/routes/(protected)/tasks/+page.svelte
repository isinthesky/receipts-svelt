<script lang="ts">
  import { onMount } from 'svelte';
  import { taskStore } from '$lib/stores/tasks';
  import { authStore, isAuthenticated, getToken } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import type { Task } from '$lib/types/task.types';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';

  let searchTerm = '';
  let sortBy = 'task_name';
  let sortOrder = 'asc';
  let stateFilter = 'all'; // all, active, hidden, disabled
  let isLoading = true;

  $: filteredTasks = filterTasks($taskStore.tasks);
  $: sortedTasks = sortTasks(filteredTasks);

  function filterTasks(tasks: Task[]): Task[] {
    return tasks.filter(task => {
      // 검색어 필터링
      const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 상태 필터링
      let matchesState = true;
      if (stateFilter === 'active') matchesState = task.state === 1;
      if (stateFilter === 'hidden') matchesState = task.state === 2;
      if (stateFilter === 'disabled') matchesState = task.state === 0;
      
      return matchesSearch && matchesState;
    });
  }

  function sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortBy as keyof Task];
      let bValue = b[sortBy as keyof Task];
      
      // null 값 처리
      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';
      
      // 문자열 비교
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // 숫자 비교
      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });
  }

  function handleSort(field: string) {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'asc';
    }
  }

  function getStateLabel(state: number): string {
    switch (state) {
      case 1: return '활성';
      case 2: return '숨김';
      case 0: return '비활성';
      default: return '알 수 없음';
    }
  }

  function getStateClass(state: number): string {
    switch (state) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 0: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // 인증 상태 확인 및 사용자 정보 로드
  async function checkAuth() {
    isLoading = true;
    
    // 인증 상태 확인
    if (!$isAuthenticated) {
      // 토큰이 있지만 사용자 정보가 없는 경우 사용자 정보 가져오기 시도
      if (getToken()) {
        const success = await authStore.fetchUser();
        if (!success) {
          // 사용자 정보 가져오기 실패 시 로그인 페이지로 이동
          goto('/login');
          return;
        }
      } else {
        // 토큰이 없는 경우 로그인 페이지로 이동
        goto('/login');
        return;
      }
    }
    
    // 태스크 로드
    await taskStore.loadTasks();
    isLoading = false;
  }

  onMount(() => {
    checkAuth();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">태스크 목록</h1>
    <Button href="/tasks/new">새 태스크 생성</Button>
  </div>

  <!-- 검색 및 필터 -->
  <div class="bg-white rounded-lg shadow p-4 mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">검색</label>
        <input
          type="text"
          id="search"
          bind:value={searchTerm}
          placeholder="태스크 이름 또는 설명 검색..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label for="stateFilter" class="block text-sm font-medium text-gray-700 mb-1">상태 필터</label>
        <select
          id="stateFilter"
          bind:value={stateFilter}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">모든 상태</option>
          <option value="active">활성</option>
          <option value="hidden">숨김</option>
          <option value="disabled">비활성</option>
        </select>
      </div>
      <div>
        <label for="sortBy" class="block text-sm font-medium text-gray-700 mb-1">정렬 기준</label>
        <select
          id="sortBy"
          bind:value={sortBy}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="task_name">태스크 이름</option>
          <option value="created_at">생성일</option>
          <option value="due_date">마감일</option>
          <option value="state">상태</option>
        </select>
      </div>
      <div>
        <label for="sortOrder" class="block text-sm font-medium text-gray-700 mb-1">정렬 방향</label>
        <select
          id="sortOrder"
          bind:value={sortOrder}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="asc">오름차순</option>
          <option value="desc">내림차순</option>
        </select>
      </div>
    </div>
  </div>

  <!-- 로딩 상태 -->
  {#if isLoading || $taskStore.loading}
    <Loading />
  <!-- 오류 상태 -->
  {:else if $taskStore.error}
    <Alert type="error" message={$taskStore.error} />
  <!-- 데이터 없음 -->
  {:else if sortedTasks.length === 0}
    <div class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-500">태스크가 없습니다. 새 태스크를 생성해보세요.</p>
    </div>
  <!-- 태스크 목록 -->
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each sortedTasks as task (task.id)}
        <Card>
          <div class="p-4">
            <div class="flex justify-between items-start">
              <h2 class="text-xl font-semibold mb-2">{task.task_name}</h2>
              <span class={`px-2 py-1 text-xs font-semibold rounded-full ${getStateClass(task.state)}`}>
                {getStateLabel(task.state)}
              </span>
            </div>
            
            {#if task.description}
              <p class="text-gray-600 mb-4">{task.description}</p>
            {/if}
            
            {#if task.due_date}
              <p class="text-sm text-gray-500 mb-4">마감일: {new Date(task.due_date).toLocaleDateString()}</p>
            {/if}
            
            <div class="flex justify-between items-center mt-4">
              <span class="text-xs text-gray-500">생성일: {new Date(task.created_at).toLocaleDateString()}</span>
              <div class="flex space-x-2">
                <Button href={`/tasks/${task.id}`} variant="outline" size="sm">상세</Button>
                <Button href={`/tasks/${task.id}/edit`} variant="outline" size="sm">편집</Button>
              </div>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div> 