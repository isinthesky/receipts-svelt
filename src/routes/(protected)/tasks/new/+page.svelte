<script lang="ts">
  import { taskStore } from '$lib/stores/tasks';
  import type { CreateTaskDto } from '$lib/types/task.types';
  import Button from '$lib/components/ui/Button.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { goto } from '$app/navigation';

  let taskData: CreateTaskDto = {
    taskName: '',
    description: ''
  };

  let loading = false;
  let error: string | null = null;
  let success = false;

  async function handleSubmit() {
    loading = true;
    error = null;
    success = false;

    if (!taskData.taskName) {
      error = '태스크 이름은 필수입니다.';
      loading = false;
      return;
    }

    try {
      await taskStore.createTask(taskData);
      success = true;
      // 성공 후 태스크 목록 페이지로 이동
      setTimeout(() => {
        goto('/tasks');
      }, 1500);
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크 생성에 실패했습니다.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">새 태스크 생성</h1>
    <Button variant="secondary" href="/tasks">목록으로 돌아가기</Button>
  </div>

  <Card>
    <div class="p-6">
      {#if success}
        <Alert type="success">태스크가 성공적으로 생성되었습니다. 태스크 목록으로 이동합니다.</Alert>
      {/if}

      {#if error}
        <Alert type="error">{error}</Alert>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div>
          <label for="task_name" class="block text-sm font-medium text-gray-700 mb-1">태스크 이름 *</label>
          <input
            type="text"
            id="task_name"
            bind:value={taskData.taskName}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="태스크 이름을 입력하세요"
            required
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            id="description"
            bind:value={taskData.description}
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
            value={"0"}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <Button variant="secondary" type="button" on:click={() => goto('/tasks')}>취소</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? '생성 중...' : '태스크 생성'}
          </Button>
        </div>
      </form>
    </div>
  </Card>
</div> 