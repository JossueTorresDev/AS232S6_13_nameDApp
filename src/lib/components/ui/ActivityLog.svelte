<script lang="ts">
  import { activityStore } from '$lib/stores/activity.store';
  import type { ActivityType } from '$lib/stores/activity.store';
  import { toastStore } from '$lib/stores/toast.store';

  let showLog = false;
  let filterType: 'all' | ActivityType = 'all';

  function toggleLog() { showLog = !showLog; }

  function clearLog() {
    activityStore.clear();
    toastStore.info('Log de actividad limpiado');
  }

  function iconFor(type: ActivityType): string {
    const map: Record<ActivityType, string> = {
      connect:        'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3',
      disconnect:     'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
      network_change: 'M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20',
      tx_sent:        'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
      tx_confirmed:   'M20 6L9 17 4 12',
      tx_failed:      'M18 6L6 18M6 6l12 12',
      balance_refresh:'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
      account_change: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
      error:          'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    };
    return map[type] ?? 'M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0';
  }

  function colorFor(type: ActivityType): string {
    if (type === 'error' || type === 'tx_failed')      return '#f87171';
    if (type === 'tx_confirmed' || type === 'connect') return '#22c55e';
    if (type === 'tx_sent')                            return 'var(--n-gold2)';
    return 'rgba(196,181,253,0.7)';
  }

  function labelFor(type: ActivityType): string {
    const map: Record<ActivityType, string> = {
      connect:        'Conexión',
      disconnect:     'Desconexión',
      network_change: 'Red',
      tx_sent:        'TX Enviada',
      tx_confirmed:   'TX Confirmada',
      tx_failed:      'TX Fallida',
      balance_refresh:'Balance',
      account_change: 'Cuenta',
      error:          'Error',
    };
    return map[type] ?? type;
  }

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  $: presentTypes = [...new Set($activityStore.map(e => e.type))] as ActivityType[];
  $: filtered = filterType === 'all'
    ? $activityStore
    : $activityStore.filter(e => e.type === filterType);
  $: recentCount = $activityStore.filter(e => Date.now() - e.timestamp < 86_400_000).length;
</script>

<!-- Botón toggle -->
<button class="btn-log" on:click={toggleLog} aria-expanded={showLog} aria-label="Ver log de actividad">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
  LOG DE ACTIVIDAD
  {#if $activityStore.length > 0}
    <span class="log-count">{$activityStore.length}</span>
  {/if}
  {#if recentCount > 0}
    <span class="log-recent">
      <span class="log-recent-dot"></span>
      {recentCount} hoy
    </span>
  {/if}
</button>

{#if showLog}
  <div class="log-panel">

    <!-- Header -->
    <div class="al-header">
      <div class="al-title-row">
        <div class="al-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h3 class="al-title">Actividad Reciente</h3>
        {#if $activityStore.length > 0}
          <span class="al-badge">{$activityStore.length}</span>
        {/if}
      </div>
      {#if $activityStore.length > 0}
        <button class="btn-clear" on:click={clearLog} aria-label="Limpiar log">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          </svg>
          Limpiar
        </button>
      {/if}
    </div>

    <div class="al-divider"></div>

    <!-- Filtros -->
    {#if presentTypes.length > 1}
      <div class="filter-row" role="group" aria-label="Filtrar por tipo">
        <button class="filter-chip" class:active={filterType === 'all'} on:click={() => filterType = 'all'} aria-pressed={filterType === 'all'}>
          Todos <span class="chip-count">{$activityStore.length}</span>
        </button>
        {#each presentTypes as t}
          <button class="filter-chip" class:active={filterType === t} on:click={() => filterType = t} aria-pressed={filterType === t} style="--chip-color:{colorFor(t)}">
            {labelFor(t)} <span class="chip-count">{$activityStore.filter(e => e.type === t).length}</span>
          </button>
        {/each}
      </div>
    {/if}

    <!-- Lista -->
    {#if filtered.length > 0}
      <div class="log-list" role="log" aria-label="Entradas de actividad">
        {#each filtered as entry (entry.id)}
          <div class="log-entry" style="--entry-color:{colorFor(entry.type)}">
            <div class="entry-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d={iconFor(entry.type)}/>
              </svg>
            </div>
            <div class="entry-body">
              <p class="entry-msg">{entry.message}</p>
              {#if entry.meta}
                <p class="entry-meta">{Object.entries(entry.meta).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
              {/if}
            </div>
            <div class="entry-right">
              <span class="entry-type" style="color:{colorFor(entry.type)}">{labelFor(entry.type)}</span>
              <span class="entry-date">{formatDate(entry.timestamp)}</span>
              <span class="entry-time mono">{formatTime(entry.timestamp)}</span>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="log-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(196,181,253,0.15)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>Sin actividad registrada</p>
      </div>
    {/if}

  </div>
{/if}

<style>
  .btn-log {
    width: 100%; padding: 0.8rem;
    background: rgba(147,51,234,0.05);
    border: 1px solid rgba(147,51,234,0.18);
    border-radius: 6px;
    font-family: 'Cinzel', serif;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
    color: rgba(196,181,253,0.7);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.25s;
  }

  .btn-log:hover {
    background: rgba(147,51,234,0.1);
    border-color: rgba(147,51,234,0.4);
    color: #c4b5fd;
    box-shadow: 0 0 14px rgba(147,51,234,0.15);
  }

  .log-count {
    background: rgba(147,51,234,0.15);
    border: 1px solid rgba(147,51,234,0.3);
    border-radius: 10px; padding: 0.1rem 0.45rem;
    font-size: 0.6rem; font-weight: 700; color: #c4b5fd; line-height: 1.4;
  }

  .log-recent {
    display: inline-flex; align-items: center; gap: 0.3rem;
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: 10px; padding: 0.1rem 0.45rem;
    font-size: 0.58rem; font-weight: 700; color: rgba(134,239,172,0.8);
  }

  .log-recent-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #22c55e; box-shadow: 0 0 5px #22c55e;
    animation: pulse 2s infinite;
  }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .log-panel {
    background: rgba(147,51,234,0.03);
    border: 1px solid rgba(147,51,234,0.12);
    border-radius: 6px; padding: 1rem; margin-top: 0.5rem;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

  .al-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 0.75rem; margin-bottom: 0.75rem;
  }

  .al-title-row { display: flex; align-items: center; gap: 0.55rem; }

  .al-icon {
    width: 28px; height: 28px;
    background: rgba(147,51,234,0.1); border: 1px solid rgba(147,51,234,0.22);
    border-radius: 6px; display: flex; align-items: center; justify-content: center;
  }

  .al-title {
    font-family: 'Cinzel', serif; font-size: 0.85rem; font-weight: 700;
    color: var(--n-white); letter-spacing: 0.05em; margin: 0;
  }

  .al-badge {
    background: rgba(147,51,234,0.15); border: 1px solid rgba(147,51,234,0.3);
    border-radius: 10px; padding: 0.1rem 0.5rem;
    font-size: 0.62rem; font-weight: 700; color: #c4b5fd;
  }

  .btn-clear {
    display: flex; align-items: center; gap: 0.35rem;
    background: transparent; border: 1px solid rgba(220,38,38,0.25);
    border-radius: 5px; padding: 0.3rem 0.65rem;
    color: rgba(220,38,38,0.6); font-size: 0.65rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
  }

  .btn-clear:hover { background: rgba(220,38,38,0.08); border-color: rgba(220,38,38,0.5); color: #f87171; }

  .al-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(147,51,234,0.3), transparent);
    margin-bottom: 0.75rem;
  }

  .filter-row { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }

  .filter-chip {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    background: rgba(147,51,234,0.05); border: 1px solid rgba(147,51,234,0.15);
    border-radius: 20px; font-size: 0.65rem; font-weight: 700;
    color: rgba(196,181,253,0.5); cursor: pointer; transition: all 0.18s;
  }

  .filter-chip:hover { background: rgba(147,51,234,0.1); border-color: rgba(147,51,234,0.35); color: #c4b5fd; }
  .filter-chip.active { background: rgba(147,51,234,0.15); border-color: var(--chip-color, rgba(147,51,234,0.5)); color: var(--chip-color, #c4b5fd); }
  .chip-count { background: rgba(147,51,234,0.15); border-radius: 8px; padding: 0 0.3rem; font-size: 0.58rem; color: rgba(196,181,253,0.6); }

  .log-list { display: flex; flex-direction: column; gap: 0.45rem; }

  .log-entry {
    display: flex; align-items: flex-start; gap: 0.75rem;
    padding: 0.75rem 0.9rem;
    background: rgba(6,4,10,0.5); border: 1px solid rgba(147,51,234,0.07);
    border-left: 3px solid var(--entry-color); border-radius: 6px;
    transition: background 0.15s;
  }

  .log-entry:hover { background: rgba(147,51,234,0.06); border-left-color: var(--entry-color); }

  .entry-icon {
    flex-shrink: 0; width: 28px; height: 28px;
    background: rgba(6,4,10,0.6); border: 1px solid rgba(147,51,234,0.12);
    border-radius: 6px; display: flex; align-items: center; justify-content: center;
    color: var(--entry-color);
  }

  .entry-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
  .entry-msg { font-size: 0.8rem; color: var(--n-white); margin: 0; font-weight: 600; }
  .entry-meta { font-size: 0.63rem; color: rgba(196,181,253,0.35); margin: 0; font-family: 'Courier New', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .entry-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; }
  .entry-type { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
  .entry-date { font-size: 0.58rem; color: rgba(196,181,253,0.3); }
  .entry-time { font-size: 0.62rem; color: rgba(196,181,253,0.45); }

  .log-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 0.75rem; padding: 2rem 1rem;
    color: rgba(196,181,253,0.3); font-size: 0.8rem;
  }

  .log-empty p { margin: 0; }
</style>
