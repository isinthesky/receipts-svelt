<script lang="ts">
  import { onMount } from 'svelte';
  import { imageStore } from '$lib/stores/images';
  import { imageAPI } from '$lib/api/image';
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
  let processingImageId: string | null = null;

  // 처리 상태 텍스트 반환 함수
  function getProcessingStatusText(status: number): string {
    switch (status) {
      case 0: return '처리 실패';
      case 1: return '처리 대기';
      case 2: return '처리 중';
      case 3: return '처리 완료';
      default: return '알 수 없음';
    }
  }

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
    // 업로드 완료 후 처리 대기(1) 상태로 필터링
    processingStatus = 1;
    updateFilterOptions();
    loadImages();
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

  // 영수증 영역 생성 함수
  async function createReceiptArea(imageId: string) {
    if (processingImageId === imageId) return;
    
    processingImageId = imageId;
    
    try {
      // 이미지 상태 업데이트 (처리 중)
      await updateImageStatus(imageId, 2);
      
      // 처리 중 상태로 필터링
      processingStatus = 2;
      updateFilterOptions();
      
      // API 호출
      await imageAPI.createReceiptArea(imageId, taskId);
      
      // 이미지 상태 업데이트 (처리 완료)
      await updateImageStatus(imageId, 3);
      
      // 처리 완료 상태로 필터링
      processingStatus = 3;
      updateFilterOptions();
      
      alert('영수증 영역 생성이 완료되었습니다.');
    } catch (err) {
      console.error('영수증 영역 생성 오류:', err);
      alert(err instanceof Error ? err.message : '영수증 영역 생성에 실패했습니다.');
      // 이미지 상태 업데이트 (처리 실패)
      await updateImageStatus(imageId, 0);
      
      // 처리 실패 상태로 필터링
      processingStatus = 0;
      updateFilterOptions();
    } finally {
      processingImageId = null;
      // 이미지 목록 새로고침
      loadImages();
    }
  }

  // 영수증 영역 선택 함수
  async function selectReceiptArea(imageId: string) {
    if (processingImageId === imageId) return;
    
    processingImageId = imageId;
    
    try {
      // 이미지 상태 업데이트 (처리 중)
      await updateImageStatus(imageId, 2);
      
      // 처리 중 상태로 필터링
      processingStatus = 2;
      updateFilterOptions();
      
      // API 호출
      await imageAPI.selectReceiptArea(imageId);
      
      // 이미지 상태 업데이트 (처리 완료)
      await updateImageStatus(imageId, 3);
      
      // 처리 완료 상태로 필터링
      processingStatus = 3;
      updateFilterOptions();
      
      alert('영수증 영역 선택이 완료되었습니다.');
    } catch (err) {
      console.error('영수증 영역 선택 오류:', err);
      alert(err instanceof Error ? err.message : '영수증 영역 선택에 실패했습니다.');
      // 이미지 상태 업데이트 (처리 실패)
      await updateImageStatus(imageId, 0);
      
      // 처리 실패 상태로 필터링
      processingStatus = 0;
      updateFilterOptions();
    } finally {
      processingImageId = null;
      // 이미지 목록 새로고침
      loadImages();
    }
  }

  // 영수증 문자열 추출 함수
  async function extractOcr(imageId: string) {
    if (processingImageId === imageId) return;
    
    processingImageId = imageId;
    
    try {
      // 이미지 상태 업데이트 (처리 중)
      await updateImageStatus(imageId, 2);
      
      // 처리 중 상태로 필터링
      processingStatus = 2;
      updateFilterOptions();
      
      // API 호출
      await imageAPI.extractOcr(imageId);
      
      // 이미지 상태 업데이트 (처리 완료)
      await updateImageStatus(imageId, 3);
      
      // 처리 완료 상태로 필터링
      processingStatus = 3;
      updateFilterOptions();
      
      alert('문자열 추출이 완료되었습니다.');
    } catch (err) {
      console.error('문자열 추출 오류:', err);
      alert(err instanceof Error ? err.message : '문자열 추출에 실패했습니다.');
      // 이미지 상태 업데이트 (처리 실패)
      await updateImageStatus(imageId, 0);
      
      // 처리 실패 상태로 필터링
      processingStatus = 0;
      updateFilterOptions();
    } finally {
      processingImageId = null;
      // 이미지 목록 새로고침
      loadImages();
    }
  }

  // 이미지 상태 업데이트 함수
  async function updateImageStatus(imageId: string, status: number) {
    try {
      // 이미지 스토어를 통해 상태 업데이트
      await imageStore.updateImageStatus(imageId, status);
      // 필터링된 이미지 목록 업데이트
      updateFilteredImages();
    } catch (err) {
      console.error('이미지 상태 업데이트 오류:', err);
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
        <select bind:value={processingStatus} class="status-select">
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
  
  <!-- 현재 필터링 상태 표시 -->
  {#if processingStatus !== undefined}
    <div class="current-filter">
      <span class="filter-label">현재 필터:</span>
      <span class={`status-badge status-${processingStatus}`}>
        {getProcessingStatusText(processingStatus)}
      </span>
      <button 
        class="clear-filter-button" 
        on:click={() => {
          processingStatus = undefined;
          updateFilterOptions();
        }}
      >
        필터 초기화
      </button>
    </div>
  {/if}
  
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
          <div class="image-card-container">
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
            
            <div class="image-actions">
              <button 
                class="action-button create-area" 
                on:click|stopPropagation={(e) => {
                  e.stopPropagation();
                  createReceiptArea(image.id);
                }}
                disabled={processingImageId === image.id || image.processingStatus === 2}
                aria-label="영수증 영역 생성"
              >
                영역 생성
              </button>
              
              <button 
                class="action-button select-area" 
                on:click|stopPropagation={(e) => {
                  e.stopPropagation();
                  selectReceiptArea(image.id);
                }}
                disabled={processingImageId === image.id || image.processingStatus === 2}
                aria-label="영수증 영역 선택"
              >
                영역 선택
              </button>
              
              <button 
                class="action-button extract-ocr" 
                on:click|stopPropagation={(e) => {
                  e.stopPropagation();
                  extractOcr(image.id);
                }}
                disabled={processingImageId === image.id || image.processingStatus === 2}
                aria-label="문자열 추출"
              >
                문자열 추출
              </button>
            </div>
            
            {#if processingImageId === image.id}
              <div class="processing-overlay">
                <div class="spinner"></div>
                <span>처리 중...</span>
              </div>
            {/if}
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
  
  .status-select {
    border-left-width: 4px;
  }
  
  .status-select option[value="0"] {
    border-left: 4px solid #E74C3C;
  }
  
  .status-select option[value="1"] {
    border-left: 4px solid #666;
  }
  
  .status-select option[value="2"] {
    border-left: 4px solid #F39C12;
  }
  
  .status-select option[value="3"] {
    border-left: 4px solid #2ECC71;
  }
  
  .current-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .filter-label {
    font-weight: 500;
    color: #666;
  }
  
  .status-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-0 {
    background-color: #FDEDEB;
    color: #E74C3C;
  }
  
  .status-1 {
    background-color: #f5f5f5;
    color: #666;
  }
  
  .status-2 {
    background-color: #FEF9E7;
    color: #F39C12;
  }
  
  .status-3 {
    background-color: #E8F5E9;
    color: #2ECC71;
  }
  
  .clear-filter-button {
    margin-left: auto;
    padding: 0.25rem 0.5rem;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }
  
  .clear-filter-button:hover {
    background-color: #e5e5e5;
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .image-card-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .image-card-wrapper {
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .image-card-wrapper:hover {
    transform: translateY(-5px);
  }
  
  .image-actions {
    display: flex;
    justify-content: space-between;
    gap: 0.25rem;
  }
  
  .action-button {
    flex: 1;
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
  }
  
  .create-area {
    background-color: #3498db;
    color: white;
  }
  
  .create-area:hover {
    background-color: #2980b9;
  }
  
  .select-area {
    background-color: #2ecc71;
    color: white;
  }
  
  .select-area:hover {
    background-color: #27ae60;
  }
  
  .extract-ocr {
    background-color: #9b59b6;
    color: white;
  }
  
  .extract-ocr:hover {
    background-color: #8e44ad;
  }
  
  .action-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .processing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    border-radius: 8px;
    z-index: 10;
  }
  
  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
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