<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { imageStore } from '$lib/stores/images';
  import type { Image, ImageUploadDto } from '$lib/types/image.types';

  // 속성 정의
  export let taskId: string;
  export let multiple = true;
  export let maxFileSize = 10 * 1024 * 1024; // 10MB
  export let acceptedFileTypes = 'image/*';
  export let autoProcess = true; // 자동 영수증 영역 생성 기능

  // 상태 관리
  let uploading = false;
  let processing = false;
  let uploadProgress = 0;
  let error: string | null = null;
  let dragActive = false;
  let fileInput: HTMLInputElement;
  let uploadedImages: Image[] = [];

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

  // 영수증 영역 자동 생성 함수
  async function processUploadedImages() {
    if (!uploadedImages.length || processing) return;
    
    processing = true;
    error = null;
    
    try {
      for (const image of uploadedImages) {
        // imageStore의 createReceiptArea 함수 사용 - 이미지 상태 업데이트 및 반환된 이미지 정보 스토어에 저장
        const updatedImage = await imageStore.createReceiptArea(image.id, taskId);
        
        if (!updatedImage) {
          console.error(`이미지 ID ${image.id}의 영수증 영역 생성에 실패했습니다.`);
        }
      }
      
      // 처리 완료 후 이벤트 발생
      dispatch('processComplete', { images: uploadedImages });
      
      // 업로드 이미지 목록 초기화
      uploadedImages = [];
    } catch (err) {
      error = err instanceof Error ? err.message : '영수증 영역 생성에 실패했습니다.';
    } finally {
      processing = false;
    }
  }

  // 파일 처리 함수
  async function handleFiles(files: FileList) {
    if (uploading || processing) return;
    
    error = null;
    uploadedImages = []; // 업로드 이미지 초기화
    
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
        
        const uploadedImage = await imageStore.uploadImage(taskId, imageData);
        if (uploadedImage) {
          uploadedImages.push(uploadedImage);
        }
        uploadProgress = 100;
      }
      
      // 입력 필드 초기화
      if (fileInput) {
        fileInput.value = '';
      }
      
      // 업로드 완료 이벤트 발생
      dispatch('uploadComplete', { images: uploadedImages });
      
      // 자동 영수증 영역 생성 옵션이 활성화된 경우
      if (autoProcess && uploadedImages.length > 0) {
        // 잠시 지연 후 영수증 영역 생성 시작 (업로드와 처리 사이에 약간의 딜레이)
        setTimeout(() => {
          processUploadedImages();
        }, 500);
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

<div class="w-full">
  <div 
    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-6 py-6 text-center cursor-pointer transition-all duration-300
      hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800
      {dragActive ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
      {uploading || processing ? 'cursor-default border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800' : ''}"
    on:dragenter={handleDragEnter}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={!uploading && !processing ? openFileDialog : undefined}
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
      <div class="flex flex-col items-center gap-2 w-full">
        <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 transition-all duration-300" style="width: {uploadProgress}%"></div>
        </div>
        <span class="text-sm text-gray-600 dark:text-gray-400">업로드 중... {uploadProgress}%</span>
      </div>
    {:else if processing}
      <div class="flex flex-col items-center gap-2 w-full">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">영수증 영역 생성 중...</span>
      </div>
    {:else}
      <div class="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span class="text-base font-medium">
          {#if dragActive}
            파일을 놓아서 업로드
          {:else}
            클릭하거나 파일을 끌어다 놓으세요
          {/if}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-500">
          최대 {maxFileSize / (1024 * 1024)}MB, {multiple ? '여러 파일' : '단일 파일'} 업로드 가능
          {#if autoProcess}
            <br>업로드 후 자동으로 영수증 영역 생성이 진행됩니다
          {/if}
        </span>
      </div>
    {/if}
  </div>
  
  {#if error}
    <div class="mt-2 text-sm text-red-600 dark:text-red-400">
      {error}
    </div>
  {/if}
</div>
