<script lang="ts">
  import { walletStore }  from '$lib/stores/wallet.store';
  import { connectWallet } from '$lib/services/wallet.service';
  import { goto }         from '$app/navigation';
  import { browser }      from '$app/environment';
  import ErrorBox         from '$lib/components/ui/ErrorBox.svelte';
  import WatchOnly        from '$lib/components/ui/WatchOnly.svelte';

  let watchOnlyRef: any;

  $: if (browser && $walletStore.connected) goto('/dashboard');
</script>

<div class="scene">
  <div class="card-luffy">
    <div class="card-border-anim"></div>

    <!-- Header -->
    <div class="card-header">

      <!-- Sombrero de Paja SVG -->
      <div class="hat-emblem" aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 120 100" fill="none">
          <!-- Ala del sombrero -->
          <ellipse cx="60" cy="72" rx="56" ry="14" fill="#dc2626"/>
          <ellipse cx="60" cy="72" rx="56" ry="14" fill="url(#hatBrim)"/>
          <!-- Copa -->
          <ellipse cx="60" cy="44" rx="34" ry="32" fill="#dc2626"/>
          <ellipse cx="60" cy="44" rx="34" ry="32" fill="url(#hatCrown)"/>
          <!-- Banda negra -->
          <rect x="26" y="60" width="68" height="10" rx="2" fill="#0a0e1a"/>
          <!-- Brillo -->
          <ellipse cx="48" cy="36" rx="10" ry="6" fill="rgba(255,255,255,0.1)" transform="rotate(-15 48 36)"/>
          <defs>
            <radialGradient id="hatCrown" cx="40%" cy="35%" r="65%">
              <stop offset="0%"   stop-color="#ef4444" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#991b1b" stop-opacity="1"/>
            </radialGradient>
            <radialGradient id="hatBrim" cx="50%" cy="40%" r="60%">
              <stop offset="0%"   stop-color="#dc2626" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#7f1d1d" stop-opacity="1"/>
            </radialGradient>
          </defs>
        </svg>
        <div class="emblem-ring r1"></div>
        <div class="emblem-ring r2"></div>
      </div>

      <div class="title-block">
        <p class="title-eyebrow">GRAND LINE · BLOCKCHAIN PIRATES</p>
        <h1 class="title-main">PALI<span class="title-accent">WALLET</span></h1>
        <p class="title-sub">Monkey D. Luffy · Rey de los Piratas</p>
      </div>
      <div class="header-actions">
        <button class="btn-faucet" type="button" on:click={() => watchOnlyRef?.openFaucetModal()}>
          ABRIR FAUCET
        </button>
        <button class="btn-connect" on:click={connectWallet} disabled={$walletStore.loading}>
          {#if $walletStore.loading}
            <span class="btn-bg"></span>
            <svg class="spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            <span>Zarpando al Grand Line...</span>
          {:else}
            <span class="btn-bg"></span>
            <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="18" r="9" stroke="currentColor" stroke-width="3" fill="none"/>
              <line x1="50" y1="27" x2="50" y2="76" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
              <line x1="28" y1="40" x2="72" y2="40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              <path d="M50 76 Q26 76 26 56" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>
              <path d="M50 76 Q74 76 74 56" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>
              <path d="M26 56 L18 63 L26 67" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M74 56 L82 63 L74 67" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>CONECTAR WALLET</span>
          {/if}
        </button>
      </div>
    </div>

    <!-- Divider con ancla -->
    <div class="anchor-divider" aria-hidden="true">
      <span class="ad-line"></span>
      <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="18" r="9" stroke="#dc2626" stroke-width="2.5" fill="rgba(220,38,38,0.15)"/>
        <line x1="50" y1="27" x2="50" y2="76" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="40" x2="70" y2="40" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M50 76 Q28 76 28 58" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M50 76 Q72 76 72 58" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M28 58 L21 64 L28 67" stroke="#dc2626" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M72 58 L79 64 L72 67" stroke="#dc2626" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="ad-line"></span>
    </div>

    <!-- Habilidades de Luffy -->
    <div class="abilities-grid">
      <div class="ability-card">
        <div class="ability-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round">
            <path d="M12 3 C7 3 4 6 4 9 C4 13 8 14 12 14 C16 14 20 15 20 19 C20 22 17 22 12 22" fill="none"/>
            <circle cx="12" cy="3" r="1.5" fill="rgba(220,38,38,0.4)"/>
            <circle cx="12" cy="22" r="1.5" fill="rgba(220,38,38,0.4)"/>
          </svg>
        </div>
        <p class="ability-label">Gum-Gum</p>
        <p class="ability-sub">Cuerpo de goma</p>
      </div>
      <div class="ability-card">
        <div class="ability-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(245,158,11,0.2)"/>
          </svg>
        </div>
        <p class="ability-label">Gear 5</p>
        <p class="ability-sub">Poder máximo</p>
      </div>
      <div class="ability-card">
        <div class="ability-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(59,130,246,0.15)"/>
            <polyline points="9 12 11 14 15 10" stroke="#60a5fa"/>
          </svg>
        </div>
        <p class="ability-label">Haki</p>
        <p class="ability-sub">Voluntad férrea</p>
      </div>
      <div class="ability-card">
        <div class="ability-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="rgba(220,38,38,0.2)"/>
          </svg>
        </div>
        <p class="ability-label">Nakama</p>
        <p class="ability-sub">Fuerza del equipo</p>
      </div>
    </div>

    <!-- Barra de Haki -->
    <div class="haki-bar-wrap">
      <div class="hb-header">
        <svg width="10" height="10" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="18" r="8" stroke="#dc2626" stroke-width="2.5" fill="none"/>
          <line x1="50" y1="26" x2="50" y2="72" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
          <line x1="32" y1="40" x2="68" y2="40" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M50 72 Q30 72 30 56" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M50 72 Q70 72 70 56" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
        <span class="hb-label">NIVEL DE HAKI</span>
        <span class="hb-value">∞</span>
      </div>
      <div class="haki-bar">
        <div class="haki-fill"></div>
      </div>
    </div>

    <!-- Botón conectar -->
    <div class="auth-column">
      <ErrorBox message={$walletStore.error} />

      <div class="watch-block">
        <WatchOnly bind:this={watchOnlyRef} />
      </div>
    </div>

    <p class="card-footer">
      <svg width="9" height="9" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="18" r="8" stroke="currentColor" stroke-width="3" fill="none"/>
        <line x1="50" y1="26" x2="50" y2="74" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="40" x2="70" y2="40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M50 74 Q28 74 28 56" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M50 74 Q72 74 72 56" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
      Grand Line · Thousand Sunny · Syscoin Network
    </p>
  </div>
</div>

<style>
  .scene {
    position: relative; z-index: 2;
    min-height: 100vh;
    box-sizing: border-box;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem 0.75rem;
    perspective: 1200px;
  }
  :global(html), :global(body) {
    overflow-y: hidden;
    height: 100%;
  }

  .card-luffy {
    position: relative;
    background: var(--p-card-bg);
    border: 1px solid rgba(220,38,38,0.25);
    border-radius: 16px;
    padding: 1.9rem 2rem;
    width: 100%; max-width: 780px;
    backdrop-filter: blur(20px);
    box-shadow:
      var(--p-glow),
      0 30px 60px rgba(0,0,0,0.8),
      inset 0 1px 0 rgba(220,38,38,0.12),
      inset 0 -1px 0 rgba(30,58,95,0.1);
    transform: rotateX(1.5deg);
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  }

  .auth-column {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    width: 100%;
    margin: 0;
    padding: 0.95rem;
    border-radius: 18px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: inset 0 0 0 rgba(255,255,255,0.02);
  }

  .auth-panel {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .auth-title {
    font-size: 0.98rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #f8fafc;
    text-transform: uppercase;
  }

  .auth-desc {
    font-size: 0.88rem;
    line-height: 1.5;
    color: rgba(226,232,240,0.78);
  }

  .watch-block {
    margin: 0.8rem -0.95rem 0;
    padding: 0 0.95rem 0;
    width: calc(100% + 1.9rem);
    border-radius: 0;
    background: none;
    border: none;
    box-shadow: none;
  }

  @media (min-width: 900px) {
    .auth-column {
      padding: 1.8rem 1.6rem;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      background: rgba(6,8,20,0.82);
      box-shadow: 0 20px 45px rgba(0,0,0,0.16);
    }
  }

  .card-luffy:hover {
    transform: rotateX(0deg) translateY(-4px);
    box-shadow:
      0 0 50px rgba(220,38,38,0.28),
      0 0 100px rgba(30,58,95,0.18),
      0 50px 100px rgba(0,0,0,0.95),
      inset 0 1px 0 rgba(220,38,38,0.18);
  }

  .card-border-anim {
    position: absolute; inset: 0; border-radius: 6px;
    background: linear-gradient(135deg,
      rgba(220,38,38,0.6) 0%, transparent 35%,
      transparent 65%, rgba(30,58,95,0.5) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    padding: 1px; pointer-events: none;
    animation: borderPulse 4s ease-in-out infinite alternate;
  }

  @keyframes borderPulse { 0%{opacity:0.4} 100%{opacity:1} }

  .card-header {
    display: flex; align-items: center; gap: 1.5rem;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 1.75rem;
  }
  .header-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
  }

  .hat-emblem {
    position: relative; width: 72px; height: 72px; flex-shrink: 0;
    filter: drop-shadow(0 0 14px rgba(220,38,38,0.6));
    display: flex; align-items: center; justify-content: center;
  }

  .emblem-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid transparent;
  }

  .r1 {
    inset: -6px;
    border-top-color: rgba(245,158,11,0.7);
    border-right-color: rgba(245,158,11,0.2);
    animation: ringRot 4s linear infinite;
  }

  .r2 {
    inset: -12px;
    border-bottom-color: rgba(220,38,38,0.5);
    border-left-color: rgba(30,58,95,0.3);
    animation: ringRot 7s linear infinite reverse;
  }

  @keyframes ringRot { to { transform: rotate(360deg); } }

  .title-block { text-align: left; }

  .title-eyebrow {
    font-size: 0.56rem; letter-spacing: 0.18em;
    color: rgba(245,158,11,0.75); font-weight: 700;
    margin-bottom: 0.25rem; text-transform: uppercase;
  }

  .title-main {
    font-family: 'Pirata One', cursive;
    font-size: 1.85rem; font-weight: 900;
    color: var(--p-white); letter-spacing: 0.04em; line-height: 1;
    text-shadow: 0 0 20px rgba(220,38,38,0.4), 0 0 40px rgba(30,58,95,0.3);
  }

  .title-accent {
    color: var(--p-red);
    text-shadow: 0 0 20px rgba(220,38,38,0.7), 0 0 40px rgba(220,38,38,0.4);
  }

  .title-sub {
    font-size: 0.72rem; color: rgba(212,169,106,0.6);
    margin-top: 0.3rem; letter-spacing: 0.05em;
  }

  .anchor-divider {
    display: flex; align-items: center; gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .ad-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(220,38,38,0.35), transparent);
  }

  .abilities-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem; margin-bottom: 1.5rem;
  }

  .ability-card {
    background: rgba(30,58,95,0.06);
    border: 1px solid rgba(220,38,38,0.14);
    border-radius: 5px; padding: 0.75rem 0.4rem;
    text-align: center; transition: all 0.25s; cursor: default;
  }

  .ability-card:hover {
    background: rgba(220,38,38,0.1);
    border-color: rgba(220,38,38,0.4);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(220,38,38,0.15);
  }

  .ability-icon {
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.4rem;
    filter: drop-shadow(0 0 5px rgba(220,38,38,0.5));
  }

  .ability-label {
    font-size: 0.6rem; font-weight: 700;
    color: var(--p-red); letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ability-sub {
    font-size: 0.54rem; color: rgba(212,169,106,0.45);
    margin-top: 0.15rem;
  }

  .haki-bar-wrap { margin-bottom: 1.5rem; }

  .hb-header {
    display: flex; align-items: center; gap: 0.4rem;
    margin-bottom: 0.4rem;
  }

  .hb-label {
    font-size: 0.58rem; letter-spacing: 0.14em;
    color: rgba(220,38,38,0.55); font-weight: 700; flex: 1;
    text-transform: uppercase;
  }

  .hb-value {
    font-family: 'Pirata One', cursive;
    font-size: 0.7rem; color: var(--p-gold);
    text-shadow: 0 0 8px rgba(245,158,11,0.6); font-weight: 700;
  }

  .haki-bar {
    height: 5px;
    background: rgba(30,58,95,0.12);
    border-radius: 3px;
    border: 1px solid rgba(220,38,38,0.15);
    overflow: hidden;
  }

  .haki-fill {
    height: 100%; width: 100%;
    background: linear-gradient(90deg,
      #1e3a5f, #dc2626, #f59e0b, #dc2626, #1e3a5f);
    background-size: 200% 100%;
    animation: hakiFlow 3s linear infinite;
    box-shadow: 0 0 8px rgba(220,38,38,0.6);
  }

  @keyframes hakiFlow {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .btn-faucet,
  .btn-connect {
    position: relative;
    min-width: 160px;
    padding: 1rem 1.5rem;
    background: linear-gradient(180deg, rgba(245,158,11,0.16), rgba(220,38,38,0.12));
    border: 1px solid rgba(245,158,11,0.32);
    border-radius: 16px;
    color: var(--p-white);
    font-family: 'Pirata One', cursive;
    font-size: 0.95rem; font-weight: 700; letter-spacing: 0.1em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 0.7rem;
    overflow: hidden; transition: all 0.3s; z-index: 0;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px rgba(220,38,38,0.12);
  }

  .btn-faucet {
    min-width: 165px;
    background: rgba(30,58,95,0.85);
    border-color: rgba(255,255,255,0.1);
  }

  .btn-faucet:hover:not(:disabled) {
    color: var(--p-gold);
    border-color: var(--p-gold);
    box-shadow:
      0 0 20px rgba(255,255,255,0.15),
      0 0 40px rgba(30,58,95,0.25),
      inset 0 0 18px rgba(245,158,11,0.08);
    transform: translateY(-1px);
  }

  .btn-bg {
    position: absolute; inset: 0;
    background: linear-gradient(135deg,
      rgba(245,158,11,0.14) 0%,
      rgba(255,255,255,0.04) 48%,
      rgba(245,158,11,0.14) 100%);
    background-size: 200% 200%;
    animation: btnFlow 3.5s ease infinite; z-index: -1;
  }

  @keyframes btnFlow {
    0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
  }

  .btn-connect:hover:not(:disabled) {
    border-color: var(--p-gold);
    box-shadow:
      0 0 20px rgba(220,38,38,0.45),
      0 0 40px rgba(30,58,95,0.25),
      inset 0 0 20px rgba(220,38,38,0.08);
    transform: translateY(-2px);
    color: var(--p-gold);
  }

  .btn-connect:disabled { opacity: 0.5; cursor: not-allowed; }

  .spin { animation: spinAnim 0.8s linear infinite; }
  @keyframes spinAnim { to { transform: rotate(360deg); } }

  .card-footer {
    display: flex; align-items: center; justify-content: center; gap: 0.4rem;
    text-align: center; font-size: 0.58rem;
    color: rgba(212,169,106,0.25);
    letter-spacing: 0.08em; margin-top: 1.25rem; text-transform: uppercase;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .card-luffy {
      padding: 1.5rem 1.25rem;
      margin: 0.5rem;
    }

    .card-header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .title-block {
      text-align: center;
    }

    .title-main {
      font-size: 1.5rem;
    }

    .abilities-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .btn-connect {
      padding: 0.8rem 1rem;
      font-size: 0.85rem;
    }

    .title-eyebrow {
      font-size: 0.5rem;
    }
  }

  @media (max-width: 380px) {
    .abilities-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
