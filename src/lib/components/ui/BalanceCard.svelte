<script lang="ts">
  import { walletStore }  from '$lib/stores/wallet.store';
  import { refreshBalance } from '$lib/services/wallet.service';
  import { formatBalance }  from '$lib/utils/format';

  export let balance: string;
  export let address: string;

  let refreshing = false;

  async function handleRefresh() {
    refreshing = true;
    await refreshBalance();
    refreshing = false;
  }
</script>

<div class="balance-card">
  <div class="bc-glow"></div>
  <div class="bc-pattern"></div>

  <!-- Top row -->
  <div class="bc-top">
    <div class="bc-icon">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="1.5">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    </div>
    <span class="bc-label">SALDO DISPONIBLE</span>
    <div class="bc-status">
      <span class="bc-dot"></span>
      LIVE
    </div>
    <!-- Refresh button -->
    <button class="bc-refresh" on:click={handleRefresh} disabled={refreshing} title="Actualizar saldo">
      <svg
        class:spin={refreshing}
        width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="M23 4v6h-6"/>
        <path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
      </svg>
    </button>
  </div>

  <!-- Amount -->
  <p class="bc-amount">{formatBalance(balance)}</p>

  <!-- Network + currency -->
  <p class="bc-sym">
    {$walletStore.currentNetwork?.currency || 'SYS'}
    · {$walletStore.currentNetwork?.name || 'Red desconocida'}
  </p>

  <!-- Animated bar -->
  <div class="bc-bar"><div class="bc-fill"></div></div>

  <!-- Footer -->
  <div class="bc-footer">
    <div class="bc-dots">
      {#each Array(8) as _}<span></span>{/each}
    </div>
    <span class="bc-last4 mono">{address.slice(-4).toUpperCase()}</span>
  </div>
</div>

<style>
  .balance-card {
    position: relative;
    background: linear-gradient(135deg, #0c0818 0%, #160d28 50%, #0c0818 100%);
    border: 1px solid var(--n-border);
    border-radius: 8px;
    padding: 1.5rem;
    overflow: hidden;
    box-shadow:
      0 0 30px rgba(245,158,11,0.12),
      0 0 60px rgba(107,33,168,0.1),
      0 20px 40px rgba(0,0,0,0.7),
      inset 0 1px 0 rgba(245,158,11,0.18);
    color: var(--n-white);
  }

  .bc-glow {
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(107,33,168,0.08) 50%, transparent 70%);
    pointer-events: none;
  }

  .bc-pattern {
    position: absolute; inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(107,33,168,0.03) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .bc-top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    position: relative;
  }

  .bc-icon {
    width: 28px; height: 28px;
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.22);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .bc-label {
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    color: rgba(245,158,11,0.55);
    font-weight: 700;
    flex: 1;
  }

  .bc-status {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.58rem;
    color: var(--n-gold);
    letter-spacing: 0.1em;
    font-weight: 700;
  }

  .bc-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--n-gold);
    box-shadow: 0 0 6px var(--n-gold);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  /* ── Refresh button ── */
  .bc-refresh {
    background: rgba(245,158,11,0.07);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 4px;
    padding: 0.28rem;
    color: rgba(245,158,11,0.55);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .bc-refresh:hover:not(:disabled) {
    background: rgba(245,158,11,0.18);
    border-color: rgba(245,158,11,0.5);
    color: var(--n-gold2);
    box-shadow: 0 0 8px rgba(245,158,11,0.2);
  }

  .bc-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spin {
    animation: spinAnim 0.7s linear infinite;
  }

  @keyframes spinAnim {
    to { transform: rotate(360deg); }
  }

  /* ── Amount ── */
  .bc-amount {
    font-family: 'Cinzel', serif;
    font-size: 2.4rem;
    font-weight: 900;
    color: var(--n-white);
    letter-spacing: -1px;
    line-height: 1;
    position: relative;
    text-shadow: 0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(107,33,168,0.2);
  }

  @media (max-width: 480px) {
    .bc-amount { font-size: 1.8rem; }
  }

  .bc-sym {
    font-size: 0.72rem;
    color: rgba(245,158,11,0.5);
    margin: 0.25rem 0 1rem;
    letter-spacing: 0.08em;
    font-weight: 600;
  }

  /* ── Bar ── */
  .bc-bar {
    height: 3px;
    background: rgba(245,158,11,0.1);
    border-radius: 2px;
    margin-bottom: 1rem;
    overflow: hidden;
  }

  .bc-fill {
    height: 100%; width: 100%;
    background: linear-gradient(90deg, #6b21a8, #9333ea, #f59e0b, #fbbf24, #f59e0b);
    background-size: 200% 100%;
    animation: flow 2.5s linear infinite;
    box-shadow: 0 0 8px rgba(245,158,11,0.6);
  }

  @keyframes flow {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  /* ── Footer ── */
  .bc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .bc-dots { display: flex; gap: 4px; }

  .bc-dots span {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(245,158,11,0.2);
  }

  .bc-last4 {
    font-size: 0.78rem;
    color: rgba(245,158,11,0.5);
    font-weight: 700;
    letter-spacing: 0.15em;
  }
</style>
