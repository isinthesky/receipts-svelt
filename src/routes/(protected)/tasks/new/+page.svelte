<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { taskStore } from '$lib/stores/tasks';
  import type { CreateTaskDto } from '$lib/types/task.types';

  // 상태 관리
  let loading = false;
  let error: string | null = null;
  let formSubmitted = false;
  
  // 폼 상태
  let taskForm: CreateTaskDto = {
    taskName: '',
    description: '',
    dueDate: ''
  };
  
  // 유효성 검사 상태
  let validationErrors = {
    taskName: '',
    description: '',
    dueDate: ''
  };

  // 폼 유효성 검사 함수
  function validateForm(): boolean {
    let isValid = true;
    
    // 초기화
    validationErrors = {
      taskName: '',
      description: '',
      dueDate: ''
    };
    
    // 태스크명 검사
    if (!taskForm.taskName.trim()) {
      validationErrors.taskName = '태스크명은 필수입니다.';
      isValid = false;
    } else if (taskForm.taskName.length > 100) {
      validationErrors.taskName = '태스크명은 100자 이내로 입력해주세요.';
      isValid = false;
    }
    
    // 설명 검사 (선택 사항이지만 길이 제한)
    if (taskForm.description && taskForm.description.length > 500) {
      validationErrors.description = '설명은 500자 이내로 입력해주세요.';
      isValid = false;
    }
    
    // 마감일 검사 (선택 사항이지만 유효한 날짜인지 확인)
    if (taskForm.dueDate) {
      const dueDate = new Date(taskForm.dueDate);
      if (isNaN(dueDate.getTime())) {
        validationErrors.dueDate = '유효한 날짜를 입력해주세요.';
        isValid = false;
      }
    }
    
    return isValid;
  }

  // 태스크 생성 함수
  async function createTask() {
    formSubmitted = true;
    
    // 유효성 검사
    if (!validateForm()) {
      return;
    }
    
    loading = true;
    error = null;
    
    try {
      const newTask = await taskStore.createTask(taskForm);
      
      if (newTask) {
        // 생성 성공 시 태스크 상세 페이지로 이동
        goto(`/tasks/${newTask.id}`);
      } else {
        throw new Error('태스크 생성에 실패했습니다.');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크 생성에 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  // 태스크 목록 페이지로 이동
  function goToTaskList() {
    goto('/tasks');
  }

  // 폼 초기화
  function resetForm() {
    taskForm = {
      taskName: '',
      description: '',
      dueDate: ''
    };
    
    validationErrors = {
      taskName: '',
      description: '',
      dueDate: ''
    };
    
    formSubmitted = false;
  }

  // 컴포넌트 마운트 시 초기화
  onMount(() => {
    resetForm();
  });
</script>

<div class="task-create-page">
  <div class="page-header">
    <div class="header-left">
      <button class="back-button" on:click={goToTaskList}>
        ← 태스크 목록
      </button>
      <h1>새 태스크 생성</h1>
    </div>
  </div>
  
  <div class="task-content">
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <div class="task-form-section">
      <form on:submit|preventDefault={createTask}>
        <div class="form-group">
          <label for="taskName">태스크명 <span class="required">*</span></label>
          <input 
            type="text" 
            id="taskName" 
            bind:value={taskForm.taskName} 
            class:error={formSubmitted && validationErrors.taskName}
            required
          />
          {#if formSubmitted && validationErrors.taskName}
            <span class="validation-error">{validationErrors.taskName}</span>
          {/if}
        </div>
        
        <div class="form-group">
          <label for="description">설명</label>
          <textarea 
            id="description" 
            bind:value={taskForm.description} 
            rows="4"
            class:error={formSubmitted && validationErrors.description}
          ></textarea>
          {#if formSubmitted && validationErrors.description}
            <span class="validation-error">{validationErrors.description}</span>
          {/if}
        </div>
        
        <div class="form-group">
          <label for="dueDate">마감일</label>
          <input 
            type="date" 
            id="dueDate" 
            bind:value={taskForm.dueDate}
            class:error={formSubmitted && validationErrors.dueDate}
          />
          {#if formSubmitted && validationErrors.dueDate}
            <span class="validation-error">{validationErrors.dueDate}</span>
          {/if}
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-button" on:click={goToTaskList}>
            취소
          </button>
          <button type="submit" class="create-button" disabled={loading}>
            {loading ? '생성 중...' : '태스크 생성'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  .task-create-page {
    width: 100%;
    max-width: 800px;
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
  
  .task-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .error {
    padding: 16px;
    background-color: #FDEDEB;
    color: #E74C3C;
    border-radius: 8px;
    font-size: 14px;
  }
  
  .task-form-section {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    padding: 24px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
  
  .form-group label {
    font-weight: 500;
    color: #333;
  }
  
  .required {
    color: #E74C3C;
  }
  
  .form-group input, .form-group textarea, .form-group select {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .form-group input.error, .form-group textarea.error, .form-group select.error {
    border-color: #E74C3C;
  }
  
  .validation-error {
    color: #E74C3C;
    font-size: 12px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  
  .cancel-button, .create-button {
    padding: 12px 24px;
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
  
  .create-button {
    background-color: #4A90E2;
    color: white;
  }
  
  .create-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style> 