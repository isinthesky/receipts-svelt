<script lang="ts">
  export let spacing: string = '20px';
</script>

<form class="form" style="--spacing: {spacing}" on:submit>
  <slot />
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
  }
</style> 