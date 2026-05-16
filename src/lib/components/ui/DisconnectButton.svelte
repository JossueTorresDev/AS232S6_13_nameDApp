<script lang="ts">
  import { disconnectWallet } from '$lib/services/wallet.service';
</script>

<button class="btn-disconnect" on:click={disconnectWallet}>
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
  DESCONECTAR
</button>

<style>
  .btn-disconnect {
    width: 100%;
    padding: 0.8rem;
    background: transparent;
    color: var(--n-red);
    border: 1px solid rgba(220,38,38,0.32);
    border-radius: 6px;
    font-family: 'Cinzel', serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.25s;
  }

  .btn-disconnect:hover {
    background: rgba(220,38,38,0.08);
    border-color: rgba(220,38,38,0.6);
    box-shadow: 0 0 20px rgba(220,38,38,0.2);
  }
</style>
