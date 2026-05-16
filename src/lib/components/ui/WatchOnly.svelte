<script lang="ts">
  import { ethers }              from 'ethers';
  import { AVAILABLE_NETWORKS }  from '$lib/constants/network';
  import { shortAddress, formatBalance } from '$lib/utils/format';
  import { fetchOnChainHistory, fetchTokenBalances } from '$lib/services/onchain.service';
  import type { NetworkInfo }    from '$lib/types/network';
  import type { OnChainTx }      from '$lib/services/onchain.service';
  import type { TokenBalance }   from '$lib/services/onchain.service';

  let inputAddress  = '';
  let selectedNet   = AVAILABLE_NETWORKS.find(n => n.chainId === 1) ?? AVAILABLE_NETWORKS[0];
  let loading       = false;
  let error         = '';
  let nativeBalance = '';
  let txHistory: OnChainTx[]  = [];
  let tokens: TokenBalance[]  = [];
  let searched      = false;
  let netOpen       = false;

  $: addressValid = ethers.isAddress(inputAddress);
  $: evmNets = AVAILABLE_NETWORKS.filter(n => n.type === 'EVM');

  function selectNet(net: NetworkInfo) {
    selectedNet = net;
    netOpen = false;
  }

  async function lookup() {
    if (!addressValid) { error = 'Dirección inválida'; return; }
    error = ''; loading = true; searched = false;
    try {
      const provider = new ethers.JsonRpcProvider(selectedNet.rpcUrl);
      const [rawBal, history, tkns] = await Promise.all([
        provider.getBalance(inputAddress),
        fetchOnChainHistory(inputAddress, selectedNet),
        fetchTokenBalances(inputAddress, selectedNet),
      ]);
      nativeBalance = ethers.formatEther(rawBal);
      txHistory     = history;
      tokens        = tkns;
      searched      = true;
    } catch {
      error = 'No se pudo consultar la dirección. Verifica la red.';
    } finally {
      loading = false;
    }
  }

  function reset() {
    inputAddress = ''; nativeBalance = '';
    txHistory = []; tokens = []; searched = false; error = '';
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if netOpen}
  <div class="net-backdrop" on:click={() => netOpen = false}></div>
{/if}

<div class="watch-only">

  <!-- Header -->
  <div class="wo-header">
    <div class="wo-icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </div>
    <div>
      <h3 class="wo-title">Watch-Only</h3>
      <p class="wo-sub">Consulta cualquier dirección sin conectar wallet</p>
    </div>
  </div>

  <div class="wo-divider"></div>

  <!-- Input dirección + selector de red en la misma fila -->
  <div class="wo-row">

    <!-- Input dirección -->
    <div class="wo-field" style="flex:1; min-width:0;">
      <label class="wo-field-label" for="wo-addr">DIRECCIÓN</label>
      <div class="wo-input-wrap">
        <svg class="wo-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.4)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <input
          id="wo-addr"
          class="wo-input"
          class:valid={addressValid}
          class:invalid={inputAddress.length > 5 && !addressValid}
          type="text"
          placeholder="0x... dirección a consultar"
          bind:value={inputAddress}
          disabled={loading}
          spellcheck="false"
          autocomplete="off"
          aria-label="Dirección a consultar"
        />
        {#if addressValid}
          <svg class="wo-valid-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        {/if}
      </div>
    </div>

    <!-- Selector de red -->
    <div class="wo-field" style="width:200px; flex-shrink:0;">
      <label class="wo-field-label">RED</label>
      <div class="wo-net-selector" class:open={netOpen}>
        <button
          class="wo-net-btn"
          on:click={() => netOpen = !netOpen}
          disabled={loading}
          aria-haspopup="listbox"
          aria-expanded={netOpen}
          aria-label="Seleccionar red"
        >
          <span class="wo-net-dot"></span>
          <span class="wo-net-name">{selectedNet.name}</span>
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="rgba(245,158,11,0.5)" stroke-width="2.5" stroke-linecap="round"
            style="transition:transform 0.2s; transform:rotate({netOpen ? 180 : 0}deg); flex-shrink:0"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {#if netOpen}
          <div class="wo-net-dropdown" role="listbox" aria-label="Redes disponibles">
            {#each evmNets as net (net.chainId)}
              <button
                class="wo-net-option"
                class:selected={net.chainId === selectedNet.chainId}
                on:click={() => selectNet(net)}
                role="option"
                aria-selected={net.chainId === selectedNet.chainId}
              >
                <span class="wo-net-dot" class:active={net.chainId === selectedNet.chainId}></span>
                <span class="wo-net-opt-name">{net.name}</span>
                <span class="wo-net-opt-cur">{net.currency}</span>
                {#if net.chainId === selectedNet.chainId}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  </div>

  <!-- Acciones -->
  <div class="wo-actions">
    <button class="wo-btn-search" on:click={lookup} disabled={loading || !addressValid} aria-label="Consultar dirección">
      {#if loading}
        <svg class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        Consultando...
      {:else}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Consultar Dirección
      {/if}
    </button>
    {#if searched}
      <button class="wo-btn-reset" on:click={reset} aria-label="Limpiar consulta">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Limpiar
      </button>
    {/if}
  </div>

  {#if error}
    <div class="wo-error" role="alert">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {error}
    </div>
  {/if}

  <!-- Resultados -->
  {#if searched}
    <div class="wo-results">

      <!-- Dirección + saldo -->
      <div class="wo-result-card">
        <div class="wrc-row">
          <div class="wrc-item">
            <span class="wrc-label">DIRECCIÓN</span>
            <span class="wrc-value mono">{shortAddress(inputAddress)}</span>
          </div>
          <div class="wrc-item">
            <span class="wrc-label">RED</span>
            <span class="wrc-value">{selectedNet.name}</span>
          </div>
        </div>
        <div class="wrc-balance">
          <span class="wrc-bal-label">SALDO NATIVO</span>
          <span class="wrc-bal-value">{formatBalance(nativeBalance, 6)} <span class="wrc-cur">{selectedNet.currency}</span></span>
        </div>
      </div>

      <!-- Tokens -->
      {#if tokens.length > 0}
        <div class="wo-section">
          <p class="wo-section-title">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.7)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Tokens ERC-20
          </p>
          <div class="wo-tokens">
            {#each tokens as token (token.address)}
              <div class="wo-token">
                <span class="wo-token-symbol">{token.symbol}</span>
                <span class="wo-token-balance">{parseFloat(token.balance).toFixed(4)}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Historial -->
      <div class="wo-section">
        <p class="wo-section-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.6)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Últimas transacciones
          {#if txHistory.length === 0}<span class="wo-empty-note">(sin datos del explorer)</span>{/if}
        </p>
        {#if txHistory.length > 0}
          <div class="wo-txlist">
            {#each txHistory as tx (tx.hash)}
              <div class="wo-tx" class:incoming={tx.isIncoming} class:failed={tx.status === 'failed'}>
                <div class="wo-tx-dir" aria-label={tx.isIncoming ? 'Recibida' : 'Enviada'}>
                  {#if tx.isIncoming}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 19 19 12"/></svg>
                  {:else}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 5 5 12"/></svg>
                  {/if}
                </div>
                <div class="wo-tx-info">
                  <span class="wo-tx-hash mono">{shortAddress(tx.hash)}</span>
                  <span class="wo-tx-peer mono">{tx.isIncoming ? `De: ${shortAddress(tx.from)}` : `A: ${shortAddress(tx.to)}`}</span>
                </div>
                <span class="wo-tx-amount">{parseFloat(tx.value).toFixed(5)} {selectedNet.currency}</span>
                {#if selectedNet.blockExplorer}
                  <a class="wo-tx-link" href="{selectedNet.blockExplorer}/tx/{tx.hash}" target="_blank" rel="noopener noreferrer" aria-label="Ver en explorer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>

    </div>
  {/if}

</div>

<style>
  .net-backdrop {
    position: fixed; inset: 0; z-index: 49;
  }

  .watch-only {
    background: rgba(245,158,11,0.03);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 10px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ── Header ── */
  .wo-header {
    display: flex; align-items: center; gap: 0.75rem;
  }

  .wo-icon {
    width: 36px; height: 36px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .wo-title {
    font-family: 'Cinzel', serif;
    font-size: 1rem; font-weight: 700;
    color: var(--n-white); margin: 0; letter-spacing: 0.04em;
  }

  .wo-sub {
    font-size: 0.68rem; color: rgba(245,158,11,0.45);
    margin: 0.15rem 0 0; letter-spacing: 0.02em;
  }

  .wo-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent);
  }

  /* ── Fields ── */
  .wo-row {
    display: flex;
    gap: 0.6rem;
    align-items: flex-end;
  }

  .wo-field {
    display: flex; flex-direction: column; gap: 0.4rem;
  }

  .wo-field-label {
    font-size: 0.58rem; font-weight: 700;
    letter-spacing: 0.15em; color: rgba(245,158,11,0.5);
    text-transform: uppercase;
  }

  .wo-input-wrap {
    position: relative; display: flex; align-items: center;
  }

  .wo-input-icon {
    position: absolute; left: 0.75rem; pointer-events: none;
  }

  .wo-input {
    width: 100%;
    padding: 0.7rem 2.5rem 0.7rem 2.2rem;
    background: rgba(6,4,10,0.6);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 7px;
    color: var(--n-white);
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .wo-input::placeholder { color: rgba(245,158,11,0.25); }
  .wo-input:focus { outline: none; border-color: rgba(245,158,11,0.45); box-shadow: 0 0 12px rgba(245,158,11,0.1); }
  .wo-input.valid   { border-color: rgba(34,197,94,0.45); }
  .wo-input.invalid { border-color: rgba(220,38,38,0.4); }

  .wo-valid-icon { position: absolute; right: 0.75rem; }

  /* ── Net selector ── */
  .wo-net-selector { position: relative; }

  .wo-net-btn {
    width: 100%;
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.7rem 0.9rem;
    background: rgba(6,4,10,0.6);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 7px;
    color: var(--n-white);
    cursor: pointer; transition: all 0.2s;
    text-align: left;
  }

  .wo-net-btn:hover:not(:disabled) {
    border-color: rgba(245,158,11,0.4);
    background: rgba(245,158,11,0.05);
  }

  .wo-net-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .wo-net-selector.open .wo-net-btn {
    border-color: rgba(245,158,11,0.45);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .wo-net-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(245,158,11,0.3);
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .wo-net-dot.active {
    background: #22c55e;
    box-shadow: 0 0 6px #22c55e;
  }

  .wo-net-name {
    flex: 1; font-size: 0.82rem; font-weight: 600;
    color: var(--n-white);
  }

  .wo-net-currency {
    font-size: 0.65rem; font-weight: 700;
    color: rgba(245,158,11,0.5);
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 3px; padding: 0.1rem 0.4rem;
  }

  /* Dropdown */
  .wo-net-dropdown {
    position: absolute; top: 100%; left: 0; right: 0;
    background: rgba(10,14,26,0.98);
    border: 1px solid rgba(245,158,11,0.3);
    border-top: none;
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
    z-index: 50;
    max-height: 260px; overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    animation: dropDown 0.15s ease-out;
  }

  @keyframes dropDown { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

  .wo-net-dropdown::-webkit-scrollbar { width: 4px; }
  .wo-net-dropdown::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.2); border-radius: 2px; }

  .wo-net-option {
    width: 100%;
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.6rem 0.9rem;
    background: transparent;
    border: none; border-bottom: 1px solid rgba(245,158,11,0.06);
    color: rgba(226,232,240,0.6);
    cursor: pointer; transition: all 0.15s;
    text-align: left;
  }

  .wo-net-option:last-child { border-bottom: none; }

  .wo-net-option:hover {
    background: rgba(245,158,11,0.07);
    color: var(--n-white);
  }

  .wo-net-option.selected {
    background: rgba(245,158,11,0.1);
    color: var(--n-white);
  }

  .wo-net-opt-name { flex: 1; font-size: 0.8rem; font-weight: 600; }
  .wo-net-opt-cur  { font-size: 0.62rem; color: rgba(245,158,11,0.45); }

  /* ── Acciones ── */
  .wo-actions { display: flex; gap: 0.5rem; }

  .wo-btn-search {
    flex: 1; padding: 0.75rem 1rem;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 7px;
    color: var(--n-gold2);
    font-family: 'Cinzel', serif;
    font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.2s;
  }

  .wo-btn-search:hover:not(:disabled) {
    background: rgba(245,158,11,0.15);
    border-color: rgba(245,158,11,0.5);
    box-shadow: 0 4px 16px rgba(245,158,11,0.15);
    transform: translateY(-1px);
  }

  .wo-btn-search:disabled { opacity: 0.45; cursor: not-allowed; }

  .wo-btn-reset {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: 1px solid rgba(220,38,38,0.2);
    border-radius: 7px;
    color: rgba(220,38,38,0.5);
    font-size: 0.75rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }

  .wo-btn-reset:hover {
    background: rgba(220,38,38,0.08);
    border-color: rgba(220,38,38,0.4);
    color: #f87171;
  }

  /* ── Error ── */
  .wo-error {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.78rem; color: #f87171;
    padding: 0.6rem 0.85rem;
    background: rgba(220,38,38,0.08);
    border: 1px solid rgba(220,38,38,0.25);
    border-radius: 6px;
  }

  /* ── Resultados ── */
  .wo-results { display: flex; flex-direction: column; gap: 0.75rem; }

  .wo-result-card {
    background: rgba(245,158,11,0.05);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 8px;
    padding: 1rem;
    display: flex; flex-direction: column; gap: 0.75rem;
  }

  .wrc-row {
    display: flex; gap: 1rem; flex-wrap: wrap;
  }

  .wrc-item {
    display: flex; flex-direction: column; gap: 0.2rem; flex: 1;
  }

  .wrc-label {
    font-size: 0.55rem; font-weight: 700;
    letter-spacing: 0.15em; color: rgba(245,158,11,0.45);
    text-transform: uppercase;
  }

  .wrc-value {
    font-size: 0.85rem; color: var(--n-white); font-weight: 600;
  }

  .wrc-balance {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.6rem 0.75rem;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 6px;
  }

  .wrc-bal-label {
    font-size: 0.58rem; font-weight: 700;
    letter-spacing: 0.12em; color: rgba(245,158,11,0.5);
    text-transform: uppercase;
  }

  .wrc-bal-value {
    font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 700;
    color: var(--n-gold2); text-shadow: 0 0 12px rgba(245,158,11,0.3);
  }

  .wrc-cur { font-size: 0.7rem; color: rgba(245,158,11,0.6); }

  /* ── Secciones ── */
  .wo-section { display: flex; flex-direction: column; gap: 0.5rem; }

  .wo-section-title {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.68rem; font-weight: 700;
    color: rgba(245,158,11,0.6); letter-spacing: 0.1em;
    text-transform: uppercase; margin: 0;
  }

  .wo-empty-note {
    font-size: 0.62rem; color: rgba(196,181,253,0.3);
    font-weight: 400; text-transform: none; letter-spacing: 0;
  }

  /* Tokens */
  .wo-tokens { display: flex; flex-wrap: wrap; gap: 0.4rem; }

  .wo-token {
    display: flex; align-items: center; gap: 0.4rem;
    background: rgba(147,51,234,0.08);
    border: 1px solid rgba(147,51,234,0.2);
    border-radius: 5px; padding: 0.35rem 0.65rem;
  }

  .wo-token-symbol { font-size: 0.72rem; font-weight: 700; color: #c4b5fd; }
  .wo-token-balance { font-size: 0.7rem; color: rgba(196,181,253,0.55); }

  /* Tx list */
  .wo-txlist { display: flex; flex-direction: column; gap: 0.4rem; }

  .wo-tx {
    display: flex; align-items: center; gap: 0.65rem;
    padding: 0.65rem 0.85rem;
    background: rgba(6,4,10,0.5);
    border: 1px solid rgba(245,158,11,0.08);
    border-left: 3px solid rgba(245,158,11,0.3);
    border-radius: 6px;
  }

  .wo-tx.incoming { border-left-color: #22c55e; }
  .wo-tx.failed   { border-left-color: #dc2626; opacity: 0.7; }

  .wo-tx-dir { flex-shrink: 0; }

  .wo-tx-info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
  .wo-tx-hash { font-size: 0.7rem; color: rgba(196,181,253,0.5); }
  .wo-tx-peer { font-size: 0.65rem; color: rgba(245,158,11,0.45); }

  .wo-tx-amount { font-weight: 700; color: var(--n-gold2); font-size: 0.72rem; white-space: nowrap; }

  .wo-tx-link {
    color: rgba(196,181,253,0.35); text-decoration: none;
    display: flex; align-items: center; transition: color 0.15s;
  }

  .wo-tx-link:hover { color: #c4b5fd; }

  .spin { animation: spinAnim 0.8s linear infinite; }
  @keyframes spinAnim { to { transform: rotate(360deg); } }
</style>
