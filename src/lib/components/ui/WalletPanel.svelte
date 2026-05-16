<script lang="ts">
  import { walletStore }  from '$lib/stores/wallet.store';
  import { toastStore }   from '$lib/stores/toast.store';
  import BalanceCard      from './BalanceCard.svelte';
  import NetworkSwitcher  from './NetworkSwitcher.svelte';
  import DisconnectButton from './DisconnectButton.svelte';
  import SendTransaction  from './SendTransaction.svelte';
  import WalletInfo       from './WalletInfo.svelte';
  import SkeletonCard     from './SkeletonCard.svelte';

  $: balanceReady = $walletStore.balance !== '' && $walletStore.balance !== '0.0';

  let copied = false;
  async function copyAddress() {
    await navigator.clipboard.writeText($walletStore.address);
    copied = true;
    toastStore.success('Dirección copiada');
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="wallet-panel">
  <div class="wp-top">

    <!-- Columna izquierda -->
    <div class="wp-col">
      {#if balanceReady}
        <BalanceCard balance={$walletStore.balance} address={$walletStore.address} />
      {:else}
        <SkeletonCard hero rows={2} />
      {/if}

      <!-- Address completo debajo del saldo -->
      <button class="address-panel" on:click={copyAddress} aria-label="Copiar dirección completa">
        <div class="ap-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          <div>
            <p class="ap-label">ADDRESS COMPLETO</p>
            <p class="ap-addr mono">{$walletStore.address}</p>
          </div>
        </div>
        <div class="ap-copy" aria-hidden="true">
          {#if copied}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold2)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          {/if}
        </div>
      </button>

      <NetworkSwitcher />
      <DisconnectButton />
    </div>

    <!-- ── Separador ── -->
    <div class="wp-sep" aria-hidden="true">
      <div class="sep-line"></div>
      <div class="sep-gem">
        <svg width="10" height="10" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="18" r="9" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none"/>
          <line x1="50" y1="27" x2="50" y2="74" stroke="rgba(220,38,38,0.45)" stroke-width="3" stroke-linecap="round"/>
          <line x1="30" y1="40" x2="70" y2="40" stroke="rgba(220,38,38,0.45)" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M50 74 Q28 74 28 56" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M50 74 Q72 74 72 56" stroke="rgba(220,38,38,0.45)" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="sep-line"></div>
    </div>

    <!-- Columna derecha -->
    <div class="wp-col">

      <SendTransaction />

      {#if balanceReady}
        <WalletInfo />
      {:else}
        <SkeletonCard rows={3} />
      {/if}

    </div>

  </div>

</div>

<style>
  .wallet-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Fila superior: dos columnas + separador */
  .wp-top {
    display: grid;
    grid-template-columns: 1fr 28px 1fr;
    align-items: start;
  }

  .wp-col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.25rem 0;
  }

  /* Address completo */
  .address-panel {
    width: 100%;
    background: rgba(245,158,11,0.03);
    border: 1px solid rgba(245,158,11,0.1);
    border-radius: 6px;
    padding: 0.9rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.25s;
    text-align: left;
    color: var(--n-white);
    box-sizing: border-box;
  }

  .address-panel:hover {
    background: rgba(245,158,11,0.08);
    border-color: rgba(245,158,11,0.3);
    box-shadow: 0 4px 20px rgba(245,158,11,0.1);
  }

  .ap-left {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    flex: 1;
    min-width: 0;
  }

  .ap-left svg { flex-shrink: 0; margin-top: 2px; }

  .ap-label {
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    color: rgba(245,158,11,0.52);
    font-weight: 700;
    margin: 0 0 3px;
    text-transform: uppercase;
  }

  .ap-addr {
    font-size: 0.62rem;
    color: rgba(196,181,253,0.38);
    word-break: break-all;
    margin: 0;
    line-height: 1.5;
  }

  .ap-copy { flex-shrink: 0; }

  /* Separador vertical */
  .wp-sep {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    min-height: 300px;
  }

  .sep-line {
    flex: 1;
    width: 1px;
    background: linear-gradient(180deg,
      transparent 0%,
      rgba(220,38,38,0.2) 15%,
      rgba(30,58,95,0.15) 85%,
      transparent 100%
    );
  }

  .sep-gem {
    flex-shrink: 0;
    width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(220,38,38,0.06);
    border: 1px solid rgba(220,38,38,0.18);
    border-radius: 50%;
  }

  @media (max-width: 700px) {
    .wp-top {
      grid-template-columns: 1fr;
    }
    .wp-sep { display: none; }
  }
</style>
