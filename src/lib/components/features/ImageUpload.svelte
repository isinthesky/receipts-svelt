<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { imageStore } from '$lib/stores/images';
  import type { ImageUploadDto } from '$lib/types/image.types';

  // 속성 정의
  export let taskId: string;
  export let multiple = true;
  export let maxFileSize = 10 * 1024 * 1024; // 10MB
  export let acceptedFileTypes = 'image/*';

  // 상태 관리
  let uploading = false;
  let uploadProgress = 0;
  let error: string | null = null;
  let dragActive = false;
  let fileInput: HTMLInputElement;

  // 이벤트 디스패처 생성
  const dispatch = createEventDispatcher();

  // 파일 선택 핸들러
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      handleFiles(input.files);
    }
  }

  // 드래그 이벤트 핸들러
  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragActive = true;
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragActive = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragActive = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragActive = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  }

  // 파일 처리 함수
  async function handleFiles(files: FileList) {
    if (uploading) return;
    
    error = null;
    
    // 다중 업로드가 아닌 경우 첫 번째 파일만 처리
    const filesToUpload = multiple ? Array.from(files) : [files[0]];
    
    // 파일 유효성 검사
    for (const file of filesToUpload) {
      // 파일 크기 검사
      if (file.size > maxFileSize) {
        error = `파일 크기가 너무 큽니다. 최대 ${maxFileSize / (1024 * 1024)}MB까지 업로드 가능합니다.`;
        return;
      }
      
      // 파일 타입 검사
      if (!file.type.startsWith('image/')) {
        error = '이미지 파일만 업로드 가능합니다.';
        return;
      }
    }
    
    // 파일 업로드
    uploading = true;
    uploadProgress = 0;
    
    try {
      for (const file of filesToUpload) {
        const imageData: ImageUploadDto = {
          file,
          description: ''
        };
        
        await imageStore.uploadImage(taskId, imageData);
        uploadProgress = 100;
      }
      
      // 업로드 완료 이벤트 발생
      dispatch('uploadComplete');
      
      // 입력 필드 초기화
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
    } finally {
      uploading = false;
      setTimeout(() => {
        uploadProgress = 0;
      }, 1000);
    }
  }

  // 파일 선택 다이얼로그 열기
  function openFileDialog() {
    if (fileInput) {
      fileInput.click();
    }
  }

  // 키보드 이벤트 핸들러 추가
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      openFileDialog();
      event.preventDefault();
    }
  }
</script>

<div class="image-upload">
  <div 
    class="dropzone"
    class:active={dragActive}
    class:uploading={uploading}
    on:dragenter={handleDragEnter}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={openFileDialog}
    on:keydown={handleKeyDown}
    role="button"
    tabindex="0"
    aria-label="파일 업로드 영역. 클릭하거나 파일을 끌어다 놓으세요."
  >
    <input 
      type="file" 
      bind:this={fileInput}
      on:change={handleFileSelect}
      accept={acceptedFileTypes}
      multiple={multiple}
      style="display: none;"
    />
    
    {#if uploading}
      <div class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {uploadProgress}%"></div>
        </div>
        <span class="progress-text">업로드 중... {uploadProgress}%</span>
      </div>
    {:else}
      <div class="upload-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span class="upload-text">
          {#if dragActive}
            파일을 놓아서 업로드
          {:else}
            클릭하거나 파일을 끌어다 놓으세요
          {/if}
        </span>
        <span class="upload-hint">
          최대 {maxFileSize / (1024 * 1024)}MB, {multiple ? '여러 파일' : '단일 파일'} 업로드 가능
        </span>
      </div>
    {/if}
  </div>
  
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}
</div>

<style>
  .image-upload {
    width: 100%;
  }
  
  .dropzone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f9f9f9;
  }
  
  .dropzone:hover {
    border-color: #4A90E2;
    background-color: #f0f7ff;
  }
  
  .dropzone.active {
    border-color: #4A90E2;
    background-color: #e6f2ff;
  }
  
  .dropzone.uploading {
    cursor: default;
    border-color: #4A90E2;
    background-color: #f0f7ff;
  }
  
  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #666;
  }
  
  .upload-text {
    font-size: 16px;
    font-weight: 500;
  }
  
  .upload-hint {
    font-size: 12px;
    color: #999;
  }
  
  .upload-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  
  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #4A90E2;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 14px;
    color: #666;
  }
  
  .error-message {
    margin-top: 8px;
    color: #E74C3C;
    font-size: 14px;
  }
</style> 