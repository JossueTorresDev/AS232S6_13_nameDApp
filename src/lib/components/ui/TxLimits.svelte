<script lang="ts">
  import { txLimitsStore } from '$lib/stores/txLimits.store';
  import { toastStore }    from '$lib/stores/toast.store';
  import { ethers }        from 'ethers';
  import { shortAddress }  from '$lib/utils/format';

  let showPanel    = false;
  let newWhiteAddr = '';
  $: whiteAddrValid = ethers.isAddress(newWhiteAddr);

  function saveMaxAmount(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    txLimitsStore.save({ maxAmount: val });
  }

  function toggleMaxAmount(e: Event) {
    txLimitsStore.save({ maxAmountEnabled: (e.target as HTMLInputElement).checked });
    toastStore.info(`Límite de monto ${(e.target as HTMLInputElement).checked ? 'activado' : 'desactivado'}`);
  }

  function toggleWhitelist(e: Event) {
    txLimitsStore.save({ whitelistEnabled: (e.target as HTMLInputElement).checked });
    toastStore.info(`Lista de confianza ${(e.target as HTMLInputElement).checked ? 'activada' : 'desactivada'}`);
  }

  function addToWhitelist() {
    if (!whiteAddrValid) return;
    txLimitsStore.addToWhitelist(newWhiteAddr);
    toastStore.success('Dirección añadida a la lista de confianza');
    newWhiteAddr = '';
  }

  function removeFromWhitelist(addr: string) {
    txLimitsStore.removeFromWhitelist(addr);
    toastStore.info('Dirección eliminada de la lista');
  }

  function resetAll() {
    txLimitsStore.reset();
    toastStore.info('Límites restablecidos');
  }
</script>

<button
  class="limits-toggle"
  on:click={() => showPanel = !showPanel}
  aria-expanded={showPanel}
  aria-label="Configurar límites de transacción"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
  LÍMITES Y SEGURIDAD
  {#if $txLimitsStore.maxAmountEnabled || $txLimitsStore.whitelistEnabled}
    <span class="limits-active-dot" aria-label="Límites activos"></span>
  {/if}
</button>

{#if showPanel}
  <div class="limits-panel" role="region" aria-label="Configuración de límites">

    <div class="limits-header">
      <h4 class="limits-title">Límites de Transacción</h4>
      <button class="limits-reset" on:click={resetAll} aria-label="Restablecer límites">Restablecer</button>
    </div>

    <!-- Max amount -->
    <div class="limits-section">
      <div class="limits-row">
        <div class="limits-label-group">
          <span class="limits-label">Límite de monto</span>
          <span class="limits-desc">Bloquea txs que superen este valor</span>
        </div>
        <label class="toggle-switch" aria-label="Activar límite de monto">
          <input
            type="checkbox"
            checked={$txLimitsStore.maxAmountEnabled}
            on:change={toggleMaxAmount}
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
      {#if $txLimitsStore.maxAmountEnabled}
        <div class="limits-input-row">
          <input
            class="limits-input"
            type="number"
            step="0.01"
            min="0.0001"
            value={$txLimitsStore.maxAmount}
            on:change={saveMaxAmount}
            aria-label="Monto máximo permitido"
            placeholder="1.0"
          />
          <span class="limits-currency">máx.</span>
        </div>
      {/if}
    </div>

    <div class="limits-divider" aria-hidden="true"></div>

    <!-- Whitelist -->
    <div class="limits-section">
      <div class="limits-row">
        <div class="limits-label-group">
          <span class="limits-label">Lista de confianza</span>
          <span class="limits-desc">Solo permite enviar a estas direcciones</span>
        </div>
        <label class="toggle-switch" aria-label="Activar lista de confianza">
          <input
            type="checkbox"
            checked={$txLimitsStore.whitelistEnabled}
            on:change={toggleWhitelist}
          />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <!-- Add to whitelist -->
      <div class="whitelist-add">
        <input
          class="limits-input mono"
          class:valid={whiteAddrValid}
          class:invalid={newWhiteAddr.length > 5 && !whiteAddrValid}
          type="text"
          placeholder="0x... dirección de confianza"
          bind:value={newWhiteAddr}
          aria-label="Dirección a añadir a la lista de confianza"
          spellcheck="false"
          autocomplete="off"
        />
        <button
          class="whitelist-add-btn"
          on:click={addToWhitelist}
          disabled={!whiteAddrValid}
          aria-label="Añadir a lista de confianza"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <!-- Whitelist items -->
      {#if $txLimitsStore.whitelist.length > 0}
        <div class="whitelist-list" role="list">
          {#each $txLimitsStore.whitelist as addr (addr)}
            <div class="whitelist-item" role="listitem">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span class="whitelist-addr mono">{shortAddress(addr)}</span>
              <button
                class="whitelist-remove"
                on:click={() => removeFromWhitelist(addr)}
                aria-label="Eliminar {shortAddress(addr)} de la lista"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="whitelist-empty">Sin direcciones en la lista</p>
      {/if}
    </div>

  </div>
{/if}

<style>
  .limits-toggle {
    width: 100%;
    padding: 0.7rem;
    background: rgba(34,197,94,0.04);
    border: 1px solid rgba(34,197,94,0.15);
    border-radius: 6px;
    font-family: 'Cinzel', serif;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
    color: rgba(134,239,172,0.7);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.25s; position: relative;
  }

  .limits-toggle:hover { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.35); color: #86efac; }

  .limits-active-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #22c55e; box-shadow: 0 0 6px #22c55e;
    animation: pulse 2s infinite;
  }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .limits-panel {
    background: rgba(34,197,94,0.03);
    border: 1px solid rgba(34,197,94,0.12);
    border-radius: 6px; padding: 1rem;
    animation: slideDown 0.25s ease-out;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .limits-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.85rem;
  }

  .limits-title { font-size: 0.82rem; font-weight: 700; color: #86efac; margin: 0; letter-spacing: 0.05em; }

  .limits-reset {
    background: transparent; border: 1px solid rgba(220,38,38,0.2);
    border-radius: 4px; padding: 0.2rem 0.5rem;
    color: rgba(220,38,38,0.55); font-size: 0.62rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
  }

  .limits-reset:hover { background: rgba(220,38,38,0.08); border-color: rgba(220,38,38,0.45); color: #f87171; }

  .limits-section { display: flex; flex-direction: column; gap: 0.6rem; }

  .limits-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

  .limits-label-group { display: flex; flex-direction: column; gap: 0.15rem; }

  .limits-label { font-size: 0.8rem; font-weight: 700; color: var(--n-white); }

  .limits-desc { font-size: 0.65rem; color: rgba(196,181,253,0.4); }

  /* Toggle switch */
  .toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }

  .toggle-slider {
    position: absolute; inset: 0; cursor: pointer;
    background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2);
    border-radius: 20px; transition: all 0.25s;
  }

  .toggle-slider::before {
    content: ''; position: absolute;
    width: 14px; height: 14px; left: 2px; bottom: 2px;
    background: rgba(245,158,11,0.5); border-radius: 50%;
    transition: all 0.25s;
  }

  input:checked + .toggle-slider { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); }
  input:checked + .toggle-slider::before { transform: translateX(16px); background: #22c55e; box-shadow: 0 0 6px #22c55e; }

  .limits-input-row { display: flex; align-items: center; gap: 0.5rem; }

  .limits-input {
    flex: 1; padding: 0.55rem 0.75rem;
    background: rgba(6,4,10,0.6);
    border: 1px solid rgba(34,197,94,0.15);
    border-radius: 5px; color: var(--n-white);
    font-size: 0.82rem; font-family: inherit;
    transition: all 0.2s;
  }

  .limits-input.mono { font-family: 'Courier New', monospace; }
  .limits-input:focus { outline: none; border-color: rgba(34,197,94,0.4); box-shadow: 0 0 8px rgba(34,197,94,0.1); }
  .limits-input.valid   { border-color: rgba(34,197,94,0.4); }
  .limits-input.invalid { border-color: rgba(220,38,38,0.4); }

  .limits-currency { font-size: 0.72rem; color: rgba(134,239,172,0.5); font-weight: 700; white-space: nowrap; }

  .limits-divider { height: 1px; background: rgba(34,197,94,0.08); margin: 0.5rem 0; }

  /* Whitelist */
  .whitelist-add { display: flex; gap: 0.4rem; }

  .whitelist-add-btn {
    flex-shrink: 0; width: 34px; height: 34px;
    background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
    border-radius: 5px; color: #86efac;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s;
  }

  .whitelist-add-btn:hover:not(:disabled) { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.45); }
  .whitelist-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .whitelist-list { display: flex; flex-direction: column; gap: 0.3rem; }

  .whitelist-item {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.45rem 0.65rem;
    background: rgba(34,197,94,0.05);
    border: 1px solid rgba(34,197,94,0.12);
    border-radius: 4px;
  }

  .whitelist-addr { flex: 1; font-size: 0.72rem; color: rgba(134,239,172,0.7); }

  .whitelist-remove {
    background: transparent; border: none;
    color: rgba(220,38,38,0.4); cursor: pointer;
    display: flex; align-items: center; padding: 0.1rem;
    transition: color 0.15s;
  }

  .whitelist-remove:hover { color: #f87171; }

  .whitelist-empty { font-size: 0.72rem; color: rgba(134,239,172,0.3); margin: 0; }
</style>
