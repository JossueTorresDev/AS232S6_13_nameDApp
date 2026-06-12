<script lang="ts">
  import { AVAILABLE_NETWORKS }              from '$lib/constants/network';
  import { isFaucetContractAvailable }       from '$lib/constants/faucet-contract';
  import { fetchFaucetHistory, type FaucetDripEvent } from '$lib/services/public-faucet.service';
  import { faucetStore, type FaucetRequest } from '$lib/stores/faucet.store';
  import { shortAddress }                    from '$lib/utils/format';
  import type { NetworkInfo }                from '$lib/types/network';

  // ── Estado ────────────────────────────────────────────────────────────────
  let selectedNetwork: NetworkInfo = AVAILABLE_NETWORKS.find(n => n.chainId === 11155111)
    ?? AVAILABLE_NETWORKS.find(n => isFaucetContractAvailable(n.chainId) && n.type === 'EVM')
    ?? AVAILABLE_NETWORKS.find(n => n.type === 'EVM')
    ?? AVAILABLE_NETWORKS[0];

  let onChainEvents: FaucetDripEvent[] = [];
  let loadingOnChain = false;
  let onChainError   = '';
  let netOpen        = false;

  // ── Derivados ────────────────────────────────────────────────────────────
  $: evmNetworks        = AVAILABLE_NETWORKS.filter(n => n.type === 'EVM');
  $: contractSupported  = isFaucetContractAvailable(selectedNetwork.chainId);

  // Historial local filtrado por red
  $: localHistory = $faucetStore.requests.filter(
    r => r.networkId === selectedNetwork.chainId
  );

  // Recargar eventos on-chain cuando cambia la red
  $: if (selectedNetwork) loadOnChain();

  async function loadOnChain() {
    if (!contractSupported) {
      onChainEvents = [];
      return;
    }
    loadingOnChain = true;
    onChainError   = '';
    try {
      onChainEvents = await fetchFaucetHistory(selectedNetwork, 30);
    } catch (e) {
      onChainError = e instanceof Error ? e.message : 'Error al obtener historial';
      onChainEvents = [];
    } finally {
      loadingOnChain = false;
    }
  }

  function selectNetwork(net: NetworkInfo) {
    selectedNetwork = net;
    netOpen         = false;
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function statusColor(status: FaucetRequest['status']): string {
    if (status === 'confirmed') return '#22c55e';
    if (status === 'failed')    return '#f87171';
    return '#fbbf24';
  }
</script>

<div class="fh-panel">
  <!-- Header -->
  <div class="fh-header">
    <div class="fh-icon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
    <div>
      <h3 class="fh-title">Historial del Faucet</h3>
      <p class="fh-sub">Historial público de solicitudes al faucet on-chain. Sin login requerido.</p>
    </div>
  </div>

  <!-- Selector de red -->
  <div class="fh-net-wrap" class:open={netOpen}>
    <button
      class="fh-net-btn"
      type="button"
      on:click={() => netOpen = !netOpen}
      aria-haspopup="listbox"
      aria-expanded={netOpen}
      aria-label="Filtrar por red"
    >
      <span class="fh-net-dot" class:sup={contractSupported}></span>
      <span>Filtrar: <strong>{selectedNetwork.name}</strong></span>
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="rgba(245,158,11,0.5)" stroke-width="2.5" stroke-linecap="round"
        style="transform:rotate({netOpen ? 180 : 0}deg);transition:transform 0.2s;margin-left:auto"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    {#if netOpen}
      <div class="fh-net-dropdown" role="listbox">
        {#each evmNetworks as net (net.chainId)}
          <button
            class="fh-net-option"
            class:selected={net.chainId === selectedNetwork.chainId}
            type="button"
            on:click={() => selectNetwork(net)}
            role="option"
            aria-selected={net.chainId === selectedNetwork.chainId}
          >
            <span class="fh-net-dot" class:sup={isFaucetContractAvailable(net.chainId)}></span>
            <span class="fh-opt-name">{net.name}</span>
            {#if isFaucetContractAvailable(net.chainId)}
              <span class="fh-badge-active">On-chain</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Tabs: On-chain + Local -->
  <div class="fh-tabs">

    <!-- ── Historial On-Chain ── -->
    <div class="fh-tab-section">
      <div class="fh-tab-header">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(34,197,94,0.7)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="fh-tab-title">Blockchain · Eventos FaucetDrip</span>
        {#if onChainEvents.length > 0}
          <span class="fh-count">{onChainEvents.length}</span>
        {/if}
      </div>

      {#if !contractSupported}
        <div class="fh-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.25)" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Sin contrato faucet en <strong>{selectedNetwork.name}</strong></p>
        </div>
      {:else if loadingOnChain}
        <div class="fh-loading-list">
          {#each [1,2,3] as i}
            <div class="fh-sk-row" style="opacity:{1 - i*0.2}"></div>
          {/each}
        </div>
      {:else if onChainError}
        <div class="fh-error" role="alert">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {onChainError}
        </div>
      {:else if onChainEvents.length === 0}
        <div class="fh-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.2)" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <p>Sin solicitudes registradas en el contrato todavía</p>
        </div>
      {:else}
        <div class="fh-event-list" role="list">
          {#each onChainEvents as ev (ev.txHash)}
            <div class="fh-event-row" role="listitem">
              <div class="fer-left">
                <span class="fer-index">#{ev.requestIndex}</span>
                <div class="fer-info">
                  <span class="fer-addr mono">{shortAddress(ev.recipient)}</span>
                  <span class="fer-date">{formatDate(ev.timestamp)}</span>
                </div>
              </div>
              <div class="fer-right">
                <span class="fer-amount">+{parseFloat(ev.amount).toFixed(5)}<span class="fer-cur"> {selectedNetwork.currency}</span></span>
                {#if selectedNetwork.blockExplorer}
                  <a
                    class="fer-link"
                    href="{selectedNetwork.blockExplorer}/tx/{ev.txHash}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver transacción"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- ── Historial Local (este browser) ── -->
    <div class="fh-tab-section">
      <div class="fh-tab-header">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.6)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        <span class="fh-tab-title">Mis Solicitudes · Este Navegador</span>
        {#if localHistory.length > 0}
          <span class="fh-count">{localHistory.length}</span>
        {/if}
        {#if localHistory.length > 0}
          <button
            class="fh-clear-btn"
            type="button"
            on:click={() => faucetStore.clearAll()}
            aria-label="Limpiar historial local"
          >Limpiar</button>
        {/if}
      </div>

      {#if localHistory.length === 0}
        <div class="fh-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.2)" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <p>Aún no has solicitado fondos en <strong>{selectedNetwork.name}</strong></p>
        </div>
      {:else}
        <div class="fh-local-list" role="list">
          {#each localHistory as req (req.id)}
            <div class="fh-local-row" role="listitem">
              <span
                class="flr-status-dot"
                style="background:{statusColor(req.status)};box-shadow:0 0 6px {statusColor(req.status)}80"
              ></span>
              <div class="flr-info">
                <span class="flr-addr mono">{shortAddress(req.recipient)}</span>
                <span class="flr-date">{formatDate(req.timestamp)}</span>
              </div>
              <div class="flr-right">
                {#if req.amount}
                  <span class="flr-amount">+{parseFloat(req.amount).toFixed(5)} <span class="flr-cur">{req.currency}</span></span>
                {:else}
                  <span class="flr-pending">{req.status === 'pending' ? 'Pendiente' : req.status === 'failed' ? 'Fallido' : '—'}</span>
                {/if}
                {#if selectedNetwork.blockExplorer && req.txHash}
                  <a
                    class="fer-link"
                    href="{selectedNetwork.blockExplorer}/tx/{req.txHash}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver transacción"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  </div><!-- /fh-tabs -->
</div>

<style>
  .fh-panel {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  /* Header */
  .fh-header {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
  }
  .fh-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.05));
    border: 1px solid rgba(34,197,94,0.18);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fh-title {
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--n-white);
  }
  .fh-sub {
    font-size: 0.72rem;
    color: rgba(34,197,94,0.55);
    margin-top: 0.3rem;
    line-height: 1.4;
  }

  /* Selector de red */
  .fh-net-wrap {
    position: relative;
    z-index: 50;
  }
  .fh-net-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem 0.9rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(245,158,11,0.16);
    border-radius: 10px;
    color: rgba(226,232,240,0.8);
    font-size: 0.82rem;
    transition: border-color 0.2s;
  }
  .fh-net-btn:hover { border-color: rgba(245,158,11,0.3); }
  .fh-net-btn strong { color: var(--n-white); }
  .fh-net-dropdown {
    position: absolute;
    bottom: calc(100% + 0.45rem);
    left: 0; right: 0;
    background: rgba(6,8,18,0.97);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 10px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 60;
    box-shadow: 0 16px 36px rgba(0,0,0,0.4);
  }
  .fh-net-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 0.9rem;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    background: transparent;
    color: rgba(226,232,240,0.75);
    font-size: 0.8rem;
    transition: background 0.15s;
  }
  .fh-net-option:last-child { border-bottom: none; }
  .fh-net-option:hover { background: rgba(255,255,255,0.04); }
  .fh-net-option.selected { background: rgba(245,158,11,0.05); }
  .fh-net-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    background: rgba(255,255,255,0.18);
  }
  .fh-net-dot.sup {
    background: #22c55e;
    box-shadow: 0 0 5px rgba(34,197,94,0.4);
  }
  .fh-opt-name { flex: 1; font-weight: 600; color: var(--n-white); text-align: left; }
  .fh-badge-active {
    font-size: 0.58rem;
    color: #86efac;
    margin-left: auto;
  }

  /* Tabs container */
  .fh-tabs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Sección de tab */
  .fh-tab-section {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }
  .fh-tab-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .fh-tab-title {
    font-size: 0.65rem;
    font-weight: 700;
    color: rgba(245,158,11,0.65);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    flex: 1;
  }
  .fh-count {
    font-size: 0.65rem;
    padding: 0.1rem 0.45rem;
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 999px;
    color: var(--n-gold2);
  }
  .fh-clear-btn {
    font-size: 0.62rem;
    color: rgba(248,113,113,0.6);
    background: transparent;
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: 6px;
    padding: 0.15rem 0.5rem;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .fh-clear-btn:hover { color: #f87171; border-color: rgba(248,113,113,0.4); }

  /* Empty state */
  .fh-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    color: rgba(226,232,240,0.3);
    font-size: 0.8rem;
    text-align: center;
  }
  .fh-empty strong { color: rgba(226,232,240,0.5); }

  /* Loading skeleton */
  .fh-loading-list { display: flex; flex-direction: column; gap: 0.45rem; }
  .fh-sk-row {
    height: 44px;
    border-radius: 8px;
    background: rgba(255,255,255,0.03);
    animation: shimmer 1.4s ease-in-out infinite;
  }
  @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.9} }

  /* Error */
  .fh-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: #fca5a5;
    padding: 0.65rem 0.85rem;
    background: rgba(248,113,113,0.07);
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: 10px;
  }

  /* Eventos on-chain */
  .fh-event-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .fh-event-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.65rem 0.85rem;
    background: rgba(34,197,94,0.04);
    border: 1px solid rgba(34,197,94,0.1);
    border-radius: 10px;
    transition: background 0.15s;
  }
  .fh-event-row:hover { background: rgba(34,197,94,0.08); }
  .fer-left {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
  }
  .fer-index {
    font-size: 0.6rem;
    font-weight: 700;
    color: rgba(34,197,94,0.5);
    flex-shrink: 0;
  }
  .fer-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }
  .fer-addr {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--n-white);
  }
  .fer-date {
    font-size: 0.62rem;
    color: rgba(226,232,240,0.4);
  }
  .fer-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  .fer-amount {
    font-family: 'Cinzel', serif;
    font-size: 0.82rem;
    font-weight: 700;
    color: #86efac;
  }
  .fer-cur { font-size: 0.6rem; color: rgba(134,239,172,0.5); }
  .fer-link {
    color: rgba(147,197,253,0.4);
    display: flex;
    align-items: center;
  }
  .fer-link:hover { color: #93c5fd; }

  /* Historial local */
  .fh-local-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .fh-local-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 0.85rem;
    background: rgba(245,158,11,0.03);
    border: 1px solid rgba(245,158,11,0.1);
    border-radius: 10px;
  }
  .flr-status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .flr-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }
  .flr-addr {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--n-white);
  }
  .flr-date {
    font-size: 0.62rem;
    color: rgba(226,232,240,0.4);
  }
  .flr-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  .flr-amount {
    font-family: 'Cinzel', serif;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--n-gold2);
  }
  .flr-cur { font-size: 0.6rem; color: rgba(245,158,11,0.5); }
  .flr-pending {
    font-size: 0.72rem;
    color: rgba(226,232,240,0.4);
    font-style: italic;
  }

  .mono { font-family: 'Courier New', monospace; }
</style>
