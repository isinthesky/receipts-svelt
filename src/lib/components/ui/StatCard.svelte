<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let change: string = '';
  export let isIncrease: boolean = true;
</script>

<div class="stat-card">
  <h3>{title}</h3>
  <div class="stat-value">{value}</div>
  {#if change}
    <div class="stat-change {isIncrease ? 'increase' : 'decrease'}">{isIncrease ? '↑' : '↓'} {change}</div>
  {/if}
</div>

<style>
  .stat-card {
    background-color: var(--color-content-bg);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--color-shadow);
    padding: 16px;
    border: 1px solid var(--color-border);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px var(--color-shadow);
  }
  
  .stat-card h3 {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 16px;
  }
  
  .stat-value {
    font-size: 32px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }
  
  .stat-change {
    font-size: 14px;
  }
  
  .increase {
    color: #10b981;
  }
  
  .decrease {
    color: #ef4444;
  }
</style> 