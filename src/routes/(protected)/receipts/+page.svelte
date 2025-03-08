<script lang="ts">
  import { onMount } from 'svelte';
  import type { Receipt } from '$lib/types/receipt.types';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';

  let receipts: Receipt[] = [];
  let loading = true;
  let error: string | null = null;

  // 영수증 데이터 로드 함수
  async function loadReceipts() {
    loading = true;
    error = null;
    
    try {
      // 실제 API 연동 시 아래 코드로 대체
      // const response = await fetch('/api/v1/main/receipts');
      // receipts = await response.json();
      
      // 임시 데이터
      setTimeout(() => {
        receipts = [
          {
            id: '1',
            title: '마트 영수증',
            store_name: '이마트',
            purchase_date: '2023-03-01',
            total_amount: 35000,
            image_url: 'https://via.placeholder.com/300x400?text=Receipt+1',
            createdAt: '2023-03-01T12:00:00Z',
            updatedAt: '2023-03-01T12:00:00Z',
            state: 1
          },
          {
            id: '2',
            title: '식당 영수증',
            store_name: '맛있는 식당',
            purchase_date: '2023-03-05',
            total_amount: 45000,
            image_url: 'https://via.placeholder.com/300x400?text=Receipt+2',
            createdAt: '2023-03-05T18:30:00Z',
            updatedAt: '2023-03-05T18:30:00Z',
            state: 1
          },
          {
            id: '3',
            title: '카페 영수증',
            store_name: '스타벅스',
            purchase_date: '2023-03-10',
            total_amount: 8500,
            image_url: 'https://via.placeholder.com/300x400?text=Receipt+3',
            createdAt: '2023-03-10T09:15:00Z',
            updatedAt: '2023-03-10T09:15:00Z',
            state: 2
          }
        ];
        loading = false;
      }, 1000);
    } catch (err) {
      error = err instanceof Error ? err.message : '영수증 데이터를 불러오는데 실패했습니다.';
      loading = false;
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
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
    loadReceipts();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Receipts App - 영수증 목록</h1>
    <Button href="/receipts/new">새 영수증 추가</Button>
  </div>

  <!-- 로딩 상태 -->
  {#if loading}
    <Loading />
  <!-- 오류 상태 -->
  {:else if error}
    <Alert type="error">{error}</Alert>
  <!-- 데이터 없음 -->
  {:else if receipts.length === 0}
    <div class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-500">영수증이 없습니다. 새 영수증을 추가해보세요.</p>
    </div>
  <!-- 영수증 목록 -->
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each receipts as receipt (receipt.id)}
        <Card>
          <div class="p-4">
            <div class="flex justify-between items-start">
              <h2 class="text-xl font-semibold mb-2">{receipt.title}</h2>
              <span class={`px-2 py-1 text-xs font-semibold rounded-full ${getStateClass(receipt.state)}`}>
                {getStateLabel(receipt.state)}
              </span>
            </div>
            
            <div class="mb-4">
              <img src={receipt.image_url} alt={receipt.title} class="w-full h-48 object-cover rounded-md" />
            </div>
            
            <div class="space-y-2 mb-4">
              <p><span class="font-medium">상점:</span> {receipt.store_name}</p>
              <p><span class="font-medium">구매일:</span> {new Date(receipt.purchase_date).toLocaleDateString()}</p>
              <p><span class="font-medium">금액:</span> {formatCurrency(receipt.total_amount)}</p>
            </div>
            
            <div class="flex justify-between items-center mt-4">
              <span class="text-xs text-gray-500">생성일: {new Date(receipt.createdAt).toLocaleDateString()}</span>
              <div class="flex space-x-2">
                <Button href={`/receipts/${receipt.id}`} variant="outline" size="sm">상세</Button>
                <Button href={`/receipts/${receipt.id}/edit`} variant="outline" size="sm">편집</Button>
              </div>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div> 