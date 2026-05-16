<script lang="ts">
  import { walletStore } from '$lib/stores/wallet.store';
  import { toastStore }  from '$lib/stores/toast.store';
  import { shortAddress } from '$lib/utils/format';
  import { sidebarStore } from '$lib/stores/sidebar.store';
  import { fade, fly } from 'svelte/transition';

  let copied = false;
  let menuOpen = false;

  async function copyAddress() {
    if (!$walletStore.address) return;
    await navigator.clipboard.writeText($walletStore.address);
    copied = true;
    toastStore.success('Dirección copiada');
    setTimeout(() => (copied = false), 2000);
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function navigate(s: any) {
    sidebarStore.set(s);
    menuOpen = false;
  }
</script>

<header class="header">

  <!-- Botón Menú (Mobile) -->
  <button class="menu-toggle" on:click={toggleMenu} aria-label="Abrir menú">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      {#if menuOpen}
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      {:else}
        <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
      {/if}
    </svg>
  </button>

  <!-- Logo -->
  <div class="logo">
    <div class="hat-mini" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 120 100" fill="none">
        <ellipse cx="60" cy="72" rx="56" ry="14" fill="#dc2626"/>
        <ellipse cx="60" cy="44" rx="34" ry="32" fill="#dc2626"/>
        <ellipse cx="60" cy="44" rx="34" ry="32" fill="url(#hHatCrown)"/>
        <rect x="26" y="60" width="68" height="10" rx="2" fill="#0a0e1a"/>
        <defs>
          <radialGradient id="hHatCrown" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stop-color="#ef4444" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#991b1b" stop-opacity="1"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
    <div class="logo-text">
      <span class="logo-name">Jossue<span class="logo-accent">Dev</span></span>
      <span class="logo-sub">Grand Line</span>
    </div>
  </div>

  <!-- Centro decorativo (Oculto en mobile) -->
  <div class="header-center" aria-hidden="true">
    <span class="hc-line"></span>
    <svg width="11" height="11" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="18" r="9" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none"/>
      <line x1="50" y1="27" x2="50" y2="74" stroke="rgba(220,38,38,0.45)" stroke-width="3" stroke-linecap="round"/>
      <line x1="30" y1="40" x2="70" y2="40" stroke="rgba(220,38,38,0.45)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M50 74 Q28 74 28 56" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M50 74 Q72 74 72 56" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>
    <span class="hc-line"></span>
  </div>

  <!-- Dirección (Abreviada más en mobile) -->
  {#if $walletStore.connected}
    <button class="address-pill" on:click={copyAddress}>
      {#if copied}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      {:else}
        <span class="ap-dot"></span>
      {/if}
      <span class="mono">{shortAddress($walletStore.address)}</span>
    </button>
  {/if}

</header>

<!-- Mobile Drawer -->
{#if menuOpen}
  <div class="drawer-overlay" on:click={toggleMenu} in:fade={{duration: 200}} out:fade={{duration: 150}}></div>
  <div class="mobile-drawer" in:fly={{x: -300, duration: 300}} out:fly={{x: -300, duration: 200}}>
    <div class="drawer-header">
      <span class="logo-name">NAVEGACIÓN</span>
      <button class="close-btn" on:click={toggleMenu}>&times;</button>
    </div>
    <div class="drawer-nav">
      <button class="nav-item" on:click={() => navigate('dashboard')}>Dashboard</button>
      <button class="nav-item" on:click={() => navigate('wallet')}>Mi Wallet</button>
      <button class="nav-item" on:click={() => navigate('transactions')}>Transacciones</button>
      <button class="nav-item" on:click={() => navigate('activity')}>Actividad</button>
    </div>
  </div>
{/if}

<style>
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem 1.25rem;
    border-bottom: 1px solid rgba(30,58,95,0.25);
    background: rgba(10,14,26,0.88);
    backdrop-filter: blur(16px);
    position: relative; z-index: 100;
  }

  .menu-toggle {
    display: none;
    background: transparent; border: none; color: var(--p-gold);
    cursor: pointer; padding: 0.5rem;
  }

  .logo { display: flex; align-items: center; gap: 0.5rem; }

  .logo-text { display: flex; flex-direction: column; }

  .logo-name {
    font-family: 'Pirata One', cursive;
    font-size: 0.92rem; font-weight: 900;
    color: var(--p-white); letter-spacing: 0.06em;
  }

  .logo-accent { color: var(--p-red); }

  .logo-sub {
    font-size: 0.52rem; color: rgba(245,158,11,0.4);
    letter-spacing: 0.12em; text-transform: uppercase;
  }

  .header-center {
    display: flex; align-items: center; gap: 0.6rem;
    position: absolute; left: 50%; transform: translateX(-50%);
  }

  .hc-line {
    width: 45px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(30,58,95,0.4), transparent);
  }

  .address-pill {
    display: flex; align-items: center; gap: 0.4rem;
    background: rgba(30,58,95,0.08);
    border: 1px solid rgba(30,58,95,0.3);
    border-radius: 4px; padding: 0.3rem 0.6rem;
    font-size: 0.7rem; color: rgba(226,232,240,0.7);
    cursor: pointer;
  }

  .ap-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--p-red); box-shadow: 0 0 6px var(--p-red);
  }

  /* Drawer Styles */
  .drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 110;
  }

  .mobile-drawer {
    position: fixed; top: 0; bottom: 0; left: 0; width: 280px;
    background: var(--p-black); border-right: 1px solid var(--p-red);
    z-index: 120; padding: 1.5rem; display: flex; flex-direction: column;
  }

  .drawer-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 2rem; border-bottom: 1px solid rgba(220,38,38,0.2);
    padding-bottom: 1rem;
  }

  .close-btn {
    background: none; border: none; color: var(--p-red); font-size: 1.5rem; cursor: pointer;
  }

  .drawer-nav { display: flex; flex-direction: column; gap: 1rem; }

  .nav-item {
    background: rgba(220,38,38,0.05); border: 1px solid rgba(220,38,38,0.1);
    color: var(--p-white); padding: 1rem; text-align: left;
    font-family: 'Pirata One', cursive; font-size: 1.1rem; border-radius: 6px;
    cursor: pointer;
  }

  .nav-item:hover { background: rgba(220,38,38,0.15); border-color: var(--p-red); }

  @media (max-width: 768px) {
    .menu-toggle { display: block; }
    .header-center { display: none; }
    .logo-sub { display: none; }
    .address-pill .mono { font-size: 0.65rem; }
  }
</style>
