<script lang="ts">
  export let message: string = '';
  export let showRetry: boolean = false;
  
  // 재시도 이벤트 디스패치
  function dispatchRetry() {
    dispatch('retry');
  }
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="error-container">
  <p>{message}</p>
  {#if showRetry}
    <button class="retry-button" on:click={dispatchRetry}>다시 시도</button>
  {/if}
</div>

<style>
  .error-container {
    padding: 15px;
    text-align: center;
    background-color: #fee2e2;
    color: #b91c1c;
    border-radius: 8px;
    margin: 15px 0;
    border: 1px solid #ef4444;
  }
  
  .retry-button {
    margin-top: 10px;
    padding: 8px 15px;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  
  .retry-button:hover {
    background-color: #dc2626;
  }
</style> 