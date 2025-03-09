<script lang="ts">
  export let code: string = '';
</script>

<div class="code-block">
  <pre><code>{code}</code></pre>
</div>

<style>
  .code-block {
    background-color: var(--color-main-bg);
    border-radius: 4px;
    padding: 15px;
    overflow-x: auto;
    border: 1px solid var(--color-border);
  }
  
  pre {
    margin: 0;
    font-family: monospace;
    font-size: 14px;
    color: var(--color-text-primary);
  }
  
  code {
    font-family: monospace;
  }
</style> 