<script lang="ts">
  export let columns: string = 'repeat(auto-fill, minmax(250px, 1fr))';
  export let gap: string = '16px';
  export let marginBottom: string = '24px';
</script>

<div class="grid" style="grid-template-columns: {columns}; gap: {gap}; margin-bottom: {marginBottom}">
  <slot />
</div>

<style>
  .grid {
    display: grid;
  }
</style> 