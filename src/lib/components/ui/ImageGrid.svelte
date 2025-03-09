<script lang="ts">
  const IMAGE_API_URL = "http://facreport.iptime.org:5008";
  console.log('IMAGE_API_URL', IMAGE_API_URL);

  export let images: Array<{
    id: string;
    thumbnailUrl: string;
    fileName: string;
  }> = [];
  export let onImageClick: (imageId: string) => void;
</script>

<div class="image-grid-container">
  <div class="section-header">
    <h2>최근 이미지</h2>
    <a href="/images" class="view-all">모두 보기</a>
  </div>
  
  <div class="image-grid">
    {#if images.length === 0}
      <div class="empty-state">이미지가 없습니다.</div>
    {:else}
      {#each images as image}
        <button 
          class="image-card" 
          on:click={() => onImageClick(image.id)}
          aria-label={`이미지 ${image.fileName} 보기`}
        >
          {#if image.thumbnailUrl}
            <img src={`${IMAGE_API_URL}/${image.thumbnailUrl}`} alt={image.fileName} />
          {:else}
            <div class="placeholder-image">
              <span>🧾</span>
            </div>
          {/if}
        </button>
      {/each}
    {/if}
  </div>
</div>

<style>
  .image-grid-container {
    background-color: var(--color-content-bg);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--color-shadow);
    padding: 16px;
    border: 1px solid var(--color-border);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .view-all {
    font-size: 14px;
    color: var(--color-accent);
    text-decoration: none;
  }
  
  .view-all:hover {
    text-decoration: underline;
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .image-card {
    aspect-ratio: 1;
    background-color: var(--color-main-bg);
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
    border: none;
    padding: 0;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .image-card:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 6px var(--color-shadow);
  }
  
  .image-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: var(--color-text-secondary);
  }
  
  .empty-state {
    padding: 24px;
    text-align: center;
    color: var(--color-text-secondary);
    grid-column: 1 / -1;
  }
</style> 