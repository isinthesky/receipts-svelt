<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let spacing: string = '20px';
  
  const dispatch = createEventDispatcher();
  
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    dispatch('submit', event);
  }
</script>

<form class="form" style="--spacing: {spacing}" on:submit={handleSubmit}>
  <slot />
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
  }
</style> 