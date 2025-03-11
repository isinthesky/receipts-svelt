<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Image } from '$lib/types/image.types';

  // 속성 정의
  export let image: Image;
  const IMAGE_API_URL = "http://facreport.iptime.org:5008";
  
  // 이벤트 디스패처 생성
  const dispatch = createEventDispatcher();

  // 모달 닫기 핸들러
  function handleClose() {
    dispatch('close');
  }

  // 이미지 삭제 핸들러
  function handleDelete() {
    if (confirm('이미지를 삭제하시겠습니까?')) {
      dispatch('delete', { imageId: image.id });
    }
  }

  // 파일 크기 포맷팅 함수
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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

  // 처리 상태 클래스 반환 함수
  function getProcessingStatusClass(status: number): string {
    switch (status) {
      case 0: return 'status-failed';
      case 1: return 'status-pending';
      case 2: return 'status-processing';
      case 3: return 'status-completed';
      default: return '';
    }
  }

  // 날짜 포맷팅 - date-fns 대체 함수
  function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${year}년 ${month}월 ${day}일 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // 상대적 시간 포맷팅 함수
  function formatRelativeTime(dateString: string | null): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}개월 전`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years}년 전`;
    }
  }

  // 날짜 포맷팅
  const formattedDate = image.createdAt 
    ? formatDate(image.createdAt)
    : '';
  
  const relativeDate = image.createdAt 
    ? formatRelativeTime(image.createdAt)
    : '';

  // 이미지 URL 결정 - rectUrl이 있으면 우선 사용, 아니면 thumbnailUrl 사용
  $: imageUrl = image.rectUrl 
    ? `${IMAGE_API_URL}/${image.rectUrl}` 
    : image.thumbnailUrl 
      ? `${IMAGE_API_URL}/${image.thumbnailUrl}` 
      : null;

  // 키보드 이벤트 핸들러 추가
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    } else if (event.key === 'Enter' || event.key === ' ') {
      handleClose();
    }
  }
</script>

<div class="modal-backdrop" on:click={handleClose} on:keydown={handleKeyDown} role="dialog" aria-modal="true" tabindex="0">
  <div 
    class="modal-content" 
    on:click|stopPropagation 
    on:keydown|stopPropagation={handleKeyDown}
    role="document"
    aria-label="이미지 상세 정보"
  >
    <div class="modal-header">
      <h2 class="modal-title">{image.fileName}</h2>
      <button class="close-button" on:click={handleClose} aria-label="닫기">×</button>
    </div>
    
    <div class="modal-body">
      <div class="image-container">
        {#if imageUrl}
          <img src={imageUrl} alt={image.fileName} />
        {:else}
          <div class="no-image">
            <span>이미지를 불러올 수 없습니다.</span>
          </div>
        {/if}
      </div>
      
      <div class="image-details">
        <div class="detail-section">
          <h3>이미지 정보</h3>
          
          <div class="detail-item">
            <span class="detail-label">파일명:</span>
            <span class="detail-value">{image.fileName}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">파일 크기:</span>
            <span class="detail-value">{formatFileSize(image.fileSize)}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">파일 유형:</span>
            <span class="detail-value">{image.fileType}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">업로드 날짜:</span>
            <span class="detail-value" title={formattedDate}>{relativeDate}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">처리 상태:</span>
            <span class={`status-badge ${getProcessingStatusClass(image.processingStatus)}`}>
              {getProcessingStatusText(image.processingStatus)}
            </span>
          </div>
          
          {#if image.description}
            <div class="detail-item description">
              <span class="detail-label">설명:</span>
              <span class="detail-value">{image.description}</span>
            </div>
          {/if}
        </div>
        
        <div class="detail-section">
          <h3>영수증 정보</h3>
          
          {#if image.receiptCount > 0}
            <div class="detail-item">
              <span class="detail-label">영수증 개수:</span>
              <span class="detail-value">{image.receiptCount}개</span>
            </div>
            
            <!-- 영수증 목록은 별도 컴포넌트로 구현 예정 -->
            <div class="receipt-list-placeholder">
              <p>영수증 목록 표시 영역</p>
            </div>
          {:else}
            <p class="no-receipts">인식된 영수증이 없습니다.</p>
          {/if}
        </div>
      </div>
    </div>
    
    <div class="modal-footer">
      <button class="button secondary" on:click={handleClose}>닫기</button>
      <button class="button danger" on:click={handleDelete}>삭제</button>
    </div>
  </div>
</div>

<style>
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
    max-width: 1000px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }
  
  .modal-body {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 16px;
    gap: 16px;
  }
  
  @media (min-width: 768px) {
    .modal-body {
      flex-direction: row;
    }
  }
  
  .image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
    min-height: 300px;
  }
  
  .image-container img {
    max-width: 100%;
    max-height: 500px;
    object-fit: contain;
  }
  
  .no-image {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    width: 100%;
    color: #999;
  }
  
  .image-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .detail-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-section h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  
  .detail-item {
    display: flex;
    gap: 8px;
    font-size: 14px;
  }
  
  .detail-label {
    font-weight: 500;
    color: #666;
    min-width: 100px;
  }
  
  .detail-value {
    color: #333;
  }
  
  .description {
    flex-direction: column;
    margin-top: 8px;
  }
  
  .description .detail-value {
    margin-top: 4px;
    white-space: pre-wrap;
  }
  
  .status-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-pending {
    background-color: #f5f5f5;
    color: #666;
  }
  
  .status-processing {
    background-color: #FEF9E7;
    color: #F39C12;
  }
  
  .status-completed {
    background-color: #E8F5E9;
    color: #2ECC71;
  }
  
  .status-failed {
    background-color: #FDEDEB;
    color: #E74C3C;
  }
  
  .receipt-list-placeholder {
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 16px;
    text-align: center;
    color: #999;
    margin-top: 8px;
  }
  
  .no-receipts {
    color: #999;
    font-style: italic;
  }
  
  .modal-footer {
    padding: 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  
  .button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }
  
  .secondary {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .danger {
    background-color: #E74C3C;
    color: white;
  }
</style>
