<script lang="ts">
  export let loading: boolean = false;
  export let onClick: () => void;
</script>

<button class="btn-connect" on:click={onClick} disabled={loading}>
  {#if loading}
    <span class="spinner"></span>
    <span>Conectando...</span>
  {:else}
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
    <span>Iniciar sesión con Pali Wallet</span>
  {/if}
</button>

<style>
  .btn-connect {
    width: 100%;
    padding: 0.95rem 1.5rem;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 8px 24px rgba(124,58,237,0.4);
  }
  .btn-connect:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(124,58,237,0.5);
  }
  .btn-connect:disabled { opacity: 0.5; cursor: not-allowed; }
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
