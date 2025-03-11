<script lang="ts">
  import { IMAGE_STATUS } from '$lib/stores/images';
  import type { Image } from '$lib/types/image.types';

  // 속성 정의
  export let image: Image;
  const IMAGE_API_URL = "http://facreport.iptime.org:5008";

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
      case IMAGE_STATUS.DELETED: return '삭제됨';
      case IMAGE_STATUS.HIDDEN: return '숨김';
      case IMAGE_STATUS.WAITING: return '처리 대기';
      case IMAGE_STATUS.AREA_CREATING: return '영역 생성 중';
      case IMAGE_STATUS.AREA_CREATED: return '영역 생성 완료';
      case IMAGE_STATUS.AREA_SELECTING: return '영역 선택 중';
      case IMAGE_STATUS.OCR_WAITING: return 'OCR 대기';
      case IMAGE_STATUS.OCR_PROCESSING: return 'OCR 처리 중';
      case IMAGE_STATUS.COMPLETED: return '처리 완료';
      default: return '알 수 없음';
    }
  }

  // 처리 상태 클래스 반환 함수
  function getProcessingStatusClass(status: number): string {
    switch (status) {
      case IMAGE_STATUS.DELETED:
      case IMAGE_STATUS.HIDDEN:
        return 'status-hidden';
      case IMAGE_STATUS.WAITING:
        return 'status-waiting';
      case IMAGE_STATUS.AREA_CREATING:
      case IMAGE_STATUS.AREA_SELECTING:
      case IMAGE_STATUS.OCR_PROCESSING:
        return 'status-processing';
      case IMAGE_STATUS.AREA_CREATED:
      case IMAGE_STATUS.OCR_WAITING:
        return 'status-waiting-next';
      case IMAGE_STATUS.COMPLETED:
        return 'status-completed';
      default:
        return '';
    }
  }

  // 날짜 포맷팅 - date-fns 대체 함수
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
    ? formatRelativeTime(image.createdAt)
    : '';
    
  // rectUrl이 있으면 해당 이미지를 사용, 없으면 thumbnailUrl 사용
  $: displayImageUrl = image.rectUrl && image.processingStatus >= IMAGE_STATUS.AREA_CREATED
    ? `${IMAGE_API_URL}/${image.rectUrl}`
    : image.thumbnailUrl
      ? `${IMAGE_API_URL}/${image.thumbnailUrl}`
      : null;
</script>

<div class="image-card">
  <div class="image-thumbnail">
    {#if displayImageUrl}
      <img src={displayImageUrl} alt={image.fileName} />
    {:else}
      <div class="no-thumbnail">
        <span>이미지 없음</span>
      </div>
    {/if}
    
    {#if image.receiptCount > 0}
      <div class="receipt-badge">
        <span>{image.receiptCount}</span>
      </div>
    {/if}
    
    {#if image.processingStatus === IMAGE_STATUS.AREA_CREATING || 
         image.processingStatus === IMAGE_STATUS.AREA_SELECTING || 
         image.processingStatus === IMAGE_STATUS.OCR_PROCESSING}
      <div class="processing-badge">
        <span class="processing-icon"></span>
      </div>
    {/if}
  </div>
  
  <div class="image-info">
    <h3 class="image-name" title={image.fileName}>
      {image.fileName}
    </h3>
    
    <div class="image-meta">
      <span class="image-size">{formatFileSize(image.fileSize)}</span>
      <span class="image-date">{formattedDate}</span>
    </div>
    
    <div class="image-status">
      <span class={`status-badge ${getProcessingStatusClass(image.processingStatus)}`}>
        {getProcessingStatusText(image.processingStatus)}
      </span>
    </div>
  </div>
</div>

<style>
  .image-card {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: white;
    height: 100%;
    transition: box-shadow 0.3s;
  }
  
  .image-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .image-thumbnail {
    position: relative;
    height: 150px;
    overflow: hidden;
    background-color: #f5f5f5;
  }
  
  .image-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .no-thumbnail {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
  }
  
  .receipt-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: #4A90E2;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }
  
  .processing-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }
  
  .processing-icon {
    display: block;
    width: 12px;
    height: 12px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .image-info {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .image-name {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .image-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #666;
  }
  
  .image-status {
    margin-top: 8px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }
  
  .status-waiting {
    background-color: #f5f5f5;
    color: #666;
  }
  
  .status-processing {
    background-color: #FEF9E7;
    color: #F39C12;
  }
  
  .status-waiting-next {
    background-color: #E3F2FD;
    color: #2196F3;
  }
  
  .status-completed {
    background-color: #E8F5E9;
    color: #2ECC71;
  }
  
  .status-hidden {
    background-color: #FDEDEB;
    color: #E74C3C;
  }
</style>
