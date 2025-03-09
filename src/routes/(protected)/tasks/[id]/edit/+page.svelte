<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { taskStore } from '$lib/stores/tasks';
  import type { Task, UpdateTaskDto } from '$lib/types/task.types';
  import Button from '$lib/components/ui/Button.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';
  import { goto } from '$app/navigation';

  const taskId = $page.params.id;
  
  let task: Task | null = null;
  let loading = true;
  let saving = false;
  let error: string | null = null;
  let success = false;
  
  let updateData: UpdateTaskDto = {
    task_name: '',
    description: '',
    due_date: '',
    state: 1
  };

  // 태스크 정보 로드
  async function loadTask() {
    loading = true;
    error = null;
    
    try {
      task = await taskStore.getTaskById(taskId);
      
      // 폼 데이터 초기화
      updateData = {
        task_name: task.taskName,
        description: task.description || '',
        due_date: task.dueDate || '',
        state: task.state
      };
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크를 불러오는데 실패했습니다.';
      console.error('태스크 로딩 오류:', err);
    } finally {
      loading = false;
    }
  }

  // 폼 제출 처리
  async function handleSubmit() {
    saving = true;
    error = null;
    success = false;

    if (!updateData.task_name) {
      error = '태스크 이름은 필수입니다.';
      saving = false;
      return;
    }

    try {
      await taskStore.updateTask(taskId, updateData);
      success = true;
      // 성공 후 태스크 상세 페이지로 이동
      setTimeout(() => {
        goto(`/tasks/${taskId}`);
      }, 1500);
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크 업데이트에 실패했습니다.';
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    loadTask();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">태스크 편집</h1>
    <Button variant="secondary" href={`/tasks/${taskId}`}>상세 페이지로 돌아가기</Button>
  </div>

  {#if loading}
    <Loading />
  {:else if error && !task}
    <Alert type="error" message={error} />
  {:else if task}
    <Card>
      <div class="p-6">
        {#if success}
          <Alert type="success" message="태스크가 성공적으로 업데이트되었습니다. 상세 페이지로 이동합니다." />
        {/if}

        {#if error}
          <Alert type="error" message={error} />
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div>
            <label for="task_name" class="block text-sm font-medium text-gray-700 mb-1">태스크 이름 *</label>
            <input
              type="text"
              id="task_name"
              bind:value={updateData.task_name}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="태스크 이름을 입력하세요"
              required
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              id="description"
              bind:value={updateData.description}
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="태스크에 대한 설명을 입력하세요"
            ></textarea>
          </div>

          <div>
            <label for="due_date" class="block text-sm font-medium text-gray-700 mb-1">마감일</label>
            <input
              type="date"
              id="due_date"
              bind:value={updateData.due_date}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="state" class="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              id="state"
              bind:value={updateData.state}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={1}>활성</option>
              <option value={2}>숨김</option>
              <option value={0}>비활성</option>
            </select>
          </div>

          <div class="flex justify-end space-x-2">
            <Button variant="secondary" type="button" on:click={() => goto(`/tasks/${taskId}`)}>취소</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? '저장 중...' : '태스크 저장'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  {:else}
    <Alert type="warning" message="태스크를 찾을 수 없습니다." />
  {/if}
</div> 