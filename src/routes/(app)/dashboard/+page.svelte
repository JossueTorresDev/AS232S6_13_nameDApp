<script lang="ts">
  import { fly, fade }        from 'svelte/transition';
  import { walletStore }      from '$lib/stores/wallet.store';
  import { transactionStore } from '$lib/stores/transaction.store';
  import { sidebarStore }     from '$lib/stores/sidebar.store';
  import DashboardStats       from '$lib/components/ui/DashboardStats.svelte';

  export const params = {};

  $: networkTxCount = $transactionStore.transactions.filter(
    tx => tx.networkId === $walletStore.currentNetwork?.chainId
  ).length;
  $: hasPending = $transactionStore.transactions.some(
    tx => tx.status === 'pending' && tx.networkId === $walletStore.currentNetwork?.chainId
  );
  $: totalTxs   = networkTxCount;
  $: balance    = $walletStore.balance || '0';
  $: currency   = $walletStore.currentNetwork?.currency || 'SYS';
  $: netName    = $walletStore.currentNetwork?.name || 'RED DESCONOCIDA';
</script>

<div class="dashboard" in:fly={{ y: -16, duration: 350, delay: 0 }}>

  <!-- Título -->
  <div class="section-title">
    <div class="st-line"></div>
    <span class="st-text">GRAND LINE · PANEL DE MANDO</span>
    <div class="st-line"></div>
  </div>

  <!-- Fila superior: badge + accesos rápidos -->
  <div class="top-row">

    <!-- Badge de red -->
    <div class="connected-badge">
      <span class="pulse-dot"></span>
      CONECTADO · {netName}
      {#if networkTxCount > 0}
        <span class="badge-tx-count">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
          {networkTxCount} TX
        </span>
      {/if}
      {#if hasPending}
        <span class="pending-indicator">
          <span class="pending-dot"></span>
          TX PENDIENTE
        </span>
      {/if}
    </div>

    <!-- Accesos rápidos -->
    <div class="quick-actions">
      <button class="qa-btn wallet" on:click={() => sidebarStore.set('wallet')} aria-label="Abrir wallet">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          <circle cx="12" cy="14" r="2"/>
        </svg>
        MI WALLET
      </button>
      <button class="qa-btn tx" on:click={() => sidebarStore.set('transactions')} aria-label="Ver transacciones">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        HISTORIAL
      </button>
      <button class="qa-btn act" on:click={() => sidebarStore.set('activity')} aria-label="Ver actividad">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        ACTIVIDAD
      </button>
    </div>

  </div>

  <!-- Mini KPIs rápidos -->
  <div class="mini-kpis" in:fly={{ y: 8, duration: 300, delay: 60 }}>
    <div class="mk-card">
      <span class="mk-label">SALDO</span>
      <span class="mk-value gold">{parseFloat(balance).toFixed(4)} <span class="mk-cur">{currency}</span></span>
    </div>
    <div class="mk-card">
      <span class="mk-label">TXS TOTALES</span>
      <span class="mk-value">{totalTxs}</span>
    </div>
    <div class="mk-card">
      <span class="mk-label">RED ACTUAL</span>
      <span class="mk-value small">{netName}</span>
    </div>
    <div class="mk-card">
      <span class="mk-label">ESTADO</span>
      <span class="mk-value green">● ONLINE</span>
    </div>
  </div>

  <!-- Estadísticas principales -->
  <div in:fly={{ y: 12, duration: 380, delay: 120 }}>
    <DashboardStats />
  </div>

</div>

<style>
  .dashboard {
    position: relative;
    z-index: 1;
    padding: 1.5rem 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .section-title {
    display: flex; align-items: center;
    gap: 1rem; margin-bottom: 1rem;
  }

  .st-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(220,38,38,0.4), transparent);
  }

  .st-text {
    font-family: 'Pirata One', cursive;
    font-size: 0.72rem; letter-spacing: 0.22em;
    color: rgba(220,38,38,0.65); font-weight: 700;
    white-space: nowrap; text-transform: uppercase;
  }

  /* ── Fila superior ── */
  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .connected-badge {
    display: inline-flex; align-items: center; gap: 0.6rem;
    background: rgba(220,38,38,0.07);
    border: 1px solid rgba(220,38,38,0.22);
    border-radius: 4px; padding: 0.3rem 0.75rem;
    font-family: 'Pirata One', cursive;
    font-size: 0.65rem; color: var(--p-red);
    letter-spacing: 0.14em; font-weight: 700;
    box-shadow: 0 0 12px rgba(220,38,38,0.1);
    flex-wrap: wrap;
  }

  .pulse-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--p-red); box-shadow: 0 0 8px var(--p-red);
    animation: pulse 2s infinite;
  }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .badge-tx-count {
    display: inline-flex; align-items: center; gap: 0.3rem;
    background: rgba(30,58,95,0.15);
    border: 1px solid rgba(220,38,38,0.25);
    border-radius: 3px; padding: 0.12rem 0.45rem;
    font-size: 0.56rem; color: var(--p-red); letter-spacing: 0.08em;
  }

  .pending-indicator {
    display: inline-flex; align-items: center; gap: 0.35rem;
    background: rgba(220,38,38,0.12);
    border: 1px solid rgba(220,38,38,0.3);
    border-radius: 3px; padding: 0.15rem 0.5rem;
    font-size: 0.56rem; color: var(--p-red); letter-spacing: 0.1em;
  }

  .pending-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--p-red);
    animation: pulse 0.8s ease-in-out infinite;
  }

  /* ── Accesos rápidos ── */
  .quick-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .qa-btn {
    display: inline-flex; align-items: center; gap: 0.35rem;
    border-radius: 4px; padding: 0.3rem 0.7rem;
    font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.1em; cursor: pointer;
    transition: all 0.18s;
    font-family: 'Pirata One', cursive;
    border: 1px solid;
  }

  .qa-btn.wallet {
    background: rgba(245,158,11,0.08);
    border-color: rgba(245,158,11,0.25);
    color: var(--p-gold2);
  }
  .qa-btn.wallet:hover {
    background: rgba(245,158,11,0.18);
    border-color: rgba(245,158,11,0.5);
    box-shadow: 0 0 10px rgba(245,158,11,0.2);
  }

  .qa-btn.tx {
    background: rgba(96,165,250,0.07);
    border-color: rgba(96,165,250,0.2);
    color: #60a5fa;
  }
  .qa-btn.tx:hover {
    background: rgba(96,165,250,0.15);
    border-color: rgba(96,165,250,0.45);
    box-shadow: 0 0 10px rgba(96,165,250,0.15);
  }

  .qa-btn.act {
    background: rgba(167,139,250,0.07);
    border-color: rgba(167,139,250,0.2);
    color: #a78bfa;
  }
  .qa-btn.act:hover {
    background: rgba(167,139,250,0.15);
    border-color: rgba(167,139,250,0.45);
    box-shadow: 0 0 10px rgba(167,139,250,0.15);
  }

  /* ── Mini KPIs ── */
  .mini-kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  .mk-card {
    background: rgba(245,158,11,0.03);
    border: 1px solid rgba(245,158,11,0.1);
    border-radius: 7px;
    padding: 0.7rem 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transition: all 0.2s;
  }

  .mk-card:hover {
    background: rgba(245,158,11,0.07);
    border-color: rgba(245,158,11,0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(245,158,11,0.08);
  }

  .mk-label {
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(245,158,11,0.4);
    text-transform: uppercase;
  }

  .mk-value {
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--p-white);
    line-height: 1.1;
  }

  .mk-value.gold  { color: var(--p-gold2); text-shadow: 0 0 12px rgba(245,158,11,0.3); }
  .mk-value.green { color: #22c55e; font-size: 0.82rem; }
  .mk-value.small { font-size: 0.72rem; }

  .mk-cur {
    font-size: 0.65rem;
    color: rgba(245,158,11,0.6);
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .mini-kpis { grid-template-columns: repeat(2, 1fr); }
    .dashboard { padding: 1rem; }
  }

  @media (max-width: 600px) {
    .mini-kpis  { grid-template-columns: 1fr 1fr; }
    .top-row    { flex-direction: column; align-items: flex-start; }
    .st-text    { font-size: 0.58rem; letter-spacing: 0.14em; }
  }
</style>
