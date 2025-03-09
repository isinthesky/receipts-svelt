<script lang="ts">
  import { onMount } from 'svelte';
  import { imageStore } from '$lib/stores/images';
  import type { Image, ImageFilterOptions } from '$lib/types/image.types';
  import ImageCard from './ImageCard.svelte';
  import ImageUpload from './ImageUpload.svelte';
  import ImageModal from './ImageModal.svelte';

  // 속성 정의
  export let taskId: string;
  export let showUploadButton = true;

  // 상태 관리
  let loading = false;
  let error: string | null = null;
  let images: Image[] = [];
  let filteredImages: Image[] = [];
  let selectedImage: Image | null = null;
  let showModal = false;
  let searchQuery = '';
  let processingStatus: number | undefined = undefined;
  let sortBy: 'createdAt' | 'fileSize' | 'fileName' = 'createdAt';
  let sortOrder: 'asc' | 'desc' = 'desc';

  // 이미지 로드 함수
  async function loadImages() {
    loading = true;
    error = null;
    
    try {
      await imageStore.loadImagesByTaskId(taskId);
      updateFilteredImages();
    } catch (err) {
      error = err instanceof Error ? err.message : '이미지를 불러오는데 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  // 필터링 옵션 업데이트 함수
  function updateFilterOptions() {
    imageStore.setFilterOptions({
      processingStatus,
      sortBy,
      sortOrder,
      search: searchQuery
    });
    updateFilteredImages();
  }

  // 필터링된 이미지 목록 업데이트
  function updateFilteredImages() {
    filteredImages = imageStore.getFilteredImages(taskId);
  }

  // 이미지 클릭 핸들러
  function handleImageClick(image: Image) {
    selectedImage = image;
    showModal = true;
  }

  // 모달 닫기 핸들러
  function handleCloseModal() {
    showModal = false;
    selectedImage = null;
  }

  // 이미지 업로드 완료 핸들러
  function handleUploadComplete() {
    updateFilteredImages();
  }

  // 이미지 삭제 핸들러
  function handleImageDelete() {
    // 이미지 삭제 후 목록 업데이트
    loadImages();
    showModal = false;
    selectedImage = null;
  }

  // 키보드 이벤트 핸들러 추가
  function handleImageKeyDown(event: KeyboardEvent, image: Image) {
    if (event.key === 'Enter' || event.key === ' ') {
      handleImageClick(image);
      event.preventDefault();
    }
  }

  // 컴포넌트 마운트 시 이미지 로드
  onMount(() => {
    loadImages();
  });

  // 필터링 옵션 변경 시 이미지 목록 업데이트
  $: {
    if (searchQuery !== undefined || processingStatus !== undefined || sortBy || sortOrder) {
      updateFilterOptions();
    }
  }
</script>

<div class="task-images">
  <div class="task-images-header">
    <h2>이미지 목록</h2>
    
    <!-- 필터링 및 정렬 컨트롤 -->
    <div class="filters">
      <div class="search-box">
        <input 
          type="text" 
          placeholder="이미지 검색..." 
          bind:value={searchQuery}
        />
      </div>
      
      <div class="filter-controls">
        <select bind:value={processingStatus}>
          <option value={undefined}>모든 상태</option>
          <option value={1}>처리 대기</option>
          <option value={2}>처리 중</option>
          <option value={3}>처리 완료</option>
          <option value={0}>처리 실패</option>
        </select>
        
        <select bind:value={sortBy}>
          <option value="createdAt">날짜</option>
          <option value="fileSize">파일 크기</option>
          <option value="fileName">파일명</option>
        </select>
        
        <select bind:value={sortOrder}>
          <option value="desc">내림차순</option>
          <option value="asc">오름차순</option>
        </select>
      </div>
    </div>
    
    <!-- 업로드 버튼 -->
    {#if showUploadButton}
      <div class="upload-button-container">
        <ImageUpload {taskId} on:uploadComplete={handleUploadComplete} />
      </div>
    {/if}
  </div>
  
  <!-- 이미지 목록 표시 -->
  <div class="task-images-content">
    {#if loading}
      <div class="loading">이미지를 불러오는 중...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else if filteredImages.length === 0}
      <div class="empty-state">
        <p>이미지가 없습니다.</p>
        {#if showUploadButton}
          <p>새 이미지를 업로드해보세요.</p>
        {/if}
      </div>
    {:else}
      <div class="image-grid">
        {#each filteredImages as image (image.id)}
          <div 
            class="image-card-wrapper" 
            on:click={() => handleImageClick(image)} 
            on:keydown={(e) => handleImageKeyDown(e, image)} 
            role="button" 
            tabindex="0"
            aria-label={`이미지: ${image.fileName}`}
          >
            <ImageCard {image} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- 이미지 상세 모달 -->
  {#if showModal && selectedImage}
    <ImageModal 
      image={selectedImage} 
      on:close={handleCloseModal}
      on:delete={handleImageDelete}
    />
  {/if}
</div>

<style>
  .task-images {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .task-images-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
  
  .search-box input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 200px;
  }
  
  .filter-controls {
    display: flex;
    gap: 0.5rem;
  }
  
  .filter-controls select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .image-card-wrapper {
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .image-card-wrapper:hover {
    transform: translateY(-5px);
  }
  
  .loading, .error, .empty-state {
    padding: 2rem;
    text-align: center;
    color: #666;
  }
  
  .error {
    color: #e74c3c;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
</style> 