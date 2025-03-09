<script lang="ts">
  export let padding: string = '20px';
  export let marginBottom: string = '30px';
</script>

<div class="card" style="padding: {padding}; margin-bottom: {marginBottom}">
  <slot />
</div>

<style>
  .card {
    background-color: var(--color-content-bg);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--color-shadow);
    border: 1px solid var(--color-border);
  }
</style> 