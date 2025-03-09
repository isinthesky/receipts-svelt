<script lang="ts">
  export let type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' = 'text';
  export let value: string = '';
  export let placeholder: string = '';
  export let id: string = '';
  export let name: string = '';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let autocomplete: 'on' | 'off' | 'name' | 'email' | 'username' | 'current-password' | 'new-password' | 'tel' | 'url' | '' = '';
  export let label: string = '';
  export let error: string = '';
</script>

<div class="input-container">
  {#if label}
    <label for={id} class="input-label">{label}</label>
  {/if}
  
  <input
    {type}
    {id}
    {name}
    {placeholder}
    {required}
    {disabled}
    {autocomplete}
    bind:value
    class="input-field {error ? 'input-error' : ''}"
    on:input
    on:change
    on:focus
    on:blur
  />
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
</div>

<style>
  .input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .input-label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: var(--color-text-primary);
    font-size: 0.875rem;
  }
  
  .input-field {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
    background-color: var(--color-main-bg);
    color: var(--color-text-primary);
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  .input-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .input-error {
    border-color: #ef4444;
  }
  
  .input-error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
  }
  
  .error-message {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #ef4444;
  }
</style> 