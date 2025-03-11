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
  import Input from '$lib/components/ui/Input.svelte';
  import Container from '$lib/components/ui/styles/Container.svelte';
  import Grid from '$lib/components/ui/styles/Grid.svelte';

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

<Container>
  <div class="header-section">
    <h1>태스크 목록</h1>
    <Button href="/tasks/new">새 태스크 생성</Button>
  </div>

  <!-- 검색 및 필터 -->
  <Card>
    <Grid>
      <div>
        <Input
          id="search"
          label="검색"
          bind:value={searchQuery}
          placeholder="태스크 이름 또는 설명 검색..."
        />
      </div>
      <div>
        <label for="stateFilter">상태 필터</label>
        <select
          id="stateFilter"
          bind:value={statusFilter}
        >
          <option value={null}>모든 상태</option>
          <option value={1}>활성화</option>
          <option value={2}>숨김</option>
          <option value={0}>비활성화</option>
        </select>
      </div>
      <div>
        <label for="sortBy">정렬 기준</label>
        <select
          id="sortBy"
          bind:value={sortBy}
        >
          <option value="createdAt">생성일</option>
          <option value="taskName">태스크명</option>
          <option value="dueDate">마감일</option>
        </select>
      </div>
      <div>
        <label for="sortOrder">정렬 순서</label>
        <select
          id="sortOrder"
          bind:value={sortOrder}
        >
          <option value="desc">내림차순</option>
          <option value="asc">오름차순</option>
        </select>
      </div>
      <div>
        <label for="viewMode">보기 모드</label>
        <select
          id="viewMode"
          bind:value={viewMode}
        >
          <option value="table">테이블</option>
          <option value="card">카드</option>
        </select>
      </div>
    </Grid>
  </Card>

  {#if loading}
    <Loading text="태스크를 불러오는 중..." />
  {:else if error}
    <Alert type="error" message={error} />
  {:else if paginatedTasks.length === 0}
    <Alert type="info" message="태스크가 없습니다." />
  {:else}
    <!-- 태스크 목록 -->
    {#if viewMode === 'table'}
      <div class="task-table">
        <table>
          <thead>
            <tr>
              <th>태스크명</th>
              <th>상태</th>
              <th>생성일</th>
              <th>마지막 수정일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedTasks as task}
              <tr
                on:click={() => goToTaskDetail(task.id)}
                on:keydown={(e) => handleTaskKeyDown(e, task.id)}
                tabindex="0"
              >
                <td>{task.taskName}</td>
                <td>
                  <span class={getStatusClass(task.state)}>
                    {getStatusText(task.state)}
                  </span>
                </td>
                <td>{formatDate(task.createdAt)}</td>
                <td>{formatDate(task.updatedAt)}</td>
                <td>
                  <Button size="sm" on:click={(event) => {
                    // 이벤트 전파 중지
                    event.stopPropagation();
                    goToTaskDetail(task.id);
                  }}>
                    상세보기
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" gap="16px">
        {#each paginatedTasks as task}
          <Card
            on:click={() => goToTaskDetail(task.id)}
          >
            <svelte:element this={'div'} 
              on:keydown={(e: KeyboardEvent) => handleTaskKeyDown(e, task.id)}
              tabindex="0"
              role="button"
            >
              <h3>{task.taskName}</h3>
              <p>{task.description || '설명 없음'}</p>
              <div class="task-card-footer">
                <span class={getStatusClass(task.state)}>
                  {getStatusText(task.state)}
                </span>
                <span>{formatDate(task.createdAt)}</span>
              </div>
            </svelte:element>
          </Card>
        {/each}
      </Grid>
    {/if}

    <!-- 페이지네이션 -->
    {#if totalPages > 1}
      <div class="pagination">
        <Button 
          size="sm" 
          disabled={currentPage === 1} 
          on:click={() => handlePageChange(currentPage - 1)}
        >
          이전
        </Button>
        
        {#each Array(totalPages) as _, i}
          <Button 
            size="sm" 
            variant={currentPage === i + 1 ? 'primary' : 'secondary'} 
            on:click={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </Button>
        {/each}
        
        <Button 
          size="sm" 
          disabled={currentPage === totalPages} 
          on:click={() => handlePageChange(currentPage + 1)}
        >
          다음
        </Button>
      </div>
    {/if}
  {/if}
</Container> 


<style>
.task-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

</style>