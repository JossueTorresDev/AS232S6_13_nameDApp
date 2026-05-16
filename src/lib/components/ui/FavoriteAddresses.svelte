<script lang="ts">
  import { favoritesStore } from '$lib/stores/favorites.store';
  import { toastStore }     from '$lib/stores/toast.store';
  import { ethers }         from 'ethers';
  import { shortAddress }   from '$lib/utils/format';
  import { scale }          from 'svelte/transition';
  import { elasticOut }     from 'svelte/easing';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ select: string }>();

  let showModal = false;
  let newAlias  = '';
  let newAddr   = '';
  let addError  = '';

  $: addrValid = ethers.isAddress(newAddr);

  function openModal()  { showModal = true; addError = ''; }
  function closeModal() { showModal = false; newAlias = ''; newAddr = ''; addError = ''; }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showModal) closeModal();
  }

  function addFavorite() {
    addError = '';
    if (!newAlias.trim()) { addError = 'El alias no puede estar vacío'; return; }
    if (!addrValid)        { addError = 'Dirección inválida'; return; }
    favoritesStore.add(newAlias, newAddr);
    toastStore.success(`"${newAlias}" guardado en favoritos`);
    newAlias = '';
    newAddr  = '';
  }

  function removeFavorite(id: string, alias: string) {
    favoritesStore.remove(id);
    toastStore.info(`"${alias}" eliminado`);
  }

  function selectAddress(address: string) {
    dispatch('select', address);
    closeModal();
    toastStore.info('Dirección seleccionada');
  }

  async function copyAddress(address: string) {
    await navigator.clipboard.writeText(address);
    toastStore.success('Dirección copiada');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Botón trigger -->
<button
  class="fav-toggle"
  on:click={openModal}
  aria-label="Gestionar direcciones favoritas"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
  FAVORITOS
  {#if $favoritesStore.length > 0}
    <span class="fav-count">{$favoritesStore.length}</span>
  {/if}
</button>

<!-- Modal -->
{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fav-backdrop"
    on:click={closeModal}
    role="dialog"
    aria-modal="true"
    aria-label="Direcciones favoritas"
  >
    <div
      class="fav-modal"
      on:click|stopPropagation
      in:scale={{ duration: 340, easing: elasticOut, start: 0.85 }}
      out:scale={{ duration: 180, start: 0.9 }}
    >

      <!-- Header -->
      <div class="fav-header">
        <div class="fav-header-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3 class="fav-title">Direcciones Favoritas</h3>
        </div>
        <button class="fav-close" on:click={closeModal} aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="fav-divider"></div>

      <!-- Formulario agregar -->
      <div class="fav-add-form">
        <div class="fav-field">
          <label class="fav-label" for="fav-alias">Nombre / Alias</label>
          <input
            id="fav-alias"
            class="fav-input"
            type="text"
            placeholder="ej. Mi Ledger, Exchange..."
            bind:value={newAlias}
            aria-label="Alias de la dirección"
            maxlength="30"
          />
        </div>
        <div class="fav-field">
          <label class="fav-label" for="fav-addr">Dirección (0x...)</label>
          <input
            id="fav-addr"
            class="fav-input mono"
            class:valid={addrValid}
            class:invalid={newAddr.length > 5 && !addrValid}
            type="text"
            placeholder="0x..."
            bind:value={newAddr}
            aria-label="Dirección a guardar"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
        {#if addError}
          <p class="fav-error" role="alert">{addError}</p>
        {/if}
        <button
          class="fav-btn-add"
          on:click={addFavorite}
          disabled={!newAlias.trim() || !addrValid}
          aria-label="Guardar dirección favorita"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Guardar favorito
        </button>
      </div>

      <!-- Lista -->
      {#if $favoritesStore.length > 0}
        <div class="fav-list-wrap">
          <p class="fav-list-title">Guardados ({$favoritesStore.length})</p>
          <div class="fav-list" role="list">
            {#each $favoritesStore as fav (fav.id)}
              <div class="fav-item" role="listitem">
                <div class="fav-info">
                  <span class="fav-alias">{fav.alias}</span>
                  <span class="fav-addr mono">{shortAddress(fav.address)}</span>
                </div>
                <div class="fav-item-actions">
                  <button
                    class="fav-action-btn use"
                    on:click={() => selectAddress(fav.address)}
                    aria-label="Usar dirección {fav.alias}"
                    title="Usar en formulario"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                  <button
                    class="fav-action-btn copy"
                    on:click={() => copyAddress(fav.address)}
                    aria-label="Copiar dirección {fav.alias}"
                    title="Copiar"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  </button>
                  <button
                    class="fav-action-btn del"
                    on:click={() => removeFavorite(fav.id, fav.alias)}
                    aria-label="Eliminar {fav.alias}"
                    title="Eliminar"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <p class="fav-empty">Sin favoritos guardados aún</p>
      {/if}

    </div>
  </div>
{/if}

<style>
  /* ── Botón trigger ── */
  .fav-toggle {
    width: 100%;
    padding: 0.7rem;
    background: rgba(245,158,11,0.05);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 6px;
    font-family: 'Cinzel', serif;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
    color: var(--n-gold2);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.25s;
  }

  .fav-toggle:hover { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.35); }

  .fav-count {
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 10px;
    padding: 0.1rem 0.45rem;
    font-size: 0.6rem; font-weight: 700;
    color: var(--n-gold2); line-height: 1.4;
  }

  /* ── Backdrop ── */
  .fav-backdrop {
    position: fixed;
    inset: 0;
    z-index: 250;
    background: rgba(6,4,10,0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.18s ease;
  }

  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  /* ── Modal ── */
  .fav-modal {
    background: linear-gradient(160deg, #0e0a1a 0%, #160d28 55%, #0e0a1a 100%);
    border: 1px solid rgba(245,158,11,0.28);
    border-radius: 14px;
    padding: 1.75rem;
    width: 100%;
    max-width: 440px;
    box-shadow:
      0 0 60px rgba(245,158,11,0.12),
      0 0 120px rgba(107,33,168,0.08),
      0 40px 80px rgba(0,0,0,0.85);
  }

  /* ── Header ── */
  .fav-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
  }

  .fav-header-left {
    display: flex; align-items: center; gap: 0.65rem;
  }

  .fav-title {
    font-family: 'Cinzel', serif;
    font-size: 1rem; font-weight: 700;
    color: var(--n-white); letter-spacing: 0.05em; margin: 0;
  }

  .fav-close {
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 5px; padding: 0.38rem;
    color: rgba(245,158,11,0.5); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }

  .fav-close:hover { background: rgba(220,38,38,0.1); border-color: rgba(220,38,38,0.4); color: #f87171; }

  .fav-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent);
    margin-bottom: 1.25rem;
  }

  /* ── Form ── */
  .fav-add-form { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem; }

  .fav-field { display: flex; flex-direction: column; gap: 0.28rem; }

  .fav-label {
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.1em; color: rgba(245,158,11,0.55);
    text-transform: uppercase;
  }

  .fav-input {
    padding: 0.65rem 0.9rem;
    background: rgba(6,4,10,0.65);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 7px;
    color: var(--n-white);
    font-size: 0.85rem; font-family: inherit;
    transition: all 0.2s;
  }

  .fav-input.mono { font-family: 'Courier New', monospace; font-size: 0.8rem; }
  .fav-input::placeholder { color: rgba(245,158,11,0.25); }
  .fav-input:focus { outline: none; border-color: rgba(245,158,11,0.45); box-shadow: 0 0 10px rgba(245,158,11,0.1); }
  .fav-input.valid   { border-color: rgba(34,197,94,0.45); }
  .fav-input.invalid { border-color: rgba(220,38,38,0.45); }

  .fav-error { font-size: 0.72rem; color: #f87171; margin: 0; }

  .fav-btn-add {
    padding: 0.7rem;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 7px;
    color: var(--n-gold2);
    font-family: 'Cinzel', serif;
    font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(245,158,11,0.08);
  }

  .fav-btn-add:hover:not(:disabled) {
    background: rgba(245,158,11,0.15);
    border-color: rgba(245,158,11,0.5);
    box-shadow: 0 6px 20px rgba(245,158,11,0.15);
    transform: translateY(-1px);
  }

  .fav-btn-add:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Lista ── */
  .fav-list-wrap {
    border-top: 1px solid rgba(245,158,11,0.1);
    padding-top: 1rem;
  }

  .fav-list-title {
    font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.1em; color: rgba(245,158,11,0.45);
    text-transform: uppercase; margin: 0 0 0.6rem;
  }

  .fav-list {
    display: flex; flex-direction: column; gap: 0.4rem;
    max-height: 220px; overflow-y: auto;
    padding-right: 0.2rem;
  }

  .fav-list::-webkit-scrollbar { width: 3px; }
  .fav-list::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 2px; }

  .fav-item {
    display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
    padding: 0.65rem 0.75rem;
    background: rgba(6,4,10,0.5);
    border: 1px solid rgba(245,158,11,0.08);
    border-radius: 6px;
    transition: background 0.15s;
  }

  .fav-item:hover { background: rgba(245,158,11,0.06); border-color: rgba(245,158,11,0.15); }

  .fav-info { flex: 1; min-width: 0; }

  .fav-alias {
    display: block; font-size: 0.82rem; font-weight: 700;
    color: var(--n-white); margin-bottom: 0.15rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .fav-addr { font-size: 0.65rem; color: rgba(245,158,11,0.5); }

  .fav-item-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }

  .fav-action-btn {
    width: 28px; height: 28px;
    border-radius: 5px; border: 1px solid;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
    background: transparent;
  }

  .fav-action-btn.use  { border-color: rgba(245,158,11,0.2); color: rgba(245,158,11,0.6); }
  .fav-action-btn.copy { border-color: rgba(147,51,234,0.2); color: rgba(196,181,253,0.5); }
  .fav-action-btn.del  { border-color: rgba(220,38,38,0.2);  color: rgba(220,38,38,0.5); }

  .fav-action-btn.use:hover  { background: rgba(245,158,11,0.1);  border-color: rgba(245,158,11,0.5);  color: var(--n-gold2); }
  .fav-action-btn.copy:hover { background: rgba(147,51,234,0.1);  border-color: rgba(147,51,234,0.4);  color: #c4b5fd; }
  .fav-action-btn.del:hover  { background: rgba(220,38,38,0.1);   border-color: rgba(220,38,38,0.5);   color: #f87171; }

  .fav-empty {
    font-size: 0.78rem; color: rgba(240,232,255,0.3);
    text-align: center; margin: 0.5rem 0;
    border-top: 1px solid rgba(245,158,11,0.08);
    padding-top: 1rem;
  }
</style>
