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

  // 상태 관리
  let tasks: Task[] = [];
  let filteredTasks: Task[] = [];
  let loading = true;
  let error: string | null = null;
  let searchQuery = '';
  let statusFilter: number | null = null;
  let sortBy: 'taskName' | 'createdAt' | 'dueDate' = 'createdAt';
  let sortOrder: 'asc' | 'desc' = 'desc';
  let viewMode: 'table' | 'card' = 'table';

  // 페이지네이션
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  let paginatedTasks: Task[] = [];

  // 태스크 로드 함수
  async function loadTasks() {
    loading = true;
    error = null;
    
    try {
      await taskStore.loadTasks();
      tasks = $taskStore.tasks;
      applyFiltersAndSort();
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크를 불러오는데 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  // 필터링 및 정렬 적용 함수
  function applyFiltersAndSort() {
    // 검색어 필터링
    let result = [...tasks];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.taskName.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // 상태 필터링
    if (statusFilter !== null) {
      result = result.filter(task => task.state === statusFilter);
    }
    
    // 정렬
    result.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      // null 값 처리
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue === null) return sortOrder === 'asc' ? -1 : 1;
      
      // 문자열 비교
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // 날짜 비교
      if (sortBy === 'createdAt' || sortBy === 'dueDate') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      return 0;
    });
    
    filteredTasks = result;
    updatePagination();
  }

  // 페이지네이션 업데이트 함수
  function updatePagination() {
    totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    
    // 현재 페이지가 유효한지 확인
    if (currentPage > totalPages) {
      currentPage = totalPages > 0 ? totalPages : 1;
    }
    
    // 현재 페이지에 해당하는 태스크 추출
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedTasks = filteredTasks.slice(startIndex, endIndex);
  }

  // 페이지 변경 핸들러
  function handlePageChange(page: number) {
    currentPage = page;
    updatePagination();
  }

  // 태스크 상세 페이지로 이동
  function goToTaskDetail(taskId: string) {
    goto(`/tasks/${taskId}`);
  }

  // 태스크 생성 페이지로 이동
  function goToCreateTask() {
    goto('/tasks/new');
  }

  // 상태 텍스트 반환 함수
  function getStatusText(status: number): string {
    switch (status) {
      case 0: return '비활성화';
      case 1: return '활성화';
      case 2: return '숨김';
      default: return '알 수 없음';
    }
  }

  // 상태 클래스 반환 함수
  function getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'status-disabled';
      case 1: return 'status-active';
      case 2: return 'status-hidden';
      default: return '';
    }
  }

  // 날짜 포맷팅 함수
  function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  }

  // 반응형 변수 설정
  $: {
    if (searchQuery !== undefined || statusFilter !== undefined || sortBy || sortOrder) {
      applyFiltersAndSort();
    }
  }

  // 인증 상태 확인 및 사용자 정보 로드
  async function checkAuth() {
    loading = true;
    
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
    await loadTasks();
  }

  // 키보드 이벤트 핸들러 추가
  function handleTaskKeyDown(event: KeyboardEvent, taskId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      goToTaskDetail(taskId);
      event.preventDefault();
    }
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
          bind:value={searchQuery}
          placeholder="태스크 이름 또는 설명 검색..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label for="stateFilter" class="block text-sm font-medium text-gray-700 mb-1">상태 필터</label>
        <select
          id="stateFilter"
          bind:value={statusFilter}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value={null}>모든 상태</option>
          <option value={1}>활성화</option>
          <option value={2}>숨김</option>
          <option value={0}>비활성화</option>
        </select>
      </div>
      <div>
        <label for="sortBy" class="block text-sm font-medium text-gray-700 mb-1">정렬 기준</label>
        <select
          id="sortBy"
          bind:value={sortBy}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="createdAt">생성일</option>
          <option value="taskName">태스크명</option>
          <option value="dueDate">마감일</option>
        </select>
      </div>
      <div>
        <label for="sortOrder" class="block text-sm font-medium text-gray-700 mb-1">정렬 방향</label>
        <select
          id="sortOrder"
          bind:value={sortOrder}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="desc">내림차순</option>
          <option value="asc">오름차순</option>
        </select>
      </div>
    </div>
  </div>

  <!-- 로딩 상태 -->
  {#if loading || $taskStore.loading}
    <Loading />
  <!-- 오류 상태 -->
  {:else if $taskStore.error}
    <Alert type="error" message={$taskStore.error} />
  <!-- 데이터 없음 -->
  {:else if paginatedTasks.length === 0}
    <div class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-500">태스크가 없습니다. 새 태스크를 생성해보세요.</p>
    </div>
  <!-- 태스크 목록 -->
  {:else}
    <div class="tasks-content">
      {#if viewMode === 'table'}
        <!-- 테이블 뷰 -->
        <div class="table-container">
          <table class="tasks-table">
            <thead>
              <tr>
                <th>태스크명</th>
                <th>설명</th>
                <th>생성일</th>
                <th>마감일</th>
                <th>상태</th>
                <th>영수증</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {#each paginatedTasks as task (task.id)}
                <tr on:click={() => goToTaskDetail(task.id)}>
                  <td class="task-name">{task.taskName}</td>
                  <td class="task-description">{task.description || '-'}</td>
                  <td>{formatDate(task.createdAt)}</td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td>
                    <span class={`status-badge ${getStatusClass(task.state)}`}>
                      {getStatusText(task.state)}
                    </span>
                  </td>
                  <td>{task.images ? task.images.length : 0}개</td>
                  <td class="actions">
                    <button class="action-button" on:click|stopPropagation={() => goToTaskDetail(task.id)}>
                      상세
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <!-- 카드 뷰 -->
        <div class="card-grid">
          {#each paginatedTasks as task (task.id)}
            <div 
              class="task-card" 
              on:click={() => goToTaskDetail(task.id)} 
              on:keydown={(e) => handleTaskKeyDown(e, task.id)}
              role="button"
              tabindex="0"
              aria-label={`태스크: ${task.taskName}`}
            >
              <div class="card-header">
                <h3 class="card-title">{task.taskName}</h3>
                <span class={`status-badge ${getStatusClass(task.state)}`}>
                  {getStatusText(task.state)}
                </span>
              </div>
              
              <div class="card-body">
                {#if task.description}
                  <p class="card-description">{task.description}</p>
                {:else}
                  <p class="card-description empty">설명 없음</p>
                {/if}
              </div>
              
              <div class="card-footer">
                <div class="card-meta">
                  <div class="meta-item">
                    <span class="meta-label">생성일:</span>
                    <span class="meta-value">{formatDate(task.createdAt)}</span>
                  </div>
                  
                  <div class="meta-item">
                    <span class="meta-label">마감일:</span>
                    <span class="meta-value">{formatDate(task.dueDate)}</span>
                  </div>
                  
                  <div class="meta-item">
                    <span class="meta-label">영수증:</span>
                    <span class="meta-value">{task.images ? task.images.length : 0}개</span>
                  </div>
                </div>
                
                <button class="detail-button" on:click|stopPropagation={() => goToTaskDetail(task.id)}>
                  상세 보기
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- 페이지네이션 -->
  {#if totalPages > 1}
    <div class="pagination">
      <button 
        class="page-button" 
        disabled={currentPage === 1}
        on:click={() => handlePageChange(currentPage - 1)}
      >
        이전
      </button>
      
      {#each Array(totalPages) as _, i}
        <button 
          class="page-button" 
          class:active={currentPage === i + 1}
          on:click={() => handlePageChange(i + 1)}
        >
          {i + 1}
        </button>
      {/each}
      
      <button 
        class="page-button" 
        disabled={currentPage === totalPages}
        on:click={() => handlePageChange(currentPage + 1)}
      >
        다음
      </button>
    </div>
  {/if}
</div>

<style>
  .tasks-page {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  .create-button {
    background-color: #4A90E2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .create-button:hover {
    background-color: #3A7BC8;
  }
  
  .filters-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
    align-items: center;
  }
  
  .search-box {
    flex: 1;
    min-width: 200px;
  }
  
  .search-box :global(input) {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 200px;
  }
  
  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  
  .filter-controls :global(select) {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
  }
  
  .view-toggle {
    display: flex;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .view-button {
    padding: 8px 12px;
    background-color: white;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .view-button.active {
    background-color: #f0f0f0;
    font-weight: 500;
  }
  
  .tasks-content {
    margin-bottom: 24px;
  }
  
  .loading, .error, .empty-state {
    padding: 48px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .error {
    color: #E74C3C;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  /* 테이블 뷰 스타일 */
  .table-container {
    overflow-x: auto;
  }
  
  .tasks-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .tasks-table th, .tasks-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .tasks-table th {
    background-color: #f5f5f5;
    font-weight: 500;
    color: #333;
  }
  
  .tasks-table tr {
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .tasks-table tr:hover {
    background-color: #f9f9f9;
  }
  
  .task-name {
    font-weight: 500;
  }
  
  .task-description {
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-active {
    background-color: #E8F5E9;
    color: #2ECC71;
  }
  
  .status-hidden {
    background-color: #FEF9E7;
    color: #F39C12;
  }
  
  .status-disabled {
    background-color: #FDEDEB;
    color: #E74C3C;
  }
  
  .actions {
    white-space: nowrap;
  }
  
  .action-button {
    padding: 4px 8px;
    background-color: #f0f0f0;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }
  
  /* 카드 뷰 스타일 */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  
  .task-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s, transform 0.3s;
    cursor: pointer;
  }
  
  .task-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .card-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  .card-body {
    padding: 16px;
    min-height: 80px;
  }
  
  .card-description {
    margin: 0;
    color: #666;
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-description.empty {
    color: #999;
    font-style: italic;
  }
  
  .card-footer {
    padding: 16px;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
  }
  
  .card-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .meta-item {
    display: flex;
    font-size: 12px;
  }
  
  .meta-label {
    font-weight: 500;
    color: #666;
    width: 60px;
  }
  
  .meta-value {
    color: #333;
  }
  
  .detail-button {
    width: 100%;
    padding: 8px;
    background-color: #f0f0f0;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .detail-button:hover {
    background-color: #e0e0e0;
  }
  
  /* 페이지네이션 스타일 */
  .pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
  }
  
  .page-button {
    padding: 8px 12px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .page-button.active {
    background-color: #4A90E2;
    color: white;
    border-color: #4A90E2;
  }
  
  .page-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style> 