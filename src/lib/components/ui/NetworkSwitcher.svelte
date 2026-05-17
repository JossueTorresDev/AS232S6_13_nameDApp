<script lang="ts">
  import { walletStore }      from '$lib/stores/wallet.store';
  import { transactionStore } from '$lib/stores/transaction.store';
  import { toastStore }       from '$lib/stores/toast.store';
  import { switchNetwork }    from '$lib/services/transaction.service';
  import { AVAILABLE_NETWORKS, UTXO_NETWORKS, EVM_NETWORKS } from '$lib/constants/network';
  import type { NetworkInfo } from '$lib/types/wallet';
  import { scale }            from 'svelte/transition';
  import { elasticOut }       from 'svelte/easing';

  // ── State ─────────────────────────────────────────────────────────────────
  let loading      = false;
  let showNetworks = false;
  let selectedType: 'all' | 'utxo' | 'evm' = 'all';

  // ── Custom networks (en memoria) ──────────────────────────────────────────
  let customNetworks: NetworkInfo[] = [];

  // ── Redes eliminadas (en memoria) ─────────────────────────────────────────
  let deletedNetworks: number[] = [];

  $: allNetworks = [...AVAILABLE_NETWORKS.filter(n => !deletedNetworks.includes(n.chainId)), ...customNetworks];

  $: filteredNetworks =
    selectedType === 'utxo' ? allNetworks.filter(n => n.type === 'UTXO') :
    selectedType === 'evm'  ? allNetworks.filter(n => n.type === 'EVM')  :
    allNetworks;

  // ── Switch ────────────────────────────────────────────────────────────────
  async function handleNetworkSwitch(network: NetworkInfo) {
    loading = true;
    transactionStore.setError('');
    try {
      await switchNetwork(network);
      walletStore.setNetwork(network);
      showNetworks = false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar de red';
      transactionStore.setError(message);
    } finally {
      loading = false;
    }
  }

  function removeNetwork(chainId: number, name: string) {
    if (customNetworks.some(c => c.chainId === chainId)) {
      customNetworks = customNetworks.filter(n => n.chainId !== chainId);
    } else {
      deletedNetworks = [...deletedNetworks, chainId];
    }
    toastStore.info(`Red "${name}" eliminada`);
  }

  // ── Add custom network modal ──────────────────────────────────────────────
  let showAddModal = false;

  // Form fields
  let form = {
    name:        '',
    rpcUrl:      '',
    chainId:     '',
    currency:    '',
    blockExplorer: '',
    type:        'EVM' as 'EVM' | 'UTXO',
  };

  let formError = '';

  function openAddModal() {
    showNetworks = false;
    showAddModal = true;
    formError    = '';
    form = { name: '', rpcUrl: '', chainId: '', currency: '', blockExplorer: '', type: 'EVM' };
  }

  function closeAddModal() {
    showAddModal = false;
    formError    = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showAddModal) closeAddModal();
  }

  function validateForm(): string | null {
    if (!form.name.trim())    return 'El nombre es obligatorio';
    if (!form.rpcUrl.trim())  return 'La URL RPC es obligatoria';
    if (!form.rpcUrl.startsWith('http')) return 'La URL RPC debe comenzar con http(s)://';
    const id = parseInt(form.chainId);
    if (!form.chainId || isNaN(id) || id <= 0) return 'Chain ID inválido';
    if (allNetworks.some(n => n.chainId === id)) return `Chain ID ${id} ya existe`;
    if (!form.currency.trim()) return 'El símbolo de moneda es obligatorio';
    return null;
  }

  function saveNetwork() {
    formError = validateForm() ?? '';
    if (formError) return;

    const id = parseInt(form.chainId);

    if (deletedNetworks.includes(id)) {
      deletedNetworks = deletedNetworks.filter(x => x !== id);
      toastStore.success(`Red restaurada exitosamente`);
      closeAddModal();
      return;
    }

    const newNet: NetworkInfo = {
      name:          form.name.trim(),
      label:         'Custom',
      chainId:       id,
      rpcUrl:        form.rpcUrl.trim(),
      type:          form.type,
      currency:      form.currency.trim().toUpperCase(),
      blockExplorer: form.blockExplorer.trim() || undefined,
    };

    customNetworks = [...customNetworks, newNet];
    toastStore.success(`Red "${newNet.name}" agregada`);
    closeAddModal();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- ── Network switcher button ── -->
<div class="network-switcher">
  <button class="network-button" on:click={() => showNetworks = !showNetworks} disabled={loading} aria-label="Cambiar red">
    <div class="network-status">
      <span class="status-dot"></span>
      <div class="network-info">
        <span class="network-label">Red Actual</span>
        <span class="network-name">{$walletStore.currentNetwork?.name || 'No conectada'}</span>
      </div>
    </div>
    <svg class="chevron" class:open={showNetworks} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </button>

  <!-- ── Dropdown ── -->
  {#if showNetworks}
    <div class="networks-dropdown">

      <!-- Filters + Add button row -->
      <div class="network-filters">
        {#each ['all', 'utxo', 'evm'] as f}
          <button
            class="filter-btn"
            class:active={selectedType === f}
            on:click={() => selectedType = f}
            aria-pressed={selectedType === f}
          >
            {f === 'all' ? 'Todas' : f.toUpperCase()}
          </button>
        {/each}
        <button class="btn-add-network" on:click={openAddModal} aria-label="Agregar red personalizada" title="Agregar red">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <!-- List -->
      <div class="networks-list" role="list">
        {#each filteredNetworks as network (network.chainId)}
          <div class="network-item-wrap" role="listitem">
            <button
              class="network-item"
              class:active={$walletStore.currentNetwork?.chainId === network.chainId}
              on:click={() => handleNetworkSwitch(network)}
              disabled={loading}
              aria-label="Cambiar a {network.name}"
            >
              <div class="network-item-header">
                <span class="network-item-name">{network.name}</span>
                <span class="network-type">{network.type}</span>
              </div>
              <span class="network-currency">{network.currency}</span>
              {#if $walletStore.currentNetwork?.chainId === network.chainId}
                <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              {/if}
            </button>
            <!-- Remove network button -->
            <button
              class="remove-custom"
              on:click|stopPropagation={() => removeNetwork(network.chainId, network.name)}
              aria-label="Eliminar red {network.name}"
              title="Eliminar red"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>

    </div>
  {/if}
</div>

<!-- ═══════════════════════════════════════════════════════════
     MODAL — Agregar red custom
     ═══════════════════════════════════════════════════════════ -->
{#if showAddModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={closeAddModal} role="dialog" aria-modal="true" aria-label="Agregar red personalizada">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="modal-box"
      on:click|stopPropagation
      in:scale={{ duration: 340, easing: elasticOut, start: 0.8 }}
      out:scale={{ duration: 180, start: 0.9 }}
    >

      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          <h3 class="modal-title">Custom RPC</h3>
        </div>
        <button class="modal-close" on:click={closeAddModal} aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-divider"></div>

      <!-- Type toggle EVM / UTXO -->
      <div class="type-toggle">
        <button
          class="type-btn"
          class:active={form.type === 'EVM'}
          on:click={() => form.type = 'EVM'}
          aria-pressed={form.type === 'EVM'}
        >EVM</button>
        <div class="type-slider" class:utxo={form.type === 'UTXO'} aria-hidden="true"></div>
        <button
          class="type-btn"
          class:active={form.type === 'UTXO'}
          on:click={() => form.type = 'UTXO'}
          aria-pressed={form.type === 'UTXO'}
        >UTXO</button>
      </div>

      <!-- Form fields -->
      <div class="modal-form">

        <div class="field-group">
          <label class="field-label" for="cn-name">Nombre de la red</label>
          <input
            id="cn-name"
            class="field-input"
            type="text"
            placeholder="ej. Binance Smart Chain"
            bind:value={form.name}
            aria-label="Nombre de la red"
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="cn-rpc">RPC URL</label>
          <input
            id="cn-rpc"
            class="field-input mono"
            type="url"
            placeholder="https://rpc.example.com"
            bind:value={form.rpcUrl}
            aria-label="URL del RPC"
            spellcheck="false"
            autocomplete="off"
          />
        </div>

        <div class="field-row">
          <div class="field-group">
            <label class="field-label" for="cn-chainid">Chain ID</label>
            <input
              id="cn-chainid"
              class="field-input mono"
              type="number"
              placeholder="ej. 56"
              bind:value={form.chainId}
              aria-label="Chain ID"
              min="1"
            />
          </div>
          <div class="field-group">
            <label class="field-label" for="cn-symbol">Símbolo</label>
            <input
              id="cn-symbol"
              class="field-input"
              type="text"
              placeholder="ej. BNB"
              bind:value={form.currency}
              aria-label="Símbolo de la moneda"
              maxlength="10"
            />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="cn-explorer">
            Block Explorer
            <span class="field-optional">(opcional)</span>
          </label>
          <input
            id="cn-explorer"
            class="field-input mono"
            type="url"
            placeholder="https://explorer.example.com"
            bind:value={form.blockExplorer}
            aria-label="URL del block explorer (opcional)"
            spellcheck="false"
            autocomplete="off"
          />
        </div>

      </div>

      {#if formError}
        <p class="form-error" role="alert">{formError}</p>
      {/if}

      <!-- Save button -->
      <button class="btn-save" on:click={saveNetwork} aria-label="Guardar red personalizada">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Guardar Red
      </button>

    </div>
  </div>
{/if}

<style>
  /* ── Switcher ── */
  .network-switcher { position: relative; z-index: 10; }

  .network-button {
    width: 100%;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; padding: 0.9rem 1.2rem;
    background: rgba(245,158,11,0.05);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 8px; color: var(--n-white);
    cursor: pointer; transition: all 0.3s; font-family: inherit;
  }

  .network-button:hover:not(:disabled) { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.35); }
  .network-button:disabled { opacity: 0.6; cursor: not-allowed; }

  .network-status { display: flex; align-items: center; gap: 0.75rem; flex: 1; text-align: left; }

  .status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--n-gold); box-shadow: 0 0 8px var(--n-gold);
    flex-shrink: 0; animation: pulse 2s infinite;
  }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .network-info { display: flex; flex-direction: column; gap: 0.2rem; }

  .network-label { font-size: 0.7rem; color: rgba(245,158,11,0.6); letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700; }
  .network-name  { font-size: 0.95rem; font-weight: 700; color: var(--n-white); }

  .chevron { transition: transform 0.3s; color: rgba(245,158,11,0.6); }
  .chevron.open { transform: rotate(180deg); }

  /* ── Dropdown ── */
  .networks-dropdown {
    position: absolute; top: 100%; left: 0; right: 0;
    margin-top: 0.5rem;
    background: rgba(6,4,10,0.96);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 8px; overflow: hidden;
    z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);
  }

  .network-filters {
    display: flex; gap: 0.5rem; padding: 0.75rem;
    border-bottom: 1px solid rgba(245,158,11,0.1);
  }

  .filter-btn {
    flex: 1; padding: 0.5rem;
    background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.1);
    border-radius: 4px; color: rgba(245,158,11,0.6);
    font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
  }

  .filter-btn:hover  { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); }
  .filter-btn.active { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4); color: var(--n-gold2); }

  .networks-list { max-height: 320px; overflow-y: auto; }

  .networks-list::-webkit-scrollbar { width: 4px; }
  .networks-list::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 2px; }

  .network-item-wrap {
    display: flex; align-items: center;
    border-bottom: 1px solid rgba(245,158,11,0.05);
  }

  .network-item-wrap:last-child { border-bottom: none; }

  .network-item {
    flex: 1;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; padding: 0.9rem 1rem;
    background: transparent; border: none;
    color: var(--n-white); cursor: pointer;
    transition: all 0.2s; text-align: left; font-family: inherit;
  }

  .network-item:hover:not(:disabled) { background: rgba(245,158,11,0.08); }

  .network-item.active {
    background: rgba(245,158,11,0.12);
    border-left: 3px solid var(--n-gold);
    padding-left: calc(1rem - 3px);
  }

  .network-item:disabled { opacity: 0.5; cursor: not-allowed; }

  .network-item-header { flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .network-item-name   { font-size: 0.95rem; font-weight: 700; }

  .network-type {
    font-size: 0.75rem;
    background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.25);
    border-radius: 3px; padding: 0.2rem 0.6rem;
    color: var(--n-gold2); font-weight: 700; letter-spacing: 0.05em;
  }

  .network-currency { font-size: 0.85rem; color: rgba(245,158,11,0.6); font-weight: 700; }
  .check-icon { color: var(--n-gold); flex-shrink: 0; }

  .remove-custom {
    flex-shrink: 0; padding: 0.5rem 0.75rem;
    background: transparent; border: none;
    color: rgba(220,38,38,0.4); cursor: pointer;
    transition: color 0.15s;
  }

  .remove-custom:hover { color: #f87171; }

  /* ── Add network button (inline con filtros) ── */
  .btn-add-network {
    flex-shrink: 0;
    width: 34px; height: 34px;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.4);
    border-radius: 6px;
    color: var(--n-gold2);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 0 8px rgba(245,158,11,0.15);
  }

  .btn-add-network:hover {
    background: rgba(245,158,11,0.22);
    border-color: var(--n-gold2);
    box-shadow: 0 0 16px rgba(245,158,11,0.3);
    transform: scale(1.08);
  }

  /* ═══════════════════════════════════════════════════════════
     MODAL
     ═══════════════════════════════════════════════════════════ */

  .modal-backdrop {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(6,4,10,0.82);
    backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.18s ease;
  }

  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .modal-box {
    position: relative;
    background: linear-gradient(160deg, #0e0a1a 0%, #160d28 55%, #0e0a1a 100%);
    border: 1px solid rgba(245,158,11,0.28);
    border-radius: 14px; padding: 1.75rem;
    width: 100%; max-width: 420px;
    box-shadow:
      0 0 60px rgba(245,158,11,0.12),
      0 0 120px rgba(107,33,168,0.08),
      0 40px 80px rgba(0,0,0,0.85);
  }

  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
  }

  .modal-title-row { display: flex; align-items: center; gap: 0.65rem; }

  .modal-title {
    font-family: 'Cinzel', serif; font-size: 1.05rem; font-weight: 700;
    color: var(--n-white); letter-spacing: 0.06em; margin: 0;
  }

  .modal-close {
    background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.15);
    border-radius: 5px; padding: 0.38rem;
    color: rgba(245,158,11,0.5); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }

  .modal-close:hover { background: rgba(220,38,38,0.1); border-color: rgba(220,38,38,0.4); color: #f87171; }

  .modal-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent);
    margin-bottom: 1.25rem;
  }

  /* ── Type toggle ── */
  .type-toggle {
    display: flex; align-items: center; justify-content: center;
    gap: 0; margin-bottom: 1.25rem;
    background: rgba(6,4,10,0.5);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 8px; padding: 0.25rem;
    width: fit-content; margin-left: auto; margin-right: auto;
  }

  .type-btn {
    padding: 0.45rem 1.5rem;
    background: transparent; border: none;
    font-family: 'Cinzel', serif; font-size: 0.82rem; font-weight: 700;
    letter-spacing: 0.08em; cursor: pointer;
    color: rgba(245,158,11,0.4);
    border-radius: 5px; transition: all 0.2s;
  }

  .type-btn.active {
    background: rgba(245,158,11,0.15);
    color: var(--n-gold2);
    box-shadow: 0 0 10px rgba(245,158,11,0.15);
  }

  .type-slider { display: none; } /* decorativo, no necesario */

  /* ── Form ── */
  .modal-form { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1rem; }

  .field-group { display: flex; flex-direction: column; gap: 0.3rem; }

  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

  .field-label {
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.12em; color: rgba(245,158,11,0.55);
    text-transform: uppercase;
    display: flex; align-items: center; gap: 0.4rem;
  }

  .field-optional {
    font-size: 0.58rem; color: rgba(196,181,253,0.35);
    text-transform: none; letter-spacing: 0; font-weight: 400;
  }

  .field-input {
    padding: 0.7rem 0.9rem;
    background: rgba(6,4,10,0.65);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 7px; color: var(--n-white);
    font-size: 0.88rem; font-family: inherit;
    transition: all 0.2s; width: 100%; box-sizing: border-box;
  }

  .field-input.mono { font-family: 'Courier New', monospace; font-size: 0.82rem; }

  .field-input::placeholder { color: rgba(245,158,11,0.25); }

  .field-input:focus {
    outline: none;
    border-color: rgba(245,158,11,0.45);
    background: rgba(6,4,10,0.85);
    box-shadow: 0 0 12px rgba(245,158,11,0.12);
  }

  /* ── Error ── */
  .form-error {
    font-size: 0.78rem; color: #f87171;
    background: rgba(220,38,38,0.08);
    border: 1px solid rgba(220,38,38,0.25);
    border-radius: 6px; padding: 0.5rem 0.75rem;
    margin-bottom: 0.75rem;
  }

  /* ── Save button ── */
  .btn-save {
    width: 100%; padding: 0.9rem;
    background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(107,33,168,0.15));
    border: 1px solid rgba(245,158,11,0.35);
    border-radius: 8px; color: var(--n-gold2);
    font-family: 'Cinzel', serif; font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.1em; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 0.6rem;
    transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(245,158,11,0.1);
  }

  .btn-save:hover {
    background: linear-gradient(135deg, rgba(245,158,11,0.22), rgba(107,33,168,0.22));
    border-color: rgba(245,158,11,0.6);
    box-shadow: 0 6px 28px rgba(245,158,11,0.2);
    transform: translateY(-1px);
  }
</style>
