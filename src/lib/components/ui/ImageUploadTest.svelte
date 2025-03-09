<script lang="ts">
  import { onMount } from 'svelte';
  import { imageStore } from '$lib/stores/images';
  import type { Image } from '$lib/types/image.types';
  
  // 테스트용 태스크 ID (실제 존재하는 태스크 ID로 변경 필요)
  export let taskId: string = '';
  
  // 상태 관리
  let file: File | null = null;
  let description: string = '';
  let uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  let errorMessage: string = '';
  let uploadedImage: Image | null = null;
  let uploadProgress: number = 0;
  let taskImages: Image[] = [];
  let loading: boolean = false;
  
  // 파일 선택 핸들러
  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      file = target.files[0];
    }
  }
  
  // 이미지 업로드 함수
  async function uploadImage() {
    if (!file) {
      errorMessage = '파일을 선택해주세요.';
      return;
    }
    
    if (!taskId) {
      errorMessage = '태스크 ID가 필요합니다.';
      return;
    }
    
    uploadStatus = 'uploading';
    errorMessage = '';
    
    try {
      const result = await imageStore.uploadImage(taskId, {
        file,
        description: description || undefined
      });
      
      if (result) {
        uploadedImage = result;
        uploadStatus = 'success';
        // 업로드 성공 후 이미지 목록 다시 로드
        loadImages();
      } else {
        throw new Error('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      uploadStatus = 'error';
      errorMessage = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
    }
  }
  
  // 이미지 목록 로드 함수
  async function loadImages() {
    if (!taskId) return;
    
    loading = true;
    try {
      const images = await imageStore.loadImagesByTaskId(taskId);
      taskImages = images;
    } catch (error) {
      console.error('Error loading images:', error);
      errorMessage = error instanceof Error ? error.message : '이미지를 불러오는데 실패했습니다.';
    } finally {
      loading = false;
    }
  }
  
  // 업로드 진행률 구독
  $: uploadProgress = $imageStore.uploadProgress;
  
  // 컴포넌트 마운트 시 이미지 목록 로드
  onMount(() => {
    if (taskId) {
      loadImages();
    }
  });
</script>

<div class="image-upload-test">
  <h2>이미지 업로드 테스트</h2>
  
  {#if !taskId}
    <div class="alert alert-warning">
      <p>테스트를 위해 태스크 ID가 필요합니다.</p>
    </div>
  {:else}
    <div class="upload-form">
      <div class="form-group">
        <label for="file-input">이미지 파일 선택</label>
        <input 
          type="file" 
          id="file-input" 
          accept="image/*" 
          on:change={handleFileChange} 
          disabled={uploadStatus === 'uploading'}
        />
        {#if file}
          <p class="file-info">선택된 파일: {file.name} ({Math.round(file.size / 1024)} KB)</p>
        {/if}
      </div>
      
      <div class="form-group">
        <label for="description-input">설명 (선택사항)</label>
        <textarea 
          id="description-input" 
          bind:value={description} 
          placeholder="이미지에 대한 설명을 입력하세요" 
          disabled={uploadStatus === 'uploading'}
        ></textarea>
      </div>
      
      <button 
        class="upload-button" 
        on:click={uploadImage} 
        disabled={!file || uploadStatus === 'uploading'}
      >
        {uploadStatus === 'uploading' ? '업로드 중...' : '이미지 업로드'}
      </button>
      
      {#if uploadStatus === 'uploading'}
        <div class="progress-container">
          <div class="progress-bar" style="width: {uploadProgress}%"></div>
          <span class="progress-text">{uploadProgress}%</span>
        </div>
      {/if}
      
      {#if errorMessage}
        <div class="alert alert-error">
          <p>{errorMessage}</p>
        </div>
      {/if}
      
      {#if uploadStatus === 'success' && uploadedImage}
        <div class="alert alert-success">
          <p>이미지가 성공적으로 업로드되었습니다!</p>
          <div class="uploaded-image-info">
            <p><strong>파일명:</strong> {uploadedImage.fileName}</p>
            <p><strong>파일 크기:</strong> {Math.round(uploadedImage.fileSize / 1024)} KB</p>
            <p><strong>업로드 시간:</strong> {new Date(uploadedImage.createdAt).toLocaleString('ko-KR')}</p>
          </div>
        </div>
      {/if}
    </div>
    
    <div class="images-list">
      <h3>태스크 이미지 목록</h3>
      
      {#if loading}
        <p>이미지를 불러오는 중...</p>
      {:else if taskImages.length === 0}
        <p>이미지가 없습니다.</p>
      {:else}
        <div class="image-grid">
          {#each taskImages as image}
            <div class="image-item">
              {#if image.thumbnailUrl}
                <img src={`${image.thumbnailUrl}`} alt={image.fileName} />
              {:else}
                <div class="placeholder-image">
                  <span>🧾</span>
                </div>
              {/if}
              <div class="image-details">
                <p class="image-name">{image.fileName}</p>
                <p class="image-date">{new Date(image.createdAt).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      
      <button class="refresh-button" on:click={loadImages} disabled={loading}>
        이미지 목록 새로고침
      </button>
    </div>
  {/if}
</div>

<style>
  .image-upload-test {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: var(--color-text-primary);
  }
  
  h3 {
    font-size: 20px;
    margin: 30px 0 15px;
    color: var(--color-text-primary);
  }
  
  .upload-form {
    background-color: var(--color-content-bg);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px var(--color-shadow);
    margin-bottom: 30px;
    border: 1px solid var(--color-border);
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  input[type="file"] {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-main-bg);
  }
  
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    min-height: 100px;
    resize: vertical;
    background-color: var(--color-main-bg);
    color: var(--color-text-primary);
  }
  
  .file-info {
    margin-top: 5px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  
  .upload-button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .upload-button:hover {
    background-color: #2563eb;
  }
  
  .upload-button:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
  
  .progress-container {
    margin-top: 15px;
    background-color: var(--color-main-bg);
    border-radius: 4px;
    height: 20px;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--color-border);
  }
  
  .progress-bar {
    height: 100%;
    background-color: #3b82f6;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }
  
  .alert {
    padding: 15px;
    border-radius: 4px;
    margin: 15px 0;
  }
  
  .alert-warning {
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #f59e0b;
  }
  
  .alert-error {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #ef4444;
  }
  
  .alert-success {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #10b981;
  }
  
  .uploaded-image-info {
    margin-top: 10px;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }
  
  .uploaded-image-info p {
    margin: 5px 0;
  }
  
  .images-list {
    background-color: var(--color-content-bg);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px var(--color-shadow);
    border: 1px solid var(--color-border);
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 15px;
  }
  
  .image-item {
    border: 1px solid var(--color-border);
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--color-main-bg);
  }
  
  .image-item img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    display: block;
  }
  
  .placeholder-image {
    width: 100%;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    background-color: var(--color-main-bg);
    color: var(--color-text-secondary);
  }
  
  .image-details {
    padding: 10px;
  }
  
  .image-name {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text-primary);
  }
  
  .image-date {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin: 5px 0 0;
  }
  
  .refresh-button {
    margin-top: 15px;
    background-color: var(--color-main-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .refresh-button:hover {
    background-color: var(--color-border);
  }
  
  .refresh-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style> 