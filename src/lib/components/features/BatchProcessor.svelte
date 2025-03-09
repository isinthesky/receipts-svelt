<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let isProcessing: boolean = false;
  export let progress: number = 0;
  export let totalImages: number = 0;
  export let processedImages: number = 0;
  
  const dispatch = createEventDispatcher();
  
  function handleStart() {
    dispatch('start');
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function handleReset() {
    dispatch('reset');
  }
</script>

<div class="batch-processor">
  <div class="controls">
    <button 
      class="control-btn start-btn" 
      on:click={handleStart} 
      disabled={isProcessing || totalImages === 0}
    >
      시작
    </button>
    
    <button 
      class="control-btn cancel-btn" 
      on:click={handleCancel} 
      disabled={!isProcessing}
    >
      취소
    </button>
    
    <button 
      class="control-btn reset-btn" 
      on:click={handleReset} 
      disabled={isProcessing}
    >
      초기화
    </button>
  </div>
  
  {#if totalImages > 0}
    <div class="progress-container">
      <div class="progress-info">
        <span>진행 상황: {processedImages}/{totalImages} ({progress}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .batch-processor {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  .controls {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .control-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .start-btn {
    background-color: #4caf50;
    color: white;
  }
  
  .cancel-btn {
    background-color: #f44336;
    color: white;
  }
  
  .reset-btn {
    background-color: #2196f3;
    color: white;
  }
  
  .progress-container {
    margin-top: 10px;
  }
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  .progress-bar {
    height: 20px;
    background-color: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
  }
</style>
