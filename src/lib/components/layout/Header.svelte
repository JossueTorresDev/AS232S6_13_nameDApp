<script lang="ts">
  import { walletStore } from '$lib/stores/wallet.store';
  import { toastStore }  from '$lib/stores/toast.store';
  import { shortAddress } from '$lib/utils/format';

  let copied = false;

  async function copyAddress() {
    if (!$walletStore.address) return;
    await navigator.clipboard.writeText($walletStore.address);
    copied = true;
    toastStore.success('Dirección copiada');
    setTimeout(() => (copied = false), 2000);
  }
</script>

<header class="header">

  <!-- Logo -->
  <div class="logo">
    <div class="hat-mini" aria-hidden="true">
      <svg width="30" height="30" viewBox="0 0 120 100" fill="none">
        <!-- Ala -->
        <ellipse cx="60" cy="72" rx="56" ry="14" fill="#dc2626"/>
        <!-- Copa -->
        <ellipse cx="60" cy="44" rx="34" ry="32" fill="#dc2626"/>
        <ellipse cx="60" cy="44" rx="34" ry="32" fill="url(#hHatCrown)"/>
        <!-- Banda negra -->
        <rect x="26" y="60" width="68" height="10" rx="2" fill="#0a0e1a"/>
        <!-- Brillo -->
        <ellipse cx="48" cy="36" rx="9" ry="5" fill="rgba(255,255,255,0.1)" transform="rotate(-15 48 36)"/>
        <defs>
          <radialGradient id="hHatCrown" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stop-color="#ef4444" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#991b1b" stop-opacity="1"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
    <div>
      <span class="logo-name">Jossue<span class="logo-accent">Dev</span></span>
      <span class="logo-sub">Grand Line · Thousand Sunny</span>
    </div>
  </div>

  <!-- Centro decorativo — ancla pequeña -->
  <div class="header-center" aria-hidden="true">
    <span class="hc-line"></span>
    <svg width="11" height="11" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="18" r="9" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none"/>
      <line x1="50" y1="27" x2="50" y2="74" stroke="rgba(220,38,38,0.45)" stroke-width="3" stroke-linecap="round"/>
      <line x1="30" y1="40" x2="70" y2="40" stroke="rgba(220,38,38,0.45)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M50 74 Q28 74 28 56" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M50 74 Q72 74 72 56" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M28 56 L20 63 L28 67" stroke="rgba(220,38,38,0.45)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M72 56 L80 63 L72 67" stroke="rgba(220,38,38,0.45)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="hc-line"></span>
  </div>

  <!-- Dirección -->
  {#if $walletStore.connected}
    <button class="address-pill" on:click={copyAddress} title="Copiar dirección completa">
      {#if copied}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      {:else}
        <span class="ap-dot"></span>
      {/if}
      <span class="mono">{shortAddress($walletStore.address)}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.35">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
    </button>
  {/if}

</header>

<style>
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem 2rem;
    border-bottom: 1px solid rgba(30,58,95,0.25);
    background: rgba(10,14,26,0.88);
    backdrop-filter: blur(16px);
    position: relative; z-index: 10;
  }

  .logo { display: flex; align-items: center; gap: 0.75rem; }

  .hat-mini {
    flex-shrink: 0;
    filter: drop-shadow(0 0 7px rgba(220,38,38,0.55));
    animation: hatGlow 3s ease-in-out infinite;
  }

  @keyframes hatGlow {
    0%, 100% { filter: drop-shadow(0 0 7px rgba(220,38,38,0.55)); }
    50%       { filter: drop-shadow(0 0 12px rgba(220,38,38,0.8)); }
  }

  .logo-name {
    font-family: 'Pirata One', cursive;
    font-size: 0.92rem; font-weight: 900;
    color: var(--p-white); letter-spacing: 0.06em; display: block;
  }

  .logo-accent { color: var(--p-red); }

  .logo-sub {
    font-size: 0.52rem; color: rgba(245,158,11,0.4);
    letter-spacing: 0.12em; display: block; text-transform: uppercase;
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
    display: flex; align-items: center; gap: 0.5rem;
    background: rgba(30,58,95,0.08);
    border: 1px solid rgba(30,58,95,0.3);
    border-radius: 4px; padding: 0.32rem 0.85rem;
    font-size: 0.75rem; color: rgba(226,232,240,0.7);
    transition: all 0.2s; cursor: pointer; font-family: inherit;
  }

  .address-pill:hover {
    background: rgba(220,38,38,0.1);
    border-color: rgba(220,38,38,0.4);
    color: var(--p-red);
  }

  .ap-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--p-red);
    box-shadow: 0 0 6px var(--p-red);
    animation: pulse 2s infinite;
  }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
</style>
