<script lang="ts">
  import { fly, fade }        from 'svelte/transition';
  import { activityStore }    from '$lib/stores/activity.store';
  import { transactionStore } from '$lib/stores/transaction.store';
  import { walletStore }      from '$lib/stores/wallet.store';
  import { sidebarStore }     from '$lib/stores/sidebar.store';
  import ActivityLog          from '$lib/components/ui/ActivityLog.svelte';
  import WatchOnly            from '$lib/components/ui/WatchOnly.svelte';
  import TransactionHistory   from '$lib/components/ui/TransactionHistory.svelte';
  import WalletPanel          from '$lib/components/ui/WalletPanel.svelte';

  type Section = 'dashboard' | 'wallet' | 'transactions' | 'activity' | 'watchonly';

  $: active = $sidebarStore;
  $: panelVisible = active !== 'dashboard';

  let navExpanded = true;

  // Loading por sección
  let sectionLoading = false;
  let readySection: Section | null = null;

  function navigate(s: Section) {
    if (s === 'dashboard') {
      sidebarStore.set(s);
      return;
    }
    sectionLoading = true;
    readySection = null;
    sidebarStore.set(s);
    setTimeout(() => {
      sectionLoading = false;
      readySection = s;
    }, 600);
  }

  // Cuando se cierra el panel, resetear
  $: if (!panelVisible) { sectionLoading = false; readySection = null; }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && panelVisible) sidebarStore.set('dashboard');
  }

  // Badges
  $: activityBadge = $activityStore.filter(
    e => Date.now() - e.timestamp < 86_400_000
  ).length;
  $: txBadge = $transactionStore.transactions.filter(
    tx => tx.networkId === $walletStore.currentNetwork?.chainId
  ).length;
  $: pendingCount = $transactionStore.transactions.filter(
    tx => tx.status === 'pending' && tx.networkId === $walletStore.currentNetwork?.chainId
  ).length;

  const navItems: { id: Section; label: string; sub: string }[] = [
    { id: 'dashboard',    label: 'Dashboard',          sub: 'Estadísticas'      },
    { id: 'wallet',       label: 'Mi Wallet',          sub: 'Saldo y envíos'    },
    { id: 'transactions', label: 'Transacciones',       sub: 'Historial de txs'  },
    { id: 'activity',     label: 'Log de Actividad',    sub: 'Eventos recientes' },
    { id: 'watchonly',    label: 'Watch-Only',          sub: 'Consultar wallet'  },
  ];
</script>

<svelte:window on:keydown={handleKey} />

<!-- ══════════════════════════════════════════
     NAV LATERAL (desplegable)
══════════════════════════════════════════ -->
<aside class="nav-wrap" class:collapsed={!navExpanded} aria-label="Navegación lateral">

  <!-- Cabecera con logo y botón toggle -->
  <div class="nav-header">
    <div class="nav-logo" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="18" r="9" stroke="var(--p-gold)" stroke-width="3" fill="none"/>
        <line x1="50" y1="27" x2="50" y2="74" stroke="var(--p-gold)" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="40" x2="70" y2="40" stroke="var(--p-gold)" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M50 74 Q28 74 28 56" stroke="var(--p-gold)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M50 74 Q72 74 72 56" stroke="var(--p-gold)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M28 56 L20 63 L28 67" stroke="var(--p-gold)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M72 56 L80 63 L72 67" stroke="var(--p-gold)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {#if navExpanded}
        <span class="nav-brand" in:fly={{ x: -6, duration: 160 }}>NAVEGACIÓN</span>
      {/if}
    </div>

    <!-- Botón colapsar / expandir -->
    <button
      class="nav-toggle"
      on:click={() => navExpanded = !navExpanded}
      aria-label={navExpanded ? 'Colapsar menú' : 'Expandir menú'}
      title={navExpanded ? 'Colapsar' : 'Expandir'}
    >
      <svg
        width="13" height="13" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
        style="transition: transform 0.25s; transform: scaleX({navExpanded ? 1 : -1})"
        aria-hidden="true"
      >
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
  </div>

  <div class="nav-sep" aria-hidden="true"></div>

  <!-- Items de navegación -->
  <nav class="nav-list" aria-label="Secciones">
    {#each navItems as item}
      <button
        class="nav-item"
        class:active={active === item.id}
        on:click={() => navigate(item.id)}
        aria-label={item.label}
        title={!navExpanded ? item.label : undefined}
        aria-current={active === item.id ? 'page' : undefined}
      >
        <!-- Ícono -->
        <div class="nav-icon" aria-hidden="true">
          {#if item.id === 'dashboard'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
          {:else if item.id === 'wallet'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              <circle cx="12" cy="14" r="2"/>
            </svg>
          {:else if item.id === 'transactions'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          {:else if item.id === 'activity'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          {:else if item.id === 'watchonly'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          {/if}
        </div>

        <!-- Texto (solo expandido) -->
        {#if navExpanded}
          <div class="nav-text" in:fly={{ x: -6, duration: 160 }}>
            <span class="nav-label">{item.label}</span>
            <span class="nav-sub">{item.sub}</span>
          </div>
        {/if}

        <!-- Badges -->
        {#if item.id === 'transactions' && txBadge > 0}
          <span class="nav-badge blue" class:pulse={pendingCount > 0}>{txBadge}</span>
        {/if}
        {#if item.id === 'activity' && activityBadge > 0}
          <span class="nav-badge purple">{activityBadge}</span>
        {/if}
        {#if item.id === 'security' && securityActive}
          <span class="nav-dot green"></span>
        {/if}
        {#if active === item.id}
          <div class="nav-active-bar" aria-hidden="true"></div>
        {/if}
      </button>
    {/each}
  </nav>

</aside>

<!-- ══════════════════════════════════════════
     PANEL DE CONTENIDO
══════════════════════════════════════════ -->
{#if panelVisible}
  <div
    class="sb-panel"
    style="left: {navExpanded ? '270px' : '48px'}"
    in:fly={{ x: -12, duration: 220 }}
    out:fly={{ x: -12, duration: 160 }}
    role="complementary"
    aria-label={navItems.find(n => n.id === active)?.label}
  >
    <!-- Título fijo estilo dashboard -->
    <div class="sbp-section-title">
      <div class="st-line"></div>
      <span class="st-text">
        {#if active === 'wallet'}GRAND LINE · MI WALLET
        {:else if active === 'transactions'}GRAND LINE · TRANSACCIONES
        {:else if active === 'activity'}GRAND LINE · LOG DE ACTIVIDAD
        {:else if active === 'watchonly'}GRAND LINE · WATCH-ONLY
        {/if}
      </span>
      <div class="st-line"></div>
    </div>

    <!-- Contenido scrolleable -->
    <div class="sbp-body">
      {#if sectionLoading}
        <div class="section-loading" in:fade={{ duration: 150 }} out:fade={{ duration: 150 }}>
          <div class="sl-luffy">
            <img src="/luffy.svg" alt="" class="sl-img" aria-hidden="true" />
            <div class="sl-glow"></div>
          </div>
          <p class="sl-name">{navItems.find(n => n.id === active)?.label ?? ''}</p>
          <div class="sl-bar"><div class="sl-fill"></div></div>
          <div class="sl-dots">
            {#each Array(3) as _, i}
              <span class="sl-dot" style="animation-delay:{i*0.22}s"></span>
            {/each}
          </div>
        </div>
      {:else}
        <div in:fly={{ y: 10, duration: 250 }}>
          {#if active === 'wallet'}
            <WalletPanel />
          {:else if active === 'transactions'}
            <TransactionHistory />
          {:else if active === 'activity'}
            <ActivityLog />
          {:else if active === 'watchonly'}
            <WatchOnly />
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* ══════════════════════════════════════════
     NAV LATERAL
  ══════════════════════════════════════════ */
  .nav-wrap {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 270px;
    min-width: 270px;
    flex-shrink: 0;
    background: rgba(10,14,26,0.97);
    border-right: 1px solid rgba(245,158,11,0.1);
    display: flex;
    flex-direction: column;
    padding: 0.75rem 0 1rem;
    z-index: 20;
    box-shadow: 2px 0 12px rgba(0,0,0,0.5);
    overflow: hidden;
    transition: width 0.25s cubic-bezier(0.4,0,0.2,1),
                min-width 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  .nav-wrap.collapsed {
    width: 48px;
    min-width: 48px;
  }

  /* ── Cabecera ── */
  .nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.5rem 0 0.6rem;
    margin-bottom: 0.4rem;
    min-height: 32px;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow: hidden;
  }

  .nav-brand {
    font-family: 'Pirata One', cursive;
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(245,158,11,0.7);
    letter-spacing: 0.12em;
    white-space: nowrap;
    text-transform: uppercase;
  }

  /* Botón toggle ‹ / › */
  .nav-toggle {
    flex-shrink: 0;
    width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 5px;
    color: rgba(245,158,11,0.5);
    cursor: pointer;
    transition: all 0.18s;
  }

  .nav-toggle:hover {
    background: rgba(245,158,11,0.14);
    border-color: rgba(245,158,11,0.4);
    color: var(--p-gold);
  }

  .nav-sep {
    height: 1px;
    margin: 0 0.5rem 0.5rem;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent);
    flex-shrink: 0;
  }

  /* ── Lista de nav ── */
  .nav-list {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0 0.35rem;
    flex: 1;
  }

  .nav-item {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 0.6rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 7px;
    color: rgba(226,232,240,0.4);
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
  }

  .nav-item:hover {
    background: rgba(245,158,11,0.07);
    border-color: rgba(245,158,11,0.15);
    color: rgba(245,158,11,0.8);
  }

  .nav-item.active {
    background: rgba(245,158,11,0.11);
    border-color: rgba(245,158,11,0.28);
    color: var(--p-gold);
    box-shadow: 0 0 10px rgba(245,158,11,0.1);
  }

  .nav-icon {
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    width: 20px;
  }

  /* Texto */
  .nav-text {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    flex: 1;
    min-width: 0;
  }

  .nav-label {
    font-size: 0.82rem;
    font-weight: 700;
    color: currentColor;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.02em;
  }

  .nav-sub {
    font-size: 0.63rem;
    color: rgba(245,158,11,0.38);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Badges */
  .nav-badge {
    flex-shrink: 0;
    font-size: 0.58rem;
    font-weight: 700;
    padding: 0.08rem 0.38rem;
    border-radius: 8px;
    line-height: 1.5;
  }

  .nav-badge.blue   { background: rgba(96,165,250,0.15); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); }
  .nav-badge.purple { background: rgba(167,139,250,0.15); color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); }

  .nav-dot {
    flex-shrink: 0;
    width: 7px; height: 7px;
    border-radius: 50%;
  }
  .nav-dot.green { background: #22c55e; box-shadow: 0 0 5px #22c55e; }

  .pulse { animation: dotPulse 1.4s ease-in-out infinite; }
  @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

  /* Barra activa — lado derecho */
  .nav-active-bar {
    position: absolute;
    right: -1px; top: 20%; bottom: 20%;
    width: 3px;
    background: var(--p-gold);
    border-radius: 2px 0 0 2px;
    box-shadow: 0 0 8px rgba(245,158,11,0.5);
  }

  /* ══════════════════════════════════════════
     PANEL DE CONTENIDO
  ══════════════════════════════════════════ */
  .sb-panel {
    position: fixed;
    top: 53px;
    bottom: 0;
    left: 270px;
    right: 0;
    background: rgb(10,14,26);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    z-index: 19;
    transition: left 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  .sb-panel::-webkit-scrollbar { width: 6px; }
  .sb-panel::-webkit-scrollbar-track { background: rgba(10,14,26,0.8); }
  .sb-panel::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(220,38,38,0.5), rgba(245,158,11,0.4));
    border-radius: 3px;
  }
  .sb-panel::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(220,38,38,0.8), rgba(245,158,11,0.7));
  }

  /* Título fijo (no scrollea) */
  .sbp-section-title {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.1rem 1.25rem 0.9rem;
    flex-shrink: 0;
  }

  .st-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(220,38,38,0.4), transparent);
  }

  .st-text {
    font-family: 'Pirata One', cursive;
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    color: rgba(220,38,38,0.65);
    font-weight: 700;
    white-space: nowrap;
    text-transform: uppercase;
  }

  /* Cuerpo scrolleable */
  .sbp-body {
    padding: 0 0.85rem 0.85rem;
    flex: 1;
    overflow: visible;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .nav-wrap { display: none; }
    .sb-panel {
      left: 0;
      top: 53px;
      z-index: 90;
    }
    .sbp-section-title {
      padding: 0.75rem 1rem;
    }
  }

  /* ══════════════════════════════════════════
     MINI LOADING POR SECCIÓN
  ══════════════════════════════════════════ */
  .section-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    min-height: 300px;
  }

  .sl-luffy {
    position: relative;
    width: 220px; height: 220px;
    display: flex; align-items: center; justify-content: center;
  }

  .sl-img {
    width: 220px; height: 220px;
    object-fit: contain;
    position: relative; z-index: 1;
    animation: luffyBob 2s ease-in-out infinite;
    filter: drop-shadow(0 0 14px rgba(220,38,38,0.45)) drop-shadow(0 0 30px rgba(245,158,11,0.15));
  }

  @keyframes luffyBob {
    0%, 100% { transform: translateY(0) rotate(-1deg); }
    50%       { transform: translateY(-8px) rotate(1deg); }
  }

  .sl-glow {
    position: absolute; inset: -15px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(220,38,38,0.18) 0%, rgba(245,158,11,0.08) 50%, transparent 70%);
    animation: glowPulse 2s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { transform: scale(1);    opacity: 0.7; }
    50%       { transform: scale(1.15); opacity: 1;   }
  }

  .sl-name {
    font-family: 'Pirata One', cursive;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--p-white);
    letter-spacing: 0.1em;
    text-shadow: 0 0 16px rgba(245,158,11,0.4);
  }

  .sl-bar {
    width: 320px; height: 5px;
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .sl-fill {
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(220,38,38,0.6) 20%,
      rgba(245,158,11,0.9) 50%,
      rgba(220,38,38,0.6) 80%,
      transparent 100%
    );
    animation: slSlide 1.4s ease-in-out infinite;
    border-radius: 2px;
  }

  @keyframes slSlide {
    0%   { left: -100%; }
    100% { left: 100%;  }
  }

  .sl-dots {
    display: flex; gap: 0.65rem;
  }

  .sl-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: rgba(245,158,11,0.4);
    animation: slDot 0.9s ease-in-out infinite;
  }

  @keyframes slDot {
    0%, 100% { transform: translateY(0);   background: rgba(245,158,11,0.4); }
    50%       { transform: translateY(-5px); background: rgba(220,38,38,0.8); }
  }
</style>
