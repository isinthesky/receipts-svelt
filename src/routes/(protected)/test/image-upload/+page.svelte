<script lang="ts">
  import { onMount } from 'svelte';
  import { taskStore } from '$lib/stores/tasks';
  import ImageUploadTest from '$lib/components/ui/ImageUploadTest.svelte';
  import type { Task } from '$lib/types/task.types';
  
  // 공통 컴포넌트 임포트
  import Container from '$lib/components/ui/styles/Container.svelte';
  import Card from '$lib/components/ui/styles/Card.svelte';
  import Typography from '$lib/components/ui/styles/Typography.svelte';
  import ErrorMessage from '$lib/components/ui/styles/ErrorMessage.svelte';
  import CodeBlock from '$lib/components/ui/styles/CodeBlock.svelte';
  import Button from '$lib/components/ui/styles/Button.svelte';
  
  // 상태 관리
  let tasks: Task[] = [];
  let loading = true;
  let error: string | null = null;
  let selectedTaskId: string = '';
  
  // 태스크 목록 로드
  async function loadTasks() {
    loading = true;
    error = null;
    
    try {
      await taskStore.loadTasks();
      tasks = $taskStore.tasks;
    } catch (err) {
      console.error('Error loading tasks:', err);
      error = err instanceof Error ? err.message : '태스크를 불러오는데 실패했습니다.';
    } finally {
      loading = false;
    }
  }
  
  // 컴포넌트 마운트 시 태스크 목록 로드
  onMount(() => {
    loadTasks();
  });
  
  // 예제 코드 문자열
  const apiCodeExample = `// 이미지 업로드 API 호출 예시
const uploadImage = async (taskId, file, description) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (description) {
    formData.append('description', description);
  }
  
  formData.append('taskId', taskId);
  
  const response = await fetch(\`http://facreport.iptime.org:5008/api/v1/main/tasks/\${taskId}/images\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`
    },
    body: formData
  });
  
  const data = await response.json();
  return data;
};`;
  
  // JSON 예제 문자열
  const apiResponseExample = `{
  "success": true,
  "message": "이미지가 성공적으로 업로드되었습니다.",
  "data": {
    "id": "image-uuid",
    "taskId": "task-uuid",
    "fileName": "example.jpg",
    "fileSize": 123456,
    "fileType": "image/jpeg",
    "filePath": "/path/to/image.jpg",
    "thumbnailPath": "/path/to/thumbnail.jpg",
    "description": "이미지 설명",
    "processingStatus": 1,
    "receiptCount": 0,
    "createdAt": "2023-03-08T12:34:56.789Z",
    "updatedAt": "2023-03-08T12:34:56.789Z",
    "state": 1
  }
}`;
</script>

<Container>
  <Typography variant="h1" marginBottom="20px">이미지 업로드 API 테스트</Typography>
  
  <Card>
    <Typography variant="h2" marginBottom="15px">태스크 선택</Typography>
    
    {#if loading}
      <p>태스크를 불러오는 중...</p>
    {:else if error}
      <ErrorMessage message={error} showRetry={true} on:retry={loadTasks} />
    {:else if tasks.length === 0}
      <p>사용 가능한 태스크가 없습니다. 먼저 태스크를 생성해주세요.</p>
    {:else}
      <div class="select-container">
        <label for="task-select">테스트할 태스크 선택:</label>
        <select id="task-select" bind:value={selectedTaskId}>
          <option value="">-- 태스크 선택 --</option>
          {#each tasks as task}
            <option value={task.id}>{task.taskName}</option>
          {/each}
        </select>
      </div>
    {/if}
  </Card>
  
  <div style="margin-bottom: 30px;">
    <ImageUploadTest taskId={selectedTaskId} />
  </div>
  
  <Card>
    <Typography variant="h2" marginBottom="15px">API 정보</Typography>
    <CodeBlock code={apiCodeExample} />
    
    <Typography variant="h3" marginBottom="10px" marginTop="20px">응답 형식</Typography>
    <CodeBlock code={apiResponseExample} />
  </Card>
</Container>

<style>
  .select-container {
    margin-top: 10px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-main-bg);
    color: var(--color-text-primary);
    font-size: 16px;
  }
</style> 