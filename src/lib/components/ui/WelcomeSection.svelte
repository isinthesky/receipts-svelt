<script lang="ts">
  export let username: string = '사용자';
</script>

<div class="welcome-section">
  <h1>안녕하세요, {username}님!</h1>
  <p>오늘의 대시보드 요약입니다.</p>
</div>

<style>
  .welcome-section {
    margin-bottom: 24px;
  }
  
  .welcome-section h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }
  
  .welcome-section p {
    font-size: 16px;
    color: var(--color-text-secondary);
  }
</style> 