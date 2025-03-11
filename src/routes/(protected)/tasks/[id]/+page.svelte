<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { taskStore } from '$lib/stores/tasks';
  import type { Task } from '$lib/types/task.types';
  import TaskImages from '$lib/components/features/TaskImages.svelte';

  // 상태 관리
  let task: Task | null = null;
  let loading = true;
  let error: string | null = null;
  let isEditing = false;
  let showDeleteConfirm = false;
  
  // 편집 폼 상태
  let editForm = {
    taskName: '',
    description: '',
    dueDate: '',
    state: 1
  };

  // 태스크 ID 가져오기
  const taskId = $page.params.id;

  // 태스크 로드 함수
  async function loadTask() {
    loading = true;
    error = null;
    
    try {
      task = await taskStore.getTaskById(taskId);
      
      // 편집 폼 초기화
      if (task) {
        editForm = {
          taskName: task.taskName,
          description: task.description || '',
          dueDate: task.dueDate || '',
          state: task.state
        };
      }
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크를 불러오는데 실패했습니다.';
      task = null;
    } finally {
      loading = false;
    }
  }

  // 태스크 업데이트 함수
  async function updateTask() {
    if (!task) return;
    
    loading = true;
    error = null;
    
    try {
      await taskStore.updateTask(taskId, {
        task_name: editForm.taskName,
        description: editForm.description || undefined,
        due_date: editForm.dueDate || undefined,
        state: editForm.state
      });
      
      // 업데이트 후 태스크 다시 로드
      await loadTask();
      isEditing = false;
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크 업데이트에 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  // 태스크 삭제 함수
  async function deleteTask() {
    loading = true;
    error = null;
    
    try {
      const success = await taskStore.deleteTask(taskId);
      
      if (success) {
        // 삭제 성공 시 태스크 목록 페이지로 이동
        goto('/tasks');
      } else {
        throw new Error('태스크 삭제에 실패했습니다.');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크 삭제에 실패했습니다.';
      showDeleteConfirm = false;
    } finally {
      loading = false;
    }
  }

  // 편집 모드 토글
  function toggleEditMode() {
    isEditing = !isEditing;
    
    if (!isEditing && task) {
      // 편집 취소 시 원래 값으로 복원
      editForm = {
        taskName: task.taskName,
        description: task.description || '',
        dueDate: task.dueDate || '',
        state: task.state
      };
    }
  }

  // 삭제 확인 모달 토글
  function toggleDeleteConfirm() {
    showDeleteConfirm = !showDeleteConfirm;
  }

  // 태스크 목록 페이지로 이동
  function goToTaskList() {
    goto('/tasks');
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

  // 키보드 이벤트 핸들러 추가
  function handleModalKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      toggleDeleteConfirm();
    } else if (event.key === 'Enter' || event.key === ' ') {
      // 모달 내부 클릭은 처리하지 않음
    }
  }

  function handleModalContentKeyDown(event: KeyboardEvent) {
    // 모달 내부에서 이벤트 전파 중지
    event.stopPropagation();
  }

  // 컴포넌트 마운트 시 태스크 로드
  onMount(() => {
    loadTask();
  });
</script>

<div class="task-detail-page">
  <div class="page-header">
    <div class="header-left">
      <button class="back-button" on:click={goToTaskList}>
        ← 태스크 목록
      </button>
      
      {#if task}
        <h1>{task.taskName}</h1>
      {/if}
    </div>
    
    <div class="header-actions">
      {#if task && !isEditing}
        <button class="edit-button" on:click={toggleEditMode}>
          편집
        </button>
        <button class="delete-button" on:click={toggleDeleteConfirm}>
          삭제
        </button>
      {/if}
    </div>
  </div>
  
  <div class="task-content">
    {#if loading}
      <div class="loading">태스크를 불러오는 중...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else if !task}
      <div class="not-found">
        <p>태스크를 찾을 수 없습니다.</p>
        <button class="back-button" on:click={goToTaskList}>
          태스크 목록으로 돌아가기
        </button>
      </div>
    {:else}
      <!-- 태스크 정보 -->
      <div class="task-info-section">
        {#if isEditing}
          <!-- 편집 폼 -->
          <div class="edit-form">
            <div class="form-group">
              <label for="taskName">태스크명</label>
              <input 
                type="text" 
                id="taskName" 
                bind:value={editForm.taskName} 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="description">설명</label>
              <textarea 
                id="description" 
                bind:value={editForm.description} 
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="dueDate">마감일</label>
              <input 
                type="date" 
                id="dueDate" 
                bind:value={editForm.dueDate}
              />
            </div>
            
            <div class="form-group">
              <label for="state">상태</label>
              <select id="state" bind:value={editForm.state}>
                <option value={1}>활성화</option>
                <option value={2}>숨김</option>
                <option value={0}>비활성화</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button class="cancel-button" on:click={toggleEditMode}>
                취소
              </button>
              <button class="save-button" on:click={updateTask}>
                저장
              </button>
            </div>
          </div>
        {:else}
          <!-- 태스크 정보 표시 -->
          <div class="task-info">
            <div class="info-header">
              <h2>태스크 정보</h2>
              <span class={`status-badge ${getStatusClass(task.state)}`}>
                {getStatusText(task.state)}
              </span>
            </div>
            
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">태스크명:</span>
                <span class="info-value">{task.taskName}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">설명:</span>
                <span class="info-value">{task.description || '-'}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">생성일:</span>
                <span class="info-value">{formatDate(task.createdAt)}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">마감일:</span>
                <span class="info-value">{formatDate(task.dueDate)}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">마지막 수정:</span>
                <span class="info-value">{formatDate(task.updatedAt)}</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- 이미지 목록 섹션 -->
      <div class="task-images-section">
        <h2>이미지 목록</h2>
        <TaskImages taskId={taskId} />
      </div>
    {/if}
  </div>
  
  <!-- 삭제 확인 모달 -->
  {#if showDeleteConfirm}
    <div 
      class="modal-backdrop" 
      on:click={toggleDeleteConfirm} 
      on:keydown={handleModalKeyDown}
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <div 
        class="modal-content" 
        on:click|stopPropagation 
        on:keydown={handleModalContentKeyDown}
        aria-label="모달 내용"
        role="dialog"
        tabindex="0"
      >
        <div class="modal-header">
          <h2>태스크 삭제 확인</h2>
          <button class="close-button" on:click={toggleDeleteConfirm} aria-label="닫기">×</button>
        </div>
        
        <div class="modal-body">
          <p>정말로 이 태스크를 삭제하시겠습니까?</p>
          <p class="warning">이 작업은 되돌릴 수 없으며, 연결된 모든 이미지와 영수증 데이터가 함께 삭제됩니다.</p>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-button" on:click={toggleDeleteConfirm}>
            취소
          </button>
          <button class="delete-button" on:click={deleteTask}>
            삭제
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .task-detail-page {
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
  
  .header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .back-button {
    background: none;
    border: none;
    color: #4A90E2;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
  
  .edit-button, .delete-button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }
  
  .edit-button {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .delete-button {
    background-color: #FDEDEB;
    color: #E74C3C;
  }
  
  .task-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .loading, .error, .not-found {
    padding: 48px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .error {
    color: #E74C3C;
  }
  
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .task-info-section {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  
  .task-info {
    padding: 24px;
  }
  
  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .info-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
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
  
  .info-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .info-item {
    display: flex;
    gap: 8px;
  }
  
  .info-label {
    font-weight: 500;
    color: #666;
    min-width: 100px;
  }
  
  .info-value {
    color: #333;
  }
  
  .edit-form {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-group label {
    font-weight: 500;
    color: #333;
  }
  
  .form-group input, .form-group textarea, .form-group select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
  
  .cancel-button, .save-button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }
  
  .cancel-button {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .save-button {
    background-color: #4A90E2;
    color: white;
  }
  
  .task-images-section {
    margin-top: 16px;
  }
  
  .task-images-section h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 500;
  }
  
  /* 모달 스타일 */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .warning {
    color: #E74C3C;
    font-weight: 500;
  }
  
  .modal-footer {
    padding: 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style> 