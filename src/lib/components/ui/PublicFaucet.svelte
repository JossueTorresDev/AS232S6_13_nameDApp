<script lang="ts">
  import { ethers }             from 'ethers';
  import { AVAILABLE_NETWORKS } from '$lib/constants/network';
  import { isFaucetContractAvailable } from '$lib/constants/faucet-contract';
  import {
    getFaucetContractInfo,
    requestFaucetFunds,
    formatCooldown,
    type FaucetContractInfo
  } from '$lib/services/public-faucet.service';
  import { faucetStore }        from '$lib/stores/faucet.store';
  import { shortAddress }       from '$lib/utils/format';
  import type { NetworkInfo }   from '$lib/types/network';

  // ── Estado ────────────────────────────────────────────────────────────────
  let recipientAddress  = '';
  let selectedNetwork: NetworkInfo = AVAILABLE_NETWORKS.find(n => n.chainId === 11155111)
    ?? AVAILABLE_NETWORKS.find(n => n.type === 'EVM')
    ?? AVAILABLE_NETWORKS[0];

  let contractInfo: FaucetContractInfo | null = null;
  let loadingInfo   = false;
  let requesting    = false;
  let successHash   = '';
  let errorMsg      = '';
  let netOpen       = false;

  // ── Derivados ────────────────────────────────────────────────────────────
  $: evmNetworks      = AVAILABLE_NETWORKS.filter(n => n.type === 'EVM');
  $: addressValid     = ethers.isAddress(recipientAddress);
  $: canRequest       = addressValid
                        && contractInfo?.available
                        && contractInfo.remainingSecs === 0
                        && !requesting;
  $: cooldownLabel    = contractInfo ? formatCooldown(contractInfo.remainingSecs) : '';
  $: contractSupported = isFaucetContractAvailable(selectedNetwork.chainId);

  // Carga la info del contrato cuando cambia la red o la dirección
  $: if (selectedNetwork) loadContractInfo();

  async function loadContractInfo() {
    loadingInfo  = true;
    contractInfo = null;
    errorMsg     = '';
    try {
      contractInfo = await getFaucetContractInfo(
        selectedNetwork,
        addressValid ? recipientAddress : undefined
      );
    } catch {
      contractInfo = null;
    } finally {
      loadingInfo = false;
    }
  }

  // Re-check cooldown cuando cambia la dirección (sin re-fetch completo)
  async function recheckCooldown() {
    if (!addressValid || !contractSupported) return;
    try {
      contractInfo = await getFaucetContractInfo(selectedNetwork, recipientAddress);
    } catch { /* silencioso */ }
  }

  function selectNetwork(net: NetworkInfo) {
    selectedNetwork = net;
    netOpen         = false;
    successHash     = '';
    errorMsg        = '';
  }

  async function handleRequest() {
    if (!canRequest) return;
    requesting  = true;
    successHash = '';
    errorMsg    = '';

    try {
      successHash = await requestFaucetFunds(recipientAddress, selectedNetwork);
      // Recargar info del contrato para mostrar cooldown actualizado
      await loadContractInfo();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Error al solicitar fondos';
    } finally {
      requesting = false;
    }
  }
</script>

<div class="faucet-panel">
  <!-- Header -->
  <div class="fp-header">
    <div class="fp-icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div>
      <h3 class="fp-title">Faucet Público On-Chain</h3>
      <p class="fp-sub">Solicita tokens de prueba directamente desde el contrato. Sin login requerido.</p>
    </div>
  </div>

  <!-- Selector de red -->
  <div class="fp-section">
    <label class="fp-label">RED</label>
    <div class="fp-net-wrap" class:open={netOpen}>
      <button
        class="fp-net-btn"
        type="button"
        on:click={() => netOpen = !netOpen}
        aria-haspopup="listbox"
        aria-expanded={netOpen}
        aria-label="Seleccionar red"
      >
        <span class="fp-net-dot" class:supported={contractSupported}></span>
        <span class="fp-net-name">{selectedNetwork.name}</span>
        <span class="fp-net-cur">{selectedNetwork.currency}</span>
        {#if !contractSupported}
          <span class="fp-net-badge-na">Sin contrato</span>
        {/if}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="rgba(245,158,11,0.5)" stroke-width="2.5" stroke-linecap="round"
          style="transform:rotate({netOpen ? 180 : 0}deg);transition:transform 0.2s;flex-shrink:0"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {#if netOpen}
        <div class="fp-net-dropdown" role="listbox">
          {#each evmNetworks as net (net.chainId)}
            <button
              class="fp-net-option"
              class:selected={net.chainId === selectedNetwork.chainId}
              type="button"
              on:click={() => selectNetwork(net)}
              role="option"
              aria-selected={net.chainId === selectedNetwork.chainId}
            >
              <span class="fp-net-dot" class:supported={isFaucetContractAvailable(net.chainId)}></span>
              <span class="fp-net-opt-name">{net.name}</span>
              <span class="fp-net-opt-cur">{net.currency}</span>
              {#if isFaucetContractAvailable(net.chainId)}
                <span class="fp-badge-active">● Activo</span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Info del contrato -->
  {#if !contractSupported}
    <div class="fp-notice">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.7)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      El contrato faucet no está desplegado en <strong>{selectedNetwork.name}</strong>.
      Selecciona Sepolia o Hoodi para usar el faucet on-chain.
    </div>
  {:else if loadingInfo}
    <div class="fp-info-skeleton">
      <span class="fp-sk-bar"></span>
      <span class="fp-sk-bar short"></span>
    </div>
  {:else if contractInfo?.available}
    <div class="fp-contract-info">
      <div class="fci-row">
        <div class="fci-item">
          <span class="fci-label">BALANCE CONTRATO</span>
          <span class="fci-value gold">{parseFloat(contractInfo.balance).toFixed(4)} <span class="fci-cur">{selectedNetwork.currency}</span></span>
        </div>
        <div class="fci-item">
          <span class="fci-label">POR SOLICITUD</span>
          <span class="fci-value">{parseFloat(contractInfo.dripAmount).toFixed(4)} <span class="fci-cur">{selectedNetwork.currency}</span></span>
        </div>
        <div class="fci-item">
          <span class="fci-label">SOLICITUDES TOTALES</span>
          <span class="fci-value">{contractInfo.totalRequests}</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="fp-notice warn">
      No se pudo conectar con el contrato en {selectedNetwork.name}.
    </div>
  {/if}

  <!-- Dirección destinataria -->
  <div class="fp-section">
    <label class="fp-label" for="fp-addr">DIRECCIÓN DESTINATARIA</label>
    <div class="fp-input-wrap">
      <svg class="fp-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.4)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      <input
        id="fp-addr"
        class="fp-input"
        class:valid={addressValid}
        class:invalid={recipientAddress.length > 5 && !addressValid}
        type="text"
        placeholder="0x... dirección que recibirá tokens"
        bind:value={recipientAddress}
        on:blur={recheckCooldown}
        spellcheck="false"
        autocomplete="off"
        disabled={requesting}
        aria-label="Dirección destinataria"
      />
      {#if addressValid}
        <svg class="fp-valid-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      {/if}
    </div>
  </div>

  <!-- Cooldown -->
  {#if addressValid && contractInfo?.available && contractInfo.remainingSecs > 0}
    <div class="fp-cooldown">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.7)" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      Cooldown activo: <strong>{cooldownLabel}</strong> para esta dirección
    </div>
  {/if}

  <!-- Botón de solicitud -->
  <button
    class="fp-btn-request"
    type="button"
    on:click={handleRequest}
    disabled={!canRequest || !contractSupported}
    aria-label="Solicitar fondos del faucet"
  >
    {#if requesting}
      <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Enviando transacción...
    {:else if contractInfo?.remainingSecs && contractInfo.remainingSecs > 0}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      Cooldown: {cooldownLabel}
    {:else}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      Solicitar {contractInfo?.dripAmount ? parseFloat(contractInfo.dripAmount).toFixed(4) : ''} {selectedNetwork.currency}
    {/if}
  </button>

  <!-- Éxito -->
  {#if successHash}
    <div class="fp-success" role="status">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <div>
        <p class="fp-success-title">¡Solicitud enviada con éxito!</p>
        <p class="fp-success-hash">
          Hash: <span class="mono">{shortAddress(successHash)}</span>
          {#if selectedNetwork.blockExplorer}
            <a
              href="{selectedNetwork.blockExplorer}/tx/{successHash}"
              target="_blank"
              rel="noopener noreferrer"
              class="fp-explorer-link"
              aria-label="Ver en explorador"
            >Ver en explorer →</a>
          {/if}
        </p>
      </div>
    </div>
  {/if}

  <!-- Error -->
  {#if errorMsg}
    <div class="fp-error" role="alert">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {errorMsg}
    </div>
  {/if}
</div>

<style>
  .faucet-panel {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  /* Header */
  .fp-header {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
  }
  .fp-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06));
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fp-title {
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--n-white);
  }
  .fp-sub {
    font-size: 0.72rem;
    color: rgba(245,158,11,0.55);
    margin-top: 0.3rem;
    line-height: 1.4;
  }

  /* Sección + label */
  .fp-section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .fp-label {
    font-size: 0.58rem;
    font-weight: 700;
    color: rgba(245,158,11,0.55);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* Selector de red */
  .fp-net-wrap {
    position: relative;
    z-index: 50;
  }
  .fp-net-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 0.95rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 12px;
    color: var(--n-white);
    font-weight: 700;
    transition: border-color 0.2s;
  }
  .fp-net-btn:hover { border-color: rgba(245,158,11,0.35); }
  .fp-net-dropdown {
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 0; right: 0;
    background: rgba(6,8,18,0.97);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 12px;
    max-height: 220px;
    overflow-y: auto;
    z-index: 60;
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }
  .fp-net-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 0.95rem;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    background: transparent;
    color: rgba(226,232,240,0.75);
    transition: background 0.15s;
  }
  .fp-net-option:last-child { border-bottom: none; }
  .fp-net-option:hover { background: rgba(255,255,255,0.05); }
  .fp-net-option.selected { background: rgba(245,158,11,0.06); }

  .fp-net-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: rgba(255,255,255,0.2);
  }
  .fp-net-dot.supported {
    background: #22c55e;
    box-shadow: 0 0 5px rgba(34,197,94,0.5);
  }
  .fp-net-name, .fp-net-opt-name { font-weight: 700; color: var(--n-white); flex: 1; text-align: left; }
  .fp-net-cur, .fp-net-opt-cur { font-size: 0.75rem; color: rgba(245,158,11,0.55); }
  .fp-net-badge-na {
    font-size: 0.6rem;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    background: rgba(248,113,113,0.12);
    border: 1px solid rgba(248,113,113,0.25);
    color: #fca5a5;
  }
  .fp-badge-active {
    font-size: 0.6rem;
    color: #86efac;
    margin-left: auto;
  }

  /* Aviso */
  .fp-notice {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    font-size: 0.8rem;
    color: rgba(245,158,11,0.75);
    padding: 0.75rem 0.9rem;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.16);
    border-radius: 10px;
    line-height: 1.5;
  }
  .fp-notice.warn {
    color: #fca5a5;
    background: rgba(248,113,113,0.06);
    border-color: rgba(248,113,113,0.18);
  }

  /* Info del contrato */
  .fp-info-skeleton {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.9rem;
    background: rgba(255,255,255,0.02);
    border-radius: 10px;
    animation: shimmer 1.4s ease-in-out infinite;
  }
  .fp-sk-bar {
    height: 10px;
    border-radius: 6px;
    background: rgba(245,158,11,0.12);
  }
  .fp-sk-bar.short { width: 60%; }
  @keyframes shimmer {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 1; }
  }

  .fp-contract-info {
    padding: 0.85rem 0.95rem;
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 12px;
  }
  .fci-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
  }
  .fci-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .fci-label {
    font-size: 0.53rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(245,158,11,0.45);
    text-transform: uppercase;
  }
  .fci-value {
    font-family: 'Cinzel', serif;
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--n-white);
  }
  .fci-value.gold { color: var(--n-gold2); }
  .fci-cur { font-size: 0.65rem; color: rgba(245,158,11,0.5); }

  /* Input dirección */
  .fp-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .fp-input {
    width: 100%;
    padding: 0.75rem 2.2rem 0.75rem 2rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(245,158,11,0.16);
    border-radius: 12px;
    color: var(--n-white);
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .fp-input:focus {
    outline: none;
    border-color: rgba(245,158,11,0.45);
    box-shadow: 0 0 0 4px rgba(245,158,11,0.07);
  }
  .fp-input::placeholder { color: rgba(245,158,11,0.3); }
  .fp-input.invalid { border-color: rgba(248,113,113,0.3); }
  .fp-input-icon { position: absolute; left: 0.85rem; pointer-events: none; }
  .fp-valid-icon { position: absolute; right: 0.85rem; pointer-events: none; }

  /* Cooldown */
  .fp-cooldown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: rgba(245,158,11,0.75);
    padding: 0.6rem 0.85rem;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.14);
    border-radius: 10px;
  }
  .fp-cooldown strong { color: var(--n-gold2); }

  /* Botón principal */
  .fp-btn-request {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,191,36,0.12));
    border: 1px solid rgba(245,158,11,0.32);
    border-radius: 14px;
    color: var(--n-white);
    font-family: 'Cinzel', serif;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .fp-btn-request:hover:not(:disabled) {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(245,158,11,0.28), rgba(251,191,36,0.2));
    box-shadow: 0 12px 30px rgba(245,158,11,0.2);
  }
  .fp-btn-request:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Éxito */
  .fp-success {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.9rem 1rem;
    background: rgba(34,197,94,0.07);
    border: 1px solid rgba(34,197,94,0.22);
    border-radius: 12px;
  }
  .fp-success-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #86efac;
    margin-bottom: 0.2rem;
  }
  .fp-success-hash {
    font-size: 0.75rem;
    color: rgba(134,239,172,0.7);
  }
  .fp-explorer-link {
    color: #86efac;
    margin-left: 0.5rem;
    text-decoration: underline;
  }
  .fp-explorer-link:hover { color: #bbf7d0; }

  /* Error */
  .fp-error {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    font-size: 0.8rem;
    color: #fca5a5;
    padding: 0.75rem 0.9rem;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.22);
    border-radius: 10px;
    line-height: 1.5;
  }

  .spin { animation: spinAnim 0.8s linear infinite; }
  @keyframes spinAnim { to { transform: rotate(360deg); } }
  .mono { font-family: 'Courier New', monospace; }

  @media (max-width: 480px) {
    .fci-row { grid-template-columns: 1fr 1fr; }
  }
</style>
