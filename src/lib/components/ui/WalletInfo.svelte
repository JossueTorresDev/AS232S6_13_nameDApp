<script lang="ts">
  import { walletStore } from '$lib/stores/wallet.store';
  import { toastStore }  from '$lib/stores/toast.store';
  import { shortAddress, formatBalance } from '$lib/utils/format';

  let copied = false;

  async function copyAddress() {
    await navigator.clipboard.writeText($walletStore.address);
    copied = true;
    toastStore.success('Dirección copiada');
    setTimeout(() => (copied = false), 2000);
  }
</script>

<!-- Dirección (corta) -->
<div class="info-panel">
  <div class="ip-icon" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  </div>
  <div>
    <p class="ip-label">DIRECCIÓN</p>
    <p class="ip-value mono">{shortAddress($walletStore.address)}</p>
  </div>
</div>

<!-- Saldo -->
<div class="info-panel">
  <div class="ip-icon" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  </div>
  <div>
    <p class="ip-label">SALDO</p>
    <p class="ip-value mono">
      {formatBalance($walletStore.balance, 6)}
      {$walletStore.currentNetwork?.currency || 'SYS'}
    </p>
  </div>
</div>

<style>
  .info-panel {
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 6px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.25s;
  }

  .info-panel:hover {
    background: rgba(245,158,11,0.09);
    border-color: rgba(245,158,11,0.32);
    box-shadow: 0 4px 20px rgba(245,158,11,0.1);
    transform: translateX(3px);
  }

  .ip-icon {
    width: 34px; height: 34px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .ip-label {
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    color: rgba(245,158,11,0.52);
    font-weight: 700;
    margin: 0 0 3px;
    text-transform: uppercase;
  }

  .ip-value {
    font-size: 0.95rem;
    color: var(--n-white);
    margin: 0;
    font-weight: 700;
  }

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

  .addr-text {
    font-size: 0.62rem;
    color: rgba(196,181,253,0.38);
    word-break: break-all;
    margin: 0;
    line-height: 1.5;
  }

  .copy-icon { flex-shrink: 0; }
</style>
