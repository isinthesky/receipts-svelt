<script lang="ts">
  export let maxWidth: string = '1200px';
  export let padding: string = '24px';
</script>

<div class="container" style="max-width: {maxWidth}; padding: {padding}">
  <slot />
</div>

<style>
  .container {
    width: 100%;
    margin: 0 auto;
  }
</style> 