<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { taskStore } from '$lib/stores/tasks';
  import { imageStore } from '$lib/stores/images';
  import type { Task } from '$lib/types/task.types';
  
  // 컴포넌트 임포트
  import WelcomeSection from '$lib/components/ui/WelcomeSection.svelte';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  import TaskTable from '$lib/components/ui/TaskTable.svelte';
  import ImageGrid from '$lib/components/ui/ImageGrid.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';
  import Container from '$lib/components/ui/styles/Container.svelte';
  import Grid from '$lib/components/ui/styles/Grid.svelte';
  import ErrorMessage from '$lib/components/ui/styles/ErrorMessage.svelte';
  
  // 상태 관리
  let loading = true;
  let error: string | null = null;
  let stats = {
    totalTasks: 0,
    processedImages: 0,
    recognizedReceipts: 0,
    totalAmount: 0
  };
  let recentTasks: Task[] = [];
  let recentImages: Array<{
    id: string;
    thumbnailUrl: string;
    fileName: string;
  }> = [];
  
  // 데이터 로드 함수
  async function loadDashboardData() {
    loading = true;
    error = null;
    
    try {
      // 태스크 데이터 로드
      await taskStore.loadTasks();
      recentTasks = $taskStore.tasks.slice(0, 4);
      stats.totalTasks = $taskStore.tasks.length;
      
      // 이미지 데이터 로드 (예시)
      // 실제로는 API에서 통계 데이터를 가져와야 함
      stats.processedImages = 156;
      stats.recognizedReceipts = 87;
      stats.totalAmount = 487250;
      
      // 최근 이미지 (예시)
      recentImages = [
        { id: '1', thumbnailUrl: '', fileName: '영수증1.jpg' },
        { id: '2', thumbnailUrl: '', fileName: '영수증2.jpg' },
        { id: '3', thumbnailUrl: '', fileName: '영수증3.jpg' },
        { id: '4', thumbnailUrl: '', fileName: '영수증4.jpg' }
      ];
    } catch (err) {
      error = err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.';
    } finally {
      loading = false;
    }
  }
  
  // 태스크 상세 페이지로 이동
  function goToTaskDetail(taskId: string) {
    goto(`/tasks/${taskId}`);
  }
  
  // 이미지 상세 페이지로 이동
  function goToImageDetail(imageId: string) {
    goto(`/images/${imageId}`);
  }
  
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
  
  // 금액 포맷팅 함수
  function formatAmount(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }
  
  // 컴포넌트 마운트 시 데이터 로드
  onMount(() => {
    loadDashboardData();
  });
</script>

<Container>
  <WelcomeSection username={$authStore.user?.name || '사용자'} />
  
  {#if loading}
    <Loading text="데이터를 불러오는 중..." />
  {:else if error}
    <ErrorMessage message={error} showRetry={true} on:retry={loadDashboardData} />
  {:else}
    <!-- 통계 카드 섹션 -->
    <Grid>
      <StatCard 
        title="총 태스크" 
        value={stats.totalTasks} 
        change="12% 증가" 
        isIncrease={true} 
      />
      
      <StatCard 
        title="처리된 이미지" 
        value={stats.processedImages} 
        change="8% 증가" 
        isIncrease={true} 
      />
      
      <StatCard 
        title="인식된 영수증" 
        value={stats.recognizedReceipts} 
        change="15% 증가" 
        isIncrease={true} 
      />
      
      <StatCard 
        title="총 금액" 
        value={formatAmount(stats.totalAmount)} 
        change="5% 감소" 
        isIncrease={false} 
      />
    </Grid>
    
    <Grid columns="1fr 320px" gap="16px">
      <TaskTable tasks={recentTasks} onViewTask={goToTaskDetail} />
      <ImageGrid images={recentImages} onImageClick={goToImageDetail} />
    </Grid>
  {/if}
</Container> 