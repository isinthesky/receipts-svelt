<script lang="ts">
  export let marginBottom: string = '15px';
</script>

<div class="form-group" style="margin-bottom: {marginBottom}">
  <slot />
</div>

<style>
  .form-group {
    display: flex;
    flex-direction: column;
  }
</style> 