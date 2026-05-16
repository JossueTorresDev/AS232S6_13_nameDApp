<script lang="ts">
  import { walletStore }      from '$lib/stores/wallet.store';
  import { transactionStore } from '$lib/stores/transaction.store';
  import { activityStore }    from '$lib/stores/activity.store';
  import { favoritesStore }   from '$lib/stores/favorites.store';
  import { txLimitsStore }    from '$lib/stores/txLimits.store';
  import { shortAddress, formatBalance } from '$lib/utils/format';

  // ── Métricas derivadas ────────────────────────────────────────────────────

  // Txs de la red actual
  $: networkTxs = $transactionStore.transactions.filter(
    tx => tx.networkId === $walletStore.currentNetwork?.chainId
  );

  $: confirmedTxs = networkTxs.filter(tx => tx.status === 'confirmed');
  $: failedTxs    = networkTxs.filter(tx => tx.status === 'failed');
  $: pendingTxs   = networkTxs.filter(tx => tx.status === 'pending');

  // Total enviado en la red actual
  $: totalSent = networkTxs
    .filter(tx => tx.status === 'confirmed')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  // Tasa de éxito
  $: successRate = networkTxs.length > 0
    ? Math.round((confirmedTxs.length / networkTxs.length) * 100)
    : 0;

  // Última tx
  $: lastTx = networkTxs[0] ?? null;

  // Tiempo desde última tx
  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    if (d > 0)  return `hace ${d}d`;
    if (h > 0)  return `hace ${h}h`;
    if (m > 0)  return `hace ${m}m`;
    return 'ahora';
  }

  // Actividad reciente (últimas 24h)
  $: recentActivity = $activityStore.filter(
    e => Date.now() - e.timestamp < 86_400_000
  ).length;

  // Gas promedio usado
  $: avgGas = (() => {
    const withGas = confirmedTxs.filter(tx => tx.gasUsed);
    if (!withGas.length) return null;
    const avg = withGas.reduce((s, tx) => s + parseInt(tx.gasUsed!), 0) / withGas.length;
    return Math.round(avg).toLocaleString('es-ES');
  })();

  // Dirección más frecuente
  $: topRecipient = (() => {
    if (!confirmedTxs.length) return null;
    const freq: Record<string, number> = {};
    confirmedTxs.forEach(tx => { freq[tx.to] = (freq[tx.to] ?? 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    return top ? { address: top[0], count: top[1] } : null;
  })();

  // Color de estado
  function statusColor(status: string) {
    if (status === 'confirmed') return '#22c55e';
    if (status === 'failed')    return '#f87171';
    return '#f59e0b';
  }

  // Sparkline de txs (últimos 7 días, una barra por día)
  $: sparkline = (() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const start = Date.now() - (6 - i) * 86_400_000;
      const end   = start + 86_400_000;
      return networkTxs.filter(tx => tx.timestamp >= start && tx.timestamp < end).length;
    });
    const max = Math.max(...days, 1);
    return days.map(v => ({ count: v, pct: Math.round((v / max) * 100) }));
  })();

  const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  $: todayIdx = (new Date().getDay() + 6) % 7; // lunes = 0
</script>

<div class="stats-dashboard">

  <!-- ── Título ── -->
  <div class="sd-header">
    <div class="sd-title-row">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      <h3 class="sd-title">Resumen de Actividad</h3>
    </div>
    <span class="sd-network">{$walletStore.currentNetwork?.name ?? '—'}</span>
  </div>

  <!-- ── KPI cards ── -->
  <div class="kpi-grid">

    <!-- Total txs -->
    <div class="kpi-card">
      <div class="kpi-icon tx" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </div>
      <div class="kpi-body">
        <span class="kpi-value">{networkTxs.length}</span>
        <span class="kpi-label">Transacciones</span>
      </div>
      {#if pendingTxs.length > 0}
        <span class="kpi-badge pending">{pendingTxs.length} pend.</span>
      {/if}
    </div>

    <!-- Total enviado -->
    <div class="kpi-card">
      <div class="kpi-icon sent" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      </div>
      <div class="kpi-body">
        <span class="kpi-value">{totalSent.toFixed(4)}</span>
        <span class="kpi-label">Total enviado ({$walletStore.currentNetwork?.currency ?? 'SYS'})</span>
      </div>
    </div>

    <!-- Tasa de éxito -->
    <div class="kpi-card">
      <div class="kpi-icon rate" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="kpi-body">
        <span class="kpi-value" style="color: {successRate >= 80 ? '#22c55e' : successRate >= 50 ? '#f59e0b' : '#f87171'}">{successRate}%</span>
        <span class="kpi-label">Tasa de éxito</span>
      </div>
      <!-- Mini progress bar -->
      <div class="kpi-progress" aria-label="Tasa de éxito {successRate}%">
        <div class="kpi-progress-fill" style="width:{successRate}%; background:{successRate >= 80 ? '#22c55e' : successRate >= 50 ? '#f59e0b' : '#f87171'}"></div>
      </div>
    </div>

    <!-- Actividad 24h -->
    <div class="kpi-card">
      <div class="kpi-icon activity" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>
      <div class="kpi-body">
        <span class="kpi-value">{recentActivity}</span>
        <span class="kpi-label">Eventos (24h)</span>
      </div>
    </div>

    <!-- Favoritos -->
    <div class="kpi-card">
      <div class="kpi-icon fav" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div class="kpi-body">
        <span class="kpi-value">{$favoritesStore.length}</span>
        <span class="kpi-label">Favoritos</span>
      </div>
    </div>

    <!-- Seguridad -->
    <div class="kpi-card">
      <div class="kpi-icon sec" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div class="kpi-body">
        <span class="kpi-value" style="color:{($txLimitsStore.maxAmountEnabled || $txLimitsStore.whitelistEnabled) ? '#22c55e' : 'rgba(245,158,11,0.5)'}">
          {($txLimitsStore.maxAmountEnabled || $txLimitsStore.whitelistEnabled) ? 'ON' : 'OFF'}
        </span>
        <span class="kpi-label">Límites activos</span>
      </div>
    </div>

  </div>

  <!-- ── Sparkline 7 días ── -->
  <div class="sparkline-section">
    <div class="spark-header">
      <span class="spark-title">Transacciones · últimos 7 días</span>
      <span class="spark-total">{networkTxs.length} total</span>
    </div>
    <div class="sparkline" role="img" aria-label="Gráfico de transacciones de los últimos 7 días">
      {#each sparkline as bar, i}
        <div class="spark-col">
          <div class="spark-bar-wrap">
            <div
              class="spark-bar"
              class:today={i === todayIdx}
              style="height: {Math.max(bar.pct, bar.count > 0 ? 8 : 2)}%"
              title="{bar.count} tx"
            ></div>
          </div>
          <span class="spark-day">{DAY_LABELS[i]}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- ── Fila inferior: última tx + dirección top ── -->
  <div class="bottom-row">

    <!-- Última transacción -->
    <div class="info-block">
      <span class="ib-label">ÚLTIMA TX</span>
      {#if lastTx}
        <div class="ib-content">
          <span class="ib-dot" style="background:{statusColor(lastTx.status)}; box-shadow: 0 0 6px {statusColor(lastTx.status)}"></span>
          <span class="ib-main mono">{shortAddress(lastTx.hash)}</span>
          <span class="ib-sub">{timeAgo(lastTx.timestamp)}</span>
        </div>
        <div class="ib-detail">
          <span class="ib-amount">{lastTx.amount} {$walletStore.currentNetwork?.currency ?? 'SYS'}</span>
          <span class="ib-status" style="color:{statusColor(lastTx.status)}">{lastTx.status}</span>
        </div>
      {:else}
        <span class="ib-empty">Sin transacciones aún</span>
      {/if}
    </div>

    <!-- Dirección más frecuente -->
    <div class="info-block">
      <span class="ib-label">DESTINATARIO FRECUENTE</span>
      {#if topRecipient}
        <div class="ib-content">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--n-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="ib-main mono">{shortAddress(topRecipient.address)}</span>
        </div>
        <span class="ib-sub">{topRecipient.count} {topRecipient.count === 1 ? 'transacción' : 'transacciones'}</span>
      {:else}
        <span class="ib-empty">Sin datos</span>
      {/if}
    </div>

    <!-- Gas promedio -->
    <div class="info-block">
      <span class="ib-label">GAS PROMEDIO</span>
      {#if avgGas}
        <div class="ib-content">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(196,181,253,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span class="ib-main mono">{avgGas}</span>
        </div>
        <span class="ib-sub">unidades de gas</span>
      {:else}
        <span class="ib-empty">Sin datos</span>
      {/if}
    </div>

  </div>

  <!-- ── Barra de estado de txs (confirmed / failed / pending) ── -->
  {#if networkTxs.length > 0}
    <div class="tx-breakdown">
      <div class="txb-bar" role="img" aria-label="Distribución de transacciones">
        {#if confirmedTxs.length > 0}
          <div class="txb-seg confirmed" style="flex:{confirmedTxs.length}" title="{confirmedTxs.length} confirmadas"></div>
        {/if}
        {#if pendingTxs.length > 0}
          <div class="txb-seg pending" style="flex:{pendingTxs.length}" title="{pendingTxs.length} pendientes"></div>
        {/if}
        {#if failedTxs.length > 0}
          <div class="txb-seg failed" style="flex:{failedTxs.length}" title="{failedTxs.length} fallidas"></div>
        {/if}
      </div>
      <div class="txb-legend">
        {#if confirmedTxs.length > 0}
          <span class="txb-item confirmed"><span class="txb-dot"></span>{confirmedTxs.length} confirmadas</span>
        {/if}
        {#if pendingTxs.length > 0}
          <span class="txb-item pending"><span class="txb-dot"></span>{pendingTxs.length} pendientes</span>
        {/if}
        {#if failedTxs.length > 0}
          <span class="txb-item failed"><span class="txb-dot"></span>{failedTxs.length} fallidas</span>
        {/if}
      </div>
    </div>
  {/if}

</div>

<style>
  /* ── Contenedor ── */
  .stats-dashboard {
    background: linear-gradient(145deg, rgba(10,6,18,0.95) 0%, rgba(18,10,32,0.95) 100%);
    border: 1px solid rgba(245,158,11,0.18);
    border-radius: 10px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow:
      0 0 30px rgba(245,158,11,0.06),
      0 0 60px rgba(107,33,168,0.05),
      inset 0 1px 0 rgba(245,158,11,0.1);
  }

  /* ── Header ── */
  .sd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .sd-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sd-title {
    font-family: 'Cinzel', serif;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--n-white);
    letter-spacing: 0.06em;
    margin: 0;
  }

  .sd-network {
    font-size: 0.62rem;
    color: rgba(245,158,11,0.5);
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 3px;
    padding: 0.15rem 0.5rem;
    letter-spacing: 0.06em;
    font-weight: 700;
    white-space: nowrap;
  }

  /* ── KPI grid ── */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
  }

  .kpi-card {
    background: rgba(245,158,11,0.03);
    border: 1px solid rgba(245,158,11,0.1);
    border-radius: 7px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    position: relative;
    transition: all 0.2s;
    overflow: hidden;
  }

  .kpi-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  .kpi-card:hover {
    border-color: rgba(245,158,11,0.22);
    background: rgba(245,158,11,0.06);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(245,158,11,0.08);
  }

  .kpi-icon {
    width: 28px; height: 28px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .kpi-icon.tx       { background: rgba(245,158,11,0.1);  color: var(--n-gold2); }
  .kpi-icon.sent     { background: rgba(107,33,168,0.12); color: #c4b5fd; }
  .kpi-icon.rate     { background: rgba(34,197,94,0.1);   color: #22c55e; }
  .kpi-icon.activity { background: rgba(59,130,246,0.1);  color: #60a5fa; }
  .kpi-icon.fav      { background: rgba(245,158,11,0.1);  color: var(--n-gold2); }
  .kpi-icon.sec      { background: rgba(34,197,94,0.08);  color: #86efac; }

  .kpi-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .kpi-value {
    font-family: 'Cinzel', serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--n-white);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .kpi-label {
    font-size: 0.6rem;
    color: rgba(245,158,11,0.45);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .kpi-badge {
    position: absolute;
    top: 0.5rem; right: 0.5rem;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
  }

  .kpi-badge.pending {
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.3);
    color: var(--n-gold2);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .kpi-progress {
    height: 3px;
    background: rgba(245,158,11,0.08);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 0.15rem;
  }

  .kpi-progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
    box-shadow: 0 0 6px currentColor;
  }

  /* ── Sparkline ── */
  .sparkline-section {
    background: rgba(6,4,10,0.4);
    border: 1px solid rgba(245,158,11,0.08);
    border-radius: 7px;
    padding: 0.75rem;
  }

  .spark-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;
  }

  .spark-title {
    font-size: 0.62rem;
    font-weight: 700;
    color: rgba(245,158,11,0.5);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .spark-total {
    font-size: 0.62rem;
    color: rgba(245,158,11,0.35);
    font-weight: 700;
  }

  .sparkline {
    display: flex;
    align-items: flex-end;
    gap: 0.3rem;
    height: 52px;
  }

  .spark-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    height: 100%;
  }

  .spark-bar-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
  }

  .spark-bar {
    width: 100%;
    background: rgba(245,158,11,0.25);
    border-radius: 2px 2px 0 0;
    transition: height 0.4s ease, background 0.2s;
    min-height: 2px;
  }

  .spark-bar.today {
    background: rgba(245,158,11,0.7);
    box-shadow: 0 0 8px rgba(245,158,11,0.4);
  }

  .spark-bar:hover {
    background: rgba(245,158,11,0.9);
  }

  .spark-day {
    font-size: 0.55rem;
    color: rgba(245,158,11,0.35);
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  /* ── Bottom row ── */
  .bottom-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
  }

  .info-block {
    background: rgba(6,4,10,0.4);
    border: 1px solid rgba(245,158,11,0.08);
    border-radius: 7px;
    padding: 0.65rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .ib-label {
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(245,158,11,0.4);
    text-transform: uppercase;
  }

  .ib-content {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .ib-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ib-main {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--n-white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ib-sub {
    font-size: 0.6rem;
    color: rgba(245,158,11,0.4);
  }

  .ib-detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .ib-amount {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--n-gold2);
  }

  .ib-status {
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ib-empty {
    font-size: 0.7rem;
    color: rgba(245,158,11,0.25);
    font-style: italic;
  }

  /* ── Barra de distribución ── */
  .tx-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .txb-bar {
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    gap: 1px;
  }

  .txb-seg {
    border-radius: 3px;
    transition: flex 0.4s ease;
  }

  .txb-seg.confirmed { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.4); }
  .txb-seg.pending   { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.4); }
  .txb-seg.failed    { background: #f87171; box-shadow: 0 0 6px rgba(248,113,113,0.4); }

  .txb-legend {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .txb-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .txb-item.confirmed { color: rgba(34,197,94,0.7); }
  .txb-item.pending   { color: rgba(245,158,11,0.7); }
  .txb-item.failed    { color: rgba(248,113,113,0.7); }

  .txb-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .kpi-grid    { grid-template-columns: repeat(2, 1fr); }
    .bottom-row  { grid-template-columns: 1fr; }
  }
</style>
