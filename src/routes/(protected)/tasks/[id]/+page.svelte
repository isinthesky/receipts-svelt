<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { taskStore } from '$lib/stores/tasks';
  import type { Task } from '$lib/types/task.types';
  import Button from '$lib/components/ui/Button.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { goto } from '$app/navigation';

  let task: Task | null = null;
  let loading = true;
  let error: string | null = null;
  let showDeleteModal = false;

  const taskId = $page.params.id;

  async function loadTask() {
    loading = true;
    error = null;
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error('태스크를 불러오는데 실패했습니다.');
      }
      task = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크를 불러오는데 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    try {
      await taskStore.deleteTask(taskId);
      showDeleteModal = false;
      goto('/tasks');
    } catch (err) {
      error = err instanceof Error ? err.message : '태스크 삭제에 실패했습니다.';
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

  onMount(() => {
    loadTask();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">태스크 상세</h1>
    <div class="flex space-x-2">
      <Button variant="primary" href={`/tasks/${taskId}/edit`}>편집</Button>
      <Button variant="danger" on:click={() => showDeleteModal = true}>삭제</Button>
    </div>
  </div>

  {#if loading}
    <Loading />
  {:else if error}
    <Alert type="error">{error}</Alert>
  {:else if task}
    <Card>
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-bold">{task.task_name}</h2>
          <span class={`px-3 py-1 text-sm font-semibold rounded-full ${getStateClass(task.state)}`}>
            {getStateLabel(task.state)}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">기본 정보</h3>
            <div class="space-y-2">
              <p><span class="font-medium">생성일:</span> {new Date(task.created_at).toLocaleDateString()}</p>
              <p><span class="font-medium">수정일:</span> {new Date(task.updated_at).toLocaleDateString()}</p>
              {#if task.due_date}
                <p><span class="font-medium">마감일:</span> {new Date(task.due_date).toLocaleDateString()}</p>
              {/if}
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-2">설명</h3>
            <p class="text-gray-700">{task.description || '설명이 없습니다.'}</p>
          </div>
        </div>

        <div class="mt-8">
          <h3 class="text-lg font-semibold mb-4">관련 이미지</h3>
          {#if task.receipts && task.receipts.length > 0}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {#each task.receipts as receipt}
                <div class="border rounded-lg overflow-hidden">
                  <img src={receipt.image_url} alt="Receipt" class="w-full h-48 object-cover" />
                  <div class="p-3">
                    <p class="font-medium">{receipt.title || '제목 없음'}</p>
                    <p class="text-sm text-gray-500">{new Date(receipt.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-gray-500">관련 이미지가 없습니다.</p>
          {/if}
        </div>
      </div>
    </Card>
  {:else}
    <Alert type="warning">태스크를 찾을 수 없습니다.</Alert>
  {/if}
</div>

<!-- 삭제 확인 모달 -->
{#if showDeleteModal}
  <Modal title="태스크 삭제" on:close={() => showDeleteModal = false}>
    <div class="p-4">
      <p>정말로 이 태스크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
      <div class="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" on:click={() => showDeleteModal = false}>취소</Button>
        <Button variant="danger" on:click={handleDelete}>삭제</Button>
      </div>
    </div>
  </Modal>
{/if} 