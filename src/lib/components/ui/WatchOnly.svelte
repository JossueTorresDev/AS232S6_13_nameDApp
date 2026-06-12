<script lang="ts">
  import { ethers }              from 'ethers';
  import { AVAILABLE_NETWORKS }  from '$lib/constants/network';
  import { shortAddress, formatBalance } from '$lib/utils/format';
  import { fetchOnChainHistory, fetchTokenBalances } from '$lib/services/onchain.service';
  import { buildFaucetUrl, getFaucetInfoForNetwork, type FaucetInfo } from '$lib/services/faucet.service';
  import { fetchBalanceAllNetworks, type NetworkBalance } from '$lib/services/public-faucet.service';
  import type { NetworkInfo }    from '$lib/types/network';
  import type { OnChainTx }      from '$lib/services/onchain.service';
  import type { TokenBalance }   from '$lib/services/onchain.service';

  let inputAddress  = '';
  let selectedNet   = AVAILABLE_NETWORKS.find(n => n.chainId === 1) ?? AVAILABLE_NETWORKS[0];
  let selectedFaucetNet: NetworkInfo | undefined = AVAILABLE_NETWORKS.find(n => n.chainId === 11155111) ?? AVAILABLE_NETWORKS[0];
  let loading       = false;
  let error         = '';
  let nativeBalance = '';
  let txHistory: OnChainTx[]  = [];
  let tokens: TokenBalance[]  = [];
  let searched      = false;
  let netOpen       = false;
  let faucetModalOpen = false;
  let resultsModalOpen = false;
  let faucetInfo: FaucetInfo | undefined;
  let faucetNetworks: NetworkInfo[] = [];

  // ── Multi-network balance ──────────────────────────────────────────────────
  let multiModalOpen    = false;
  let multiLoading      = false;
  let multiError        = '';
  let multiResults: NetworkBalance[] = [];
  let multiAddress      = '';

  $: addressValid = ethers.isAddress(inputAddress);
  $: evmNets = AVAILABLE_NETWORKS.filter(n => n.type === 'EVM');
  $: faucetNetworks = AVAILABLE_NETWORKS.filter(n => getFaucetInfoForNetwork(n));
  $: faucetInfo = selectedFaucetNet ? getFaucetInfoForNetwork(selectedFaucetNet) : undefined;
  $: multiNonZero = multiResults.filter(r => r.status === 'ok' && r.rawBalance > 0n);

  function selectNet(net: NetworkInfo) {
    selectedNet = net;
    netOpen = false;
  }

  function selectFaucetNetwork(net: NetworkInfo) {
    selectedFaucetNet = net;
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
      resultsModalOpen = true;
    } catch {
      error = 'No se pudo consultar la dirección. Verifica la red.';
    } finally {
      loading = false;
    }
  }

  function requestFaucet() {
    const targetNet = selectedFaucetNet ?? selectedNet;
    const url = buildFaucetUrl(targetNet, addressValid ? inputAddress : undefined);
    if (!url) return;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      faucetModalOpen = false;
    }
  }

  export function openFaucetModal() {
    selectedFaucetNet = getFaucetInfoForNetwork(selectedNet) ? selectedNet : faucetNetworks[0];
    faucetModalOpen = true;
  }

  function openResultsModal() {
    resultsModalOpen = true;
  }

  function closeFaucetModal() {
    faucetModalOpen = false;
  }

  function reloadPage() {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  function closeResultsModal() {
    resultsModalOpen = false;
  }

  function reset() {
    inputAddress = ''; nativeBalance = '';
    txHistory = []; tokens = []; searched = false; error = '';
    resultsModalOpen = false;
  }

  // ── Multi-network balance handlers ─────────────────────────────────────────
  async function lookupAllNetworks() {
    multiAddress = inputAddress;
    if (!ethers.isAddress(multiAddress)) {
      multiError = 'Dirección inválida';
      return;
    }
    multiError   = '';
    multiLoading = true;
    multiResults = [];
    multiModalOpen = true;

    try {
      multiResults = await fetchBalanceAllNetworks(multiAddress);
    } catch (e) {
      multiError = e instanceof Error ? e.message : 'Error al consultar redes';
    } finally {
      multiLoading = false;
    }
  }

  function closeMultiModal() {
    multiModalOpen = false;
    multiResults   = [];
    multiError     = '';
  }
</script>

{#if netOpen}
  <div class="net-backdrop" on:click={() => netOpen = false}></div>
{/if}

{#if faucetModalOpen}
  <div class="wo-modal-backdrop" on:click={closeFaucetModal}></div>
  <div class="wo-modal-card" role="dialog" aria-modal="true" aria-label="Faucet de red de prueba">
    <div class="wo-modal-header">
      <div>
        <p class="wo-modal-title">Faucet de red de prueba</p>
        <p class="wo-modal-sub">{faucetInfo ? `Abre la faucet para ${selectedNet.name}` : 'Selecciona una red compatible para abrir la faucet'}</p>
      </div>
      <button class="wo-modal-close" type="button" on:click={closeFaucetModal} aria-label="Cerrar modal">×</button>
    </div>
    {#if faucetInfo}
      <div class="wo-modal-copy">
        <div class="wo-modal-top-row">
          <p class="wo-modal-heading">{faucetInfo.title ?? faucetInfo.label}</p>
          <span class="wo-modal-badge">Beta</span>
        </div>
        <p class="wo-modal-description">{faucetInfo.description ?? `Get free ${selectedFaucetNet?.currency ?? selectedNet.currency} on ${selectedFaucetNet?.name ?? selectedNet.name}. Brought to you by Google Cloud for Web3.`}</p>

        <div class="wo-modal-field">
          <label class="wo-modal-field-label">Select network</label>
          <div class="wo-faucet-net-list">
            {#each faucetNetworks as net}
              <button
                type="button"
                class="wo-faucet-net-btn"
                class:active={selectedFaucetNet?.chainId === net.chainId}
                on:click={() => selectFaucetNetwork(net)}
              >
                {net.name}
              </button>
            {/each}
          </div>
          <p class="wo-modal-required">*required</p>
        </div>

        <div class="wo-modal-field">
          <label class="wo-modal-field-label">Wallet address or ENS name</label>
          <input
            class="wo-modal-input"
            type="text"
            bind:value={inputAddress}
            placeholder="Enter the account address or ENS name where you want to receive tokens"
            aria-label="Wallet address or ENS name"
          />
        </div>

        {#if addressValid}
          <p class="wo-modal-note">Al hacer clic se abrirá la faucet en una pestaña nueva para la red seleccionada.</p>
        {:else}
          <p class="wo-modal-note">Ingresa una dirección válida o ENS para continuar.</p>
        {/if}
      </div>
    {:else}
      <div class="wo-modal-copy">
        <p>Esta red no tiene faucet configurada en la aplicación. Elige una red de prueba compatible como Ethereum Hoodi o Sepolia.</p>
      </div>
    {/if}
    <div class="wo-modal-actions">
      <button class="wo-btn-faucet" on:click={requestFaucet} type="button" disabled={!faucetInfo}>
        {faucetInfo ? `Abrir faucet de ${selectedFaucetNet?.name ?? selectedNet.name}` : 'Selecciona red compatible'}
      </button>
      <button class="wo-btn-secondary" on:click={reloadPage} type="button">Recargar página</button>
      <button class="wo-btn-reset" on:click={closeFaucetModal} type="button">Cancelar</button>
    </div>
  </div>
{/if}

{#if multiModalOpen}
  <div class="wo-modal-backdrop" on:click={closeMultiModal}></div>
  <div class="wo-modal-card wo-modal-wide" role="dialog" aria-modal="true" aria-label="Saldo en múltiples redes">
    <div class="wo-modal-header">
      <div>
        <p class="wo-modal-title">Consulta Masiva · Múltiples Redes</p>
        <p class="wo-modal-sub">{shortAddress(multiAddress)} · {multiResults.length} redes EVM</p>
      </div>
      <button class="wo-modal-close" type="button" on:click={closeMultiModal} aria-label="Cerrar modal">×</button>
    </div>

    <div class="wo-modal-copy">
      {#if multiLoading}
        <div class="multi-loading-grid">
          {#each AVAILABLE_NETWORKS.filter(n => n.type === 'EVM') as net}
            <div class="multi-net-skeleton">
              <span class="skeleton-dot"></span>
              <span class="skeleton-name">{net.name}</span>
              <span class="skeleton-bar"></span>
            </div>
          {/each}
        </div>
      {:else if multiError}
        <div class="wo-error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {multiError}
        </div>
      {:else}
        <!-- Resumen -->
        <div class="multi-summary-row">
          <div class="multi-stat">
            <span class="multi-stat-label">REDES CON SALDO</span>
            <span class="multi-stat-val gold">{multiNonZero.length} / {multiResults.length}</span>
          </div>
          <div class="multi-stat">
            <span class="multi-stat-label">ERRORES</span>
            <span class="multi-stat-val red">{multiResults.filter(r => r.status === 'error').length}</span>
          </div>
          <div class="multi-stat">
            <span class="multi-stat-label">DIRECCIÓN</span>
            <span class="multi-stat-val mono">{shortAddress(multiAddress)}</span>
          </div>
        </div>

        <!-- Lista de resultados -->
        <div class="multi-net-list" role="list">
          {#each multiResults as row (row.network.chainId)}
            <div
              class="multi-net-row"
              class:has-balance={row.status === 'ok' && row.rawBalance > 0n}
              class:net-error={row.status === 'error'}
              role="listitem"
            >
              <div class="mnr-left">
                <span
                  class="mnr-dot"
                  class:dot-ok={row.status === 'ok'}
                  class:dot-err={row.status === 'error'}
                ></span>
                <div class="mnr-info">
                  <span class="mnr-name">{row.network.name}</span>
                  <span class="mnr-label">{row.network.label} · chainId {row.network.chainId}</span>
                </div>
              </div>
              <div class="mnr-right">
                {#if row.status === 'error'}
                  <span class="mnr-error">{row.error ?? 'Error'}</span>
                {:else}
                  <span class="mnr-balance" class:nonzero={row.rawBalance > 0n}>
                    {parseFloat(row.balance).toFixed(6)}
                    <span class="mnr-cur">{row.network.currency}</span>
                  </span>
                  {#if row.network.blockExplorer}
                    <a
                      class="mnr-explorer"
                      href="{row.network.blockExplorer}/address/{multiAddress}"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ver en explorador"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  {/if}
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="wo-modal-actions">
      <button class="wo-btn-reset" type="button" on:click={closeMultiModal}>Cerrar</button>
    </div>
  </div>
{/if}

{#if resultsModalOpen}
  <div class="wo-modal-backdrop" on:click={closeResultsModal}></div>
  <div class="wo-modal-card" role="dialog" aria-modal="true" aria-label="Resultados de dirección">
    <div class="wo-modal-header">
      <div>
        <p class="wo-modal-title">Resultados de dirección</p>
        <p class="wo-modal-sub">{selectedNet.name} · {shortAddress(inputAddress)}</p>
      </div>
      <button class="wo-modal-close" type="button" on:click={closeResultsModal} aria-label="Cerrar modal">×</button>
    </div>
    <div class="wo-modal-copy">
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
                  <a class="wo-tx-link" href={selectedNet.blockExplorer + '/tx/' + tx.hash} target="_blank" rel="noopener noreferrer" aria-label="Ver en explorer">
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
    <div class="wo-modal-actions">
      <button class="wo-btn-reset" type="button" on:click={closeResultsModal}>Cerrar</button>
    </div>
  </div>
{/if}

<div class="watch-only">
  <div class="wo-header">
    <div class="wo-icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </div>
    <div>
      <h3 class="wo-title">Watch-Only</h3>
      <p class="wo-sub">Consulta cualquier dirección sin conectar wallet. Solicita faucet en redes de prueba desde la dApp.</p>
    </div>
  </div>

  <div class="wo-main">
    <div class="wo-form">
      <div class="wo-row">
        <div class="wo-field">
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

        <div class="wo-field">
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

        <button
          class="wo-btn-multi"
          on:click={lookupAllNetworks}
          disabled={!addressValid || multiLoading}
          aria-label="Consultar saldo en todas las redes"
        >
          {#if multiLoading}
            <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Consultando redes...
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Ver en Todas las Redes
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

      {#if searched && !error}
        <div class="wo-results-note">
          Resultados listos. <button class="wo-link-button" type="button" on:click={openResultsModal}>Ver resultados</button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .net-backdrop {
    position: fixed; inset: 0; z-index: 49;
  }

  .watch-only {
    position: relative;
    background: none;
    border: none;
    border-radius: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: none;
    width: 100%;
    max-width: none;
    min-width: 0;
    overflow: visible;
  }

  /* ── Header ── */
  .wo-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
  }
  .wo-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, rgba(245,158,11,0.22), rgba(245,158,11,0.08));
    border: 1px solid rgba(245,158,11,0.22);
    border-radius: 14px;
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .wo-title {
    font-size: 1.08rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #f8fafc;
  }
  .wo-title {
    font-family: 'Cinzel', serif;
    font-size: 1.05rem;
    letter-spacing: 0.03em;
    font-weight: 800;
    color: var(--n-white);
  }
  .wo-sub {
    font-size: 0.74rem;
    color: rgba(245,158,11,0.55);
    margin-top: 0.3rem;
    line-height: 1.4;
  }
  .wo-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.18), transparent);
    margin: 0.4rem 0 0;
  }

  .wo-main {
    display: block;
    width: 100%;
  }
  .wo-form,
  .wo-side {
    width: 100%;
    border-radius: 18px;
    box-shadow: inset 0 0 0 rgba(255,255,255,0.02);
  }
  .wo-form {
    padding: 0.65rem;
    background: none;
    border: none;
    backdrop-filter: none;
  }
  .wo-side {
    padding: 0.75rem;
    min-height: 260px;
    background: none;
    border: none;
  }

  @media (min-width: 760px) {
    .wo-main {
      display: block;
    }
    .wo-form {
      min-width: 0;
    }
  }

  .wo-row {
    display:grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(0, 0.95fr);
    gap:0.85rem;
    width:100%;
    align-items: end;
  }
  .wo-field {
    display:flex;
    flex-direction:column;
    gap:0.45rem;
    min-width:0;
    width:100%;
  }
  @media (max-width: 820px) {
    .wo-row {
      grid-template-columns: 1fr;
    }
  }
  .wo-field-label{
    font-size:0.6rem;
    font-weight:700;
    color:rgba(245,158,11,0.55);
    text-transform:uppercase;
    letter-spacing:0.08em;
  }
  .wo-input-wrap{
    position:relative;
    display:flex;
    align-items:center;
  }
  .wo-input {
    width:100%;
    padding:0.72rem 2.2rem 0.72rem 2rem;
    background: rgba(255,255,255,0.03);
    border:1px solid rgba(245,158,11,0.16);
    border-radius:12px;
    color:var(--n-white);
    font-family: 'Courier New', monospace;
    font-size:0.82rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .wo-input:focus{
    outline:none;
    border-color: rgba(245,158,11,0.45);
    box-shadow: 0 0 0 4px rgba(245,158,11,0.08);
  }
  .wo-input::placeholder{
    color: rgba(245,158,11,0.3);
  }
  .wo-input-icon{
    position:absolute;
    left:0.9rem;
  }
  .wo-valid-icon{
    position:absolute;
    right:0.85rem;
  }
  .wo-input.invalid {
    border-color: rgba(248,113,113,0.35);
  }

  .wo-net-selector {
    position: relative;
    z-index: 60;
  }
  .wo-net-btn{
    width:100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:0.75rem;
    padding:0.82rem 0.95rem;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(245,158,11,0.2);
    border-radius:12px;
    color:var(--n-white);
    transition: border-color 0.2s, background 0.2s;
  }
  .wo-net-btn:hover {
    border-color: rgba(245,158,11,0.35);
    background: rgba(255,255,255,0.06);
  }
  .wo-net-dropdown{
    position:absolute;
    bottom:calc(100% + 0.5rem);
    top:auto;
    left:0;
    right:0;
    background:rgba(6,8,18,0.96);
    border:1px solid rgba(245,158,11,0.22);
    z-index:80;
    border-radius:12px;
    min-width: 100%;
    max-height:240px;
    overflow-x:hidden;
    overflow-y:auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    pointer-events: auto;
    box-shadow:0 18px 40px rgba(0,0,0,0.35);
  }
  .wo-net-option{
    width:100%;
    display:flex;
    align-items:center;
    gap:0.65rem;
    padding:0.8rem 0.95rem;
    border-bottom:1px solid rgba(255,255,255,0.04);
    background:transparent;
    color:rgba(226,232,240,0.75);
    transition: background 0.2s;
  }
  .wo-net-option:hover {
    background: rgba(255,255,255,0.05);
  }
  .wo-net-option:last-child { border-bottom: none; }
  .wo-net-dot {
    width:10px;
    height:10px;
    background: rgba(245,158,11,0.75);
    border-radius:999px;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
  }
  .wo-net-dot.active {
    background: #22c55e;
    box-shadow: 0 0 0 4px rgba(34,197,94,0.12);
  }
  .wo-net-name, .wo-net-opt-name { font-weight:700; color:var(--n-white); }
  .wo-net-opt-cur { margin-left:auto; color:rgba(245,158,11,0.55); font-size:0.78rem; }

  .wo-actions{
    display:flex;
    gap:0.65rem;
    margin-top:0.9rem;
    flex-direction:column;
    align-items:stretch;
    width:100%;
  }
  .wo-btn-search,
  .wo-btn-reset,
  .wo-btn-secondary {
    min-width: 0;
  }
  .wo-btn-secondary {
    width:100%;
    min-height:3.2rem;
    padding: 1rem 1rem;
    background: rgba(59,130,246,0.16);
    border:1px solid rgba(59,130,246,0.28);
    border-radius:14px;
    color:#bfdbfe;
    font-weight:700;
    transition: transform 0.2s, background 0.2s;
  }
  .wo-btn-secondary:hover {
    transform: translateY(-1px);
    background: rgba(59,130,246,0.24);
  }
  .wo-btn-search{
    width:100%;
    padding:1rem 1rem;
    min-height:3.2rem;
    background:linear-gradient(90deg,var(--p-gold),var(--p-gold2));
    border:1px solid rgba(245,158,11,0.3);
    border-radius:14px;
    color:var(--i-black);
    font-family:'Cinzel',serif;
    font-size:0.96rem;
    font-weight:700;
    letter-spacing:0.02em;
    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
  }
  .wo-btn-search:hover{
    transform:translateY(-1px);
    box-shadow:0 18px 40px rgba(245,158,11,0.18);
    filter: saturate(1.05);
  }
  .wo-btn-reset{
    width:100%;
    padding:0.78rem 0.95rem;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(245,158,11,0.18);
    border-radius:14px;
    color:rgba(245,158,11,0.92);
    font-weight:700;
    transition: background 0.2s;
  }
  .wo-btn-reset:hover {
    background:rgba(255,255,255,0.08);
  }

  .wo-results-note {
    margin-top: 0.85rem;
    font-size: 0.88rem;
    color: rgba(226,232,240,0.78);
  }
  .wo-link-button {
    background: transparent;
    border: none;
    color: var(--p-gold2);
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }

  .wo-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    z-index: 80;
  }

  .wo-modal-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(420px, calc(100% - 32px));
    background: rgba(6, 8, 18, 0.96);
    border: 1px solid rgba(245, 158, 11, 0.22);
    border-radius: 22px;
    padding: 1.25rem 1.3rem;
    z-index: 90;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  }

  .wo-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .wo-modal-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--n-white);
  }

  .wo-modal-sub {
    margin: 0.3rem 0 0;
    font-size: 0.78rem;
    color: rgba(226, 232, 240, 0.7);
  }

  .wo-modal-copy {
    color: rgba(226, 232, 240, 0.72);
    font-size: 0.88rem;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .wo-modal-top-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .wo-modal-description {
    margin: 0.8rem 0 1rem;
    color: rgba(226, 232, 240, 0.78);
  }

  .wo-modal-field {
    margin-bottom: 1rem;
  }

  .wo-modal-field-label {
    margin-bottom: 0.65rem;
    color: rgba(226, 232, 240, 0.7);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
  }

  .wo-faucet-net-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .wo-modal-required {
    margin-top: 0.45rem;
    color: rgba(226, 232, 240, 0.7);
    font-size: 0.78rem;
  }

  .wo-modal-input {
    width: 100%;
    padding: 0.95rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    color: #ffffff;
    font-family: 'Courier New', monospace;
    font-size: 0.88rem;
    transition: border-color 0.2s, background 0.2s;
  }

  .wo-modal-input::placeholder {
    color: rgba(226, 232, 240, 0.45);
  }

  .wo-modal-input:focus {
    outline: none;
    border-color: rgba(245, 158, 11, 0.45);
    background: rgba(255, 255, 255, 0.08);
  }

  .wo-faucet-net-btn {
    flex: 1 1 45%;
    min-width: 0;
    padding: 0.75rem 0.85rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.88);
    font-size: 0.85rem;
    font-weight: 700;
    transition: transform 0.2s, background 0.2s, border-color 0.2s;
    text-align: center;
  }

  .wo-faucet-net-btn.active {
    background: rgba(245, 158, 11, 0.16);
    border-color: rgba(245, 158, 11, 0.32);
    color: #ffffff;
  }

  .wo-faucet-net-btn:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.1);
  }

  .wo-modal-heading {
    margin: 0.6rem 0 0.35rem;
    font-size: 1.12rem;
    font-weight: 800;
    color: #ffffff;
  }

  .wo-modal-body {
    margin: 0;
    color: rgba(226, 232, 240, 0.82);
  }

  .wo-modal-tag {
    display: inline-flex;
    margin-bottom: 0.65rem;
    padding: 0.18rem 0.7rem;
    background: rgba(59, 130, 246, 0.14);
    border: 1px solid rgba(59, 130, 246, 0.28);
    border-radius: 999px;
    color: #bfdbfe;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .wo-faucet-summary {
    display: grid;
    gap: 0.75rem;
    padding: 0.95rem 1rem;
    margin-bottom: 0.95rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
  }

  .wo-faucet-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.88rem;
  }

  .wo-faucet-row strong {
    color: #ffffff;
    font-weight: 700;
    text-align: right;
    word-break: break-all;
  }

  .wo-modal-note {
    margin-top: 0.25rem;
    color: rgba(255, 255, 255, 0.68);
    font-size: 0.82rem;
  }

  .wo-modal-address {
    word-break: break-all;
    margin: 0.5rem 0;
    padding: 0.85rem 1rem;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #f8fafc;
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
  }

  .wo-modal-actions {
    display: grid;
    gap: 0.75rem;
  }

  .wo-modal-close {
    background: transparent;
    border: none;
    color: rgba(226, 232, 240, 0.8);
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
  }

  @media (max-width:520px){
    .wo-actions{ flex-direction:column; }
    .wo-btn-search, .wo-btn-reset{ width:100%; }
  }

  .wo-results{
    display:flex;
    flex-direction:column;
    gap:0.95rem;
  }
  .wo-result-card{
    background: linear-gradient(180deg, rgba(36,45,76,0.9), rgba(12,15,30,0.9));
    border:1px solid rgba(245,158,11,0.14);
    border-radius:14px;
    padding:1rem;
    box-shadow:0 18px 35px rgba(0,0,0,0.25);
  }
  .wrc-row{
    display:grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom:0.9rem;
  }
  .wrc-label{
    display:block;
    font-size:0.57rem;
    font-weight:700;
    color:rgba(245,158,11,0.55);
    text-transform:uppercase;
    letter-spacing:0.08em;
    margin-bottom:0.3rem;
  }
  .wrc-value{
    font-size:0.95rem;
    color:#f8fafc;
    font-weight:700;
  }
  .wrc-balance{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:0.75rem 0.85rem;
    background: rgba(255,255,255,0.04);
    border-radius:12px;
    border:1px solid rgba(245,158,11,0.12);
  }
  .wrc-bal-label{
    font-size:0.62rem;
    font-weight:700;
    color:rgba(245,158,11,0.55);
    text-transform:uppercase;
  }
  .wrc-bal-value{
    font-family:'Cinzel',serif;
    font-size:1.22rem;
    font-weight:800;
    color:var(--n-gold2);
    text-shadow:0 0 18px rgba(245,158,11,0.25);
  }

  .wo-section{
    display:flex;
    flex-direction:column;
    gap:0.55rem;
    padding:0.85rem 0;
    border-top:1px solid rgba(255,255,255,0.05);
  }
  .wo-section-title{
    display:flex;
    align-items:center;
    gap:0.48rem;
    font-size:0.7rem;
    font-weight:800;
    color:rgba(245,158,11,0.7);
    text-transform:uppercase;
    letter-spacing:0.08em;
  }
  .wo-empty-note{
    font-size:0.65rem;
    color:rgba(196,181,253,0.32);
  }

  .wo-token{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:0.4rem;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(147,51,234,0.16);
    border-radius:12px;
    padding:0.65rem 0.9rem;
  }
  .wo-token-symbol{
    font-size:0.78rem;
    font-weight:700;
    color:#c4b5fd;
  }
  .wo-token-balance{
    font-weight:700;
    color:#f8fafc;
  }

  .wo-txlist{
    display:flex;
    flex-direction:column;
    gap:0.5rem;
  }
  .wo-tx{
    display:flex;
    align-items:center;
    gap:0.85rem;
    padding:0.85rem 0.95rem;
    background:rgba(255,255,255,0.03);
    border-left:3px solid rgba(245,158,11,0.3);
    border-radius:12px;
  }
  .wo-tx.incoming{ border-left-color:#22c55e; }
  .wo-tx.failed{ border-left-color:#dc2626; opacity:0.78; }
  .wo-tx-info{
    flex:1;
    display:flex;
    flex-direction:column;
    gap:0.18rem;
  }
  .wo-tx-hash{
    font-size:0.72rem;
    color:rgba(226,232,240,0.7);
  }
  .wo-tx-peer{
    font-size:0.68rem;
    color:rgba(245,158,11,0.55);
  }
  .wo-tx-amount{
    font-weight:700;
    color:var(--n-gold2);
    font-size:0.78rem;
    white-space: nowrap;
  }
  .wo-tx-link{
    color:rgba(196,181,253,0.45);
    display:flex;
    align-items:center;
  }
  .wo-tx-link:hover{ color:#c4b5fd; }

  .wo-error{
    display:flex;
    align-items:center;
    gap:0.6rem;
    font-size:0.82rem;
    color:#f87171;
    padding:0.75rem 0.95rem;
    background:rgba(248,113,113,0.12);
    border:1px solid rgba(248,113,113,0.24);
    border-radius:12px;
  }

  .spin{ animation: spinAnim 0.8s linear infinite; }
  @keyframes spinAnim{ to{ transform: rotate(360deg); } }

  /* ── Multi-network balance ── */
  .wo-modal-wide {
    width: min(640px, calc(100% - 32px));
    max-height: 80vh;
    overflow-y: auto;
  }

  .wo-btn-multi {
    width: 100%;
    padding: 0.9rem 1rem;
    min-height: 3rem;
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.28);
    border-radius: 14px;
    color: #93c5fd;
    font-family: 'Cinzel', serif;
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .wo-btn-multi:hover:not(:disabled) {
    transform: translateY(-1px);
    background: rgba(59,130,246,0.2);
    box-shadow: 0 8px 24px rgba(59,130,246,0.15);
  }
  .wo-btn-multi:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Skeleton de carga */
  .multi-loading-grid {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .multi-net-skeleton {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 0.95rem;
    background: rgba(255,255,255,0.03);
    border-radius: 10px;
    animation: shimmer 1.4s ease-in-out infinite;
  }
  @keyframes shimmer {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.9; }
  }
  .skeleton-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(245,158,11,0.4);
    flex-shrink: 0;
  }
  .skeleton-name {
    font-size: 0.78rem;
    color: rgba(226,232,240,0.5);
    flex: 1;
  }
  .skeleton-bar {
    width: 80px; height: 10px;
    border-radius: 6px;
    background: rgba(245,158,11,0.15);
  }

  /* Resumen superior */
  .multi-summary-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .multi-stat {
    flex: 1;
    min-width: 90px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 0.65rem 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .multi-stat-label {
    font-size: 0.53rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(245,158,11,0.45);
    text-transform: uppercase;
  }
  .multi-stat-val {
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--n-white);
  }
  .multi-stat-val.gold { color: var(--n-gold2); }
  .multi-stat-val.red  { color: #f87171; }

  /* Lista de redes */
  .multi-net-list {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .multi-net-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.7rem 0.9rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    transition: background 0.15s, border-color 0.15s;
  }
  .multi-net-row.has-balance {
    background: rgba(245,158,11,0.05);
    border-color: rgba(245,158,11,0.18);
  }
  .multi-net-row.net-error {
    opacity: 0.55;
  }
  .mnr-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-width: 0;
  }
  .mnr-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: rgba(255,255,255,0.2);
  }
  .mnr-dot.dot-ok  { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.5); }
  .mnr-dot.dot-err { background: #f87171; }
  .mnr-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }
  .mnr-name {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--n-white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mnr-label {
    font-size: 0.6rem;
    color: rgba(226,232,240,0.4);
    white-space: nowrap;
  }
  .mnr-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  .mnr-balance {
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(226,232,240,0.5);
  }
  .mnr-balance.nonzero {
    color: var(--n-gold2);
    text-shadow: 0 0 10px rgba(245,158,11,0.3);
  }
  .mnr-cur {
    font-size: 0.65rem;
    color: rgba(245,158,11,0.5);
    margin-left: 0.2rem;
  }
  .mnr-error {
    font-size: 0.68rem;
    color: #f87171;
  }
  .mnr-explorer {
    color: rgba(147,197,253,0.4);
    display: flex;
    align-items: center;
  }
  .mnr-explorer:hover { color: #93c5fd; }
</style>
