<script lang="ts">
  import { goto }        from '$app/navigation';
  import PublicFaucet    from '$lib/components/ui/PublicFaucet.svelte';
  import FaucetHistory   from '$lib/components/ui/FaucetHistory.svelte';

  export const params = {};

  let activeTab: 'faucet' | 'history' = 'faucet';
</script>

<div class="faucet-page">

  <!-- Header de la página -->
  <header class="fp-page-header">
    <button class="fp-back-btn" type="button" on:click={() => goto('/')} aria-label="Volver al inicio">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Inicio
    </button>

    <div class="fp-page-title-block">
      <div class="fp-page-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div>
        <h1 class="fp-page-title">FAUCET PÚBLICO</h1>
        <p class="fp-page-sub">Solicita tokens de prueba · Sin inicio de sesión</p>
      </div>
    </div>
  </header>

  <!-- Navegación entre tabs -->
  <nav class="fp-tabs-nav" aria-label="Secciones del faucet">
    <button
      class="fp-tab-btn"
      class:active={activeTab === 'faucet'}
      type="button"
      on:click={() => activeTab = 'faucet'}
      aria-current={activeTab === 'faucet' ? 'page' : undefined}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      Solicitar Fondos
    </button>
    <button
      class="fp-tab-btn"
      class:active={activeTab === 'history'}
      type="button"
      on:click={() => activeTab = 'history'}
      aria-current={activeTab === 'history' ? 'page' : undefined}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      Historial
    </button>
  </nav>

  <!-- Contenido del tab activo -->
  <main class="fp-content">
    {#if activeTab === 'faucet'}
      <div class="fp-card">
        <PublicFaucet />
      </div>
    {:else}
      <div class="fp-card">
        <FaucetHistory />
      </div>
    {/if}
  </main>

  <!-- Nota informativa -->
  <footer class="fp-page-footer">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.4)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    El faucet usa un smart contract on-chain · Necesitas una wallet en el navegador para firmar la transacción · Los tokens son de red de prueba y no tienen valor real
  </footer>

</div>

<style>
  .faucet-page {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 1rem 3rem;
    gap: 1.25rem;
  }

  /* Header */
  .fp-page-header {
    width: 100%;
    max-width: 680px;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .fp-back-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.9rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(226,232,240,0.7);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    transition: background 0.2s, color 0.2s;
  }
  .fp-back-btn:hover {
    background: rgba(255,255,255,0.08);
    color: var(--n-white);
  }

  .fp-page-title-block {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex: 1;
  }
  .fp-page-icon {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.07));
    border: 1px solid rgba(245,158,11,0.22);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 20px rgba(245,158,11,0.15);
  }
  .fp-page-title {
    font-family: 'Pirata One', cursive;
    font-size: 1.6rem;
    font-weight: 900;
    color: var(--n-white);
    letter-spacing: 0.06em;
    text-shadow: 0 0 20px rgba(245,158,11,0.3);
  }
  .fp-page-sub {
    font-size: 0.72rem;
    color: rgba(245,158,11,0.55);
    margin-top: 0.2rem;
    letter-spacing: 0.06em;
  }

  /* Tabs nav */
  .fp-tabs-nav {
    width: 100%;
    max-width: 680px;
    display: flex;
    gap: 0.5rem;
    padding: 0.35rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
  }
  .fp-tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.65rem;
    border-radius: 9px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: rgba(226,232,240,0.5);
    background: transparent;
    border: 1px solid transparent;
    transition: all 0.2s;
  }
  .fp-tab-btn:hover {
    color: rgba(226,232,240,0.8);
    background: rgba(255,255,255,0.04);
  }
  .fp-tab-btn.active {
    background: rgba(245,158,11,0.1);
    border-color: rgba(245,158,11,0.25);
    color: var(--n-gold2);
    box-shadow: 0 4px 16px rgba(245,158,11,0.1);
  }

  /* Card de contenido */
  .fp-content {
    width: 100%;
    max-width: 680px;
  }
  .fp-card {
    background: rgba(10,14,26,0.92);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 20px;
    padding: 1.75rem;
    backdrop-filter: blur(16px);
    box-shadow:
      0 0 30px rgba(245,158,11,0.06),
      0 24px 56px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(245,158,11,0.08);
  }

  /* Footer */
  .fp-page-footer {
    width: 100%;
    max-width: 680px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.65rem;
    color: rgba(245,158,11,0.3);
    letter-spacing: 0.06em;
    text-align: center;
    justify-content: center;
    line-height: 1.6;
  }

  @media (max-width: 600px) {
    .fp-card { padding: 1.25rem; }
    .fp-page-title { font-size: 1.3rem; }
  }
</style>
