<script lang="ts">
  export let message: string;
</script>

{#if message}
  <div class="error-box">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {message}
  </div>
{/if}

<style>
  .error-box {
    margin-top: 1rem;
    background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.28);
    border-radius: 6px; padding: 0.75rem 1rem;
    color: #fca5a5; font-size: 0.8rem;
    display: flex; align-items: center; gap: 0.5rem;
    box-shadow: 0 0 15px rgba(220,38,38,0.1); letter-spacing: 0.02em;
  }
</style>
