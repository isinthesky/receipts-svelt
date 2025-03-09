<script lang="ts">
  // date-fns 라이브러리 의존성 제거
  import type { Image } from '$lib/types/image.types';

  // 속성 정의
  export let image: Image;
  const IMAGE_API_URL = "http://facreport.iptime.org:5008";
  console.log('IMAGE_API_URL', IMAGE_API_URL);

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
</script>

<div class="image-card">
  <div class="image-thumbnail">
    {#if image.thumbnailUrl}
      <img src={`${IMAGE_API_URL}/${image.thumbnailUrl}`} alt={image.fileName} />
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
</style> 