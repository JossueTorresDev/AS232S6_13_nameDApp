<script lang="ts">
  import { toastStore } from '$lib/stores/toast.store';
  import { scale, fly } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';

  // Solo mostramos el primero de la cola como modal central (SweetAlert style)
  // Los demás esperan en cola
  $: current = $toastStore[0] ?? null;
  $: queue   = $toastStore.length - 1;

  // Colores por tipo
  const config = {
    success: {
      color:    '#22c55e',
      colorBg:  'rgba(34,197,94,0.1)',
      colorBdr: 'rgba(34,197,94,0.35)',
      glow:     'rgba(34,197,94,0.25)',
      title:    '¡Éxito!',
    },
    error: {
      color:    '#f87171',
      colorBg:  'rgba(220,38,38,0.1)',
      colorBdr: 'rgba(220,38,38,0.4)',
      glow:     'rgba(220,38,38,0.25)',
      title:    '¡Error!',
    },
    info: {
      color:    '#c4b5fd',
      colorBg:  'rgba(147,51,234,0.1)',
      colorBdr: 'rgba(147,51,234,0.35)',
      glow:     'rgba(147,51,234,0.25)',
      title:    'Información',
    },
    pending: {
      color:    '#fbbf24',
      colorBg:  'rgba(245,158,11,0.08)',
      colorBdr: 'rgba(245,158,11,0.35)',
      glow:     'rgba(245,158,11,0.2)',
      title:    'Procesando...',
    },
  } as const;
</script>

<!-- Backdrop + modal -->
{#if current}
  {@const cfg = config[current.type]}

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="sa-backdrop"
    on:click={() => current?.type !== 'pending' && toastStore.remove(current.id)}
    in:fly={{ y: 0, duration: 150 }}
    out:fly={{ y: 0, duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-live="assertive"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="sa-modal"
      style="--sa-color:{cfg.color}; --sa-bg:{cfg.colorBg}; --sa-bdr:{cfg.colorBdr}; --sa-glow:{cfg.glow};"
      in:scale={{ duration: 380, easing: elasticOut, start: 0.7 }}
      out:scale={{ duration: 180, start: 0.85 }}
      on:click|stopPropagation
    >
      <!-- Glow ring -->
      <div class="sa-ring sa-ring-1"></div>
      <div class="sa-ring sa-ring-2"></div>

      <!-- Icon -->
      <div class="sa-icon-wrap">
        <div class="sa-icon-circle">
          {#if current.type === 'success'}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          {:else if current.type === 'error'}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          {:else if current.type === 'pending'}
            <svg class="spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          {:else}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          {/if}
        </div>
      </div>

      <!-- Title -->
      <h3 class="sa-title">{cfg.title}</h3>

      <!-- Message -->
      <p class="sa-message">{@html current.message}</p>

      <!-- Queue indicator -->
      {#if queue > 0}
        <p class="sa-queue">+{queue} notificación{queue > 1 ? 'es' : ''} en cola</p>
      {/if}

      <!-- Progress bar (solo si tiene duración) -->
      {#if current.duration && current.duration > 0}
        <div class="sa-progress-wrap">
          <div
            class="sa-progress-bar"
            style="animation-duration: {current.duration}ms"
          ></div>
        </div>
      {/if}

      <!-- Actions -->
      <div class="sa-actions">
        {#if current.type === 'pending'}
          <!-- Pending no se puede cerrar manualmente -->
          <p class="sa-wait">Por favor espera...</p>
        {:else}
          <button
            class="sa-btn sa-btn-confirm"
            on:click={() => toastStore.remove(current.id)}
          >
            {current.type === 'error' ? 'Entendido' : 'Aceptar'}
          </button>
        {/if}
      </div>

    </div>
  </div>
{/if}

<style>
  /* ── Backdrop ── */
  .sa-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: transparent;
    backdrop-filter: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    pointer-events: none;
  }

  .sa-modal {
    pointer-events: all;
  }

  /* ── Modal ── */
  .sa-modal {
    position: relative;
    background: linear-gradient(160deg, #0e0a1a 0%, #160d28 55%, #0e0a1a 100%);
    border: 1px solid var(--sa-bdr);
    border-radius: 16px;
    padding: 2.5rem 2rem 2rem;
    width: 100%;
    max-width: 400px;
    text-align: center;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04) inset,
      0 0 60px var(--sa-glow),
      0 40px 80px rgba(0,0,0,0.8);
  }

  /* ── Decorative rings ── */
  .sa-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid var(--sa-bdr);
    pointer-events: none;
    opacity: 0.25;
  }

  .sa-ring-1 {
    width: 280px; height: 280px;
    top: -100px; right: -80px;
    animation: ringPulse 3s ease-in-out infinite;
  }

  .sa-ring-2 {
    width: 180px; height: 180px;
    bottom: -60px; left: -50px;
    animation: ringPulse 3s ease-in-out infinite 1.5s;
  }

  @keyframes ringPulse {
    0%, 100% { opacity: 0.15; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(1.05); }
  }

  /* ── Icon ── */
  .sa-icon-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  .sa-icon-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--sa-bg);
    border: 2px solid var(--sa-bdr);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--sa-color);
    box-shadow:
      0 0 0 8px var(--sa-bg),
      0 0 30px var(--sa-glow);
    animation: iconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
  }

  @keyframes iconPop {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  /* ── Title ── */
  .sa-title {
    font-family: 'Cinzel', serif;
    font-size: 1.3rem;
    font-weight: 900;
    color: var(--sa-color);
    letter-spacing: 0.06em;
    margin: 0 0 0.6rem;
    text-shadow: 0 0 20px var(--sa-glow);
    animation: fadeUp 0.3s ease 0.15s both;
  }

  /* ── Message ── */
  .sa-message {
    font-size: 0.92rem;
    color: rgba(240,232,255,0.75);
    line-height: 1.6;
    margin: 0 0 1.5rem;
    animation: fadeUp 0.3s ease 0.2s both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Queue ── */
  .sa-queue {
    font-size: 0.7rem;
    color: rgba(245,158,11,0.5);
    letter-spacing: 0.05em;
    margin: -0.75rem 0 1rem;
  }

  /* ── Progress bar ── */
  .sa-progress-wrap {
    height: 3px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }

  .sa-progress-bar {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, var(--sa-color), var(--sa-bdr));
    border-radius: 2px;
    transform-origin: left;
    animation: progressShrink linear forwards;
    box-shadow: 0 0 8px var(--sa-glow);
  }

  @keyframes progressShrink {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
  }

  /* ── Actions ── */
  .sa-actions {
    animation: fadeUp 0.3s ease 0.25s both;
  }

  .sa-btn-confirm {
    padding: 0.75rem 2.5rem;
    background: var(--sa-bg);
    border: 1px solid var(--sa-bdr);
    border-radius: 8px;
    color: var(--sa-color);
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px var(--sa-glow);
  }

  .sa-btn-confirm:hover {
    background: color-mix(in srgb, var(--sa-color) 15%, transparent);
    border-color: var(--sa-color);
    box-shadow: 0 6px 24px var(--sa-glow);
    transform: translateY(-2px);
  }

  .sa-btn-confirm:active {
    transform: translateY(0);
  }

  .sa-wait {
    font-size: 0.78rem;
    color: rgba(245,158,11,0.5);
    letter-spacing: 0.08em;
    margin: 0;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  /* ── Spinner ── */
  .spin {
    animation: spinAnim 0.9s linear infinite;
  }

  @keyframes spinAnim {
    to { transform: rotate(360deg); }
  }
</style>
