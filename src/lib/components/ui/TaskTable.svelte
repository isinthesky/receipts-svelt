<script lang="ts">
  import type { Task } from '$lib/types/task.types';
  
  export let tasks: Task[] = [];
  export let onViewTask: (taskId: string) => void;
  
  // 상태 텍스트 반환 함수
  function getStatusText(status: number): string {
    switch (status) {
      case 0: return '비활성화';
      case 1: return '활성화';
      case 2: return '숨김';
      case 3: return '진행중';
      case 4: return '완료';
      case 5: return '검토중';
      case 6: return '지연';
      default: return '알 수 없음';
    }
  }
  
  // 상태 클래스 반환 함수
  function getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'status-disabled';
      case 1: return 'status-active';
      case 2: return 'status-hidden';
      case 3: return 'status-processing';
      case 4: return 'status-completed';
      case 5: return 'status-reviewing';
      case 6: return 'status-delayed';
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
</script>

<div class="task-table-container">
  <div class="section-header">
    <h2>최근 태스크</h2>
    <a href="/tasks" class="view-all">모두 보기</a>
  </div>
  
  <div class="task-table">
    <div class="table-header">
      <div class="header-cell">이름</div>
      <div class="header-cell">날짜</div>
      <div class="header-cell">상태</div>
      <div class="header-cell">작업</div>
    </div>
    
    {#if tasks.length === 0}
      <div class="empty-state">태스크가 없습니다.</div>
    {:else}
      {#each tasks as task}
        <div class="table-row">
          <div class="cell task-name">{task.taskName}</div>
          <div class="cell">{formatDate(task.createdAt)}</div>
          <div class="cell">
            <span class={`status-badge ${getStatusClass(task.state)}`}>
              {getStatusText(task.state)}
            </span>
          </div>
          <div class="cell">
            <button class="action-button" on:click={() => onViewTask(task.id)}>
              보기
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .task-table-container {
    background-color: var(--color-content-bg);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--color-shadow);
    padding: 16px;
    border: 1px solid var(--color-border);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .view-all {
    font-size: 14px;
    color: var(--color-accent);
    text-decoration: none;
  }
  
  .view-all:hover {
    text-decoration: underline;
  }
  
  .task-table {
    width: 100%;
  }
  
  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border);
  }
  
  .header-cell {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }
  
  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
  }
  
  .table-row:last-child {
    border-bottom: none;
  }
  
  .cell {
    font-size: 14px;
    color: var(--color-text-primary);
  }
  
  .task-name {
    font-weight: 500;
  }
  
  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-active {
    background-color: #e1f5fe;
    color: #0288d1;
  }
  
  .status-completed {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  .status-processing {
    background-color: #e1f5fe;
    color: #0288d1;
  }
  
  .status-reviewing {
    background-color: #fff8e1;
    color: #ffa000;
  }
  
  .status-delayed {
    background-color: #ffebee;
    color: #d32f2f;
  }
  
  .status-disabled {
    background-color: #f5f5f5;
    color: #9e9e9e;
  }
  
  .status-hidden {
    background-color: #f3e5f5;
    color: #8e24aa;
  }
  
  .action-button {
    color: var(--color-accent);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
  }
  
  .action-button:hover {
    text-decoration: underline;
  }
  
  .empty-state {
    padding: 24px;
    text-align: center;
    color: var(--color-text-secondary);
  }
</style> 