<script lang="ts">
  import { onMount } from 'svelte';

  let hasError  = false;
  let errorMsg  = '';
  let errorStack = '';

  onMount(() => {
    // Captura errores no manejados en el browser
    const handleError = (e: ErrorEvent) => {
      hasError   = true;
      errorMsg   = e.message ?? 'Error desconocido';
      errorStack = e.error?.stack ?? '';
      e.preventDefault();
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      hasError   = true;
      errorMsg   = e.reason?.message ?? String(e.reason) ?? 'Promesa rechazada';
      errorStack = e.reason?.stack ?? '';
      e.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  });

  function reload() { window.location.reload(); }
  function dismiss() { hasError = false; errorMsg = ''; errorStack = ''; }
</script>

{#if hasError}
  <div class="eb-overlay" role="alertdialog" aria-modal="true" aria-label="Error de la aplicación">
    <div class="eb-box">

      <!-- Icon -->
      <div class="eb-icon" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>

      <h2 class="eb-title">Algo salió mal</h2>
      <p class="eb-msg">{errorMsg}</p>

      {#if errorStack}
        <details class="eb-details">
          <summary class="eb-summary">Ver detalles técnicos</summary>
          <pre class="eb-stack">{errorStack}</pre>
        </details>
      {/if}

      <div class="eb-actions">
        <button class="eb-btn-reload" on:click={reload} aria-label="Recargar la aplicación">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Recargar app
        </button>
        <button class="eb-btn-dismiss" on:click={dismiss} aria-label="Ignorar error y continuar">
          Ignorar
        </button>
      </div>

    </div>
  </div>
{/if}

<slot />

<style>
  .eb-overlay {
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    pointer-events: all;
  }

  .eb-box {
    background: linear-gradient(145deg, #0e0a1a 0%, #1a0a0a 60%, #0e0a1a 100%);
    border: 1px solid rgba(220,38,38,0.35);
    border-radius: 14px; padding: 2rem;
    width: 100%; max-width: 420px;
    text-align: center;
    box-shadow:
      0 0 50px rgba(220,38,38,0.15),
      0 40px 80px rgba(0,0,0,0.85);
    animation: popIn 0.3s ease;
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }

  .eb-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(220,38,38,0.1);
    border: 2px solid rgba(220,38,38,0.3);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.25rem;
    box-shadow: 0 0 30px rgba(220,38,38,0.2);
  }

  .eb-title {
    font-family: 'Cinzel', serif; font-size: 1.2rem; font-weight: 700;
    color: #f87171; margin: 0 0 0.6rem; letter-spacing: 0.05em;
  }

  .eb-msg {
    font-size: 0.88rem; color: rgba(240,232,255,0.7);
    line-height: 1.6; margin: 0 0 1.25rem;
  }

  .eb-details { text-align: left; margin-bottom: 1.25rem; }

  .eb-summary {
    font-size: 0.72rem; color: rgba(220,38,38,0.5);
    cursor: pointer; letter-spacing: 0.05em;
    list-style: none; padding: 0.3rem 0;
  }

  .eb-stack {
    font-size: 0.62rem; color: rgba(196,181,253,0.35);
    background: rgba(6,4,10,0.6); border: 1px solid rgba(220,38,38,0.1);
    border-radius: 5px; padding: 0.75rem;
    overflow-x: auto; white-space: pre-wrap;
    word-break: break-all; margin-top: 0.5rem;
    max-height: 120px; overflow-y: auto;
    font-family: 'Courier New', monospace;
  }

  .eb-actions { display: flex; gap: 0.75rem; }

  .eb-btn-reload {
    flex: 2; padding: 0.8rem;
    background: rgba(220,38,38,0.1);
    border: 1px solid rgba(220,38,38,0.3);
    border-radius: 8px; color: #f87171;
    font-family: 'Cinzel', serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    transition: all 0.2s;
  }

  .eb-btn-reload:hover { background: rgba(220,38,38,0.18); border-color: rgba(220,38,38,0.55); box-shadow: 0 4px 16px rgba(220,38,38,0.2); }

  .eb-btn-dismiss {
    flex: 1; padding: 0.8rem;
    background: transparent; border: 1px solid rgba(245,158,11,0.15);
    border-radius: 8px; color: rgba(245,158,11,0.45);
    font-family: 'Cinzel', serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em;
    cursor: pointer; transition: all 0.2s;
  }

  .eb-btn-dismiss:hover { background: rgba(245,158,11,0.06); border-color: rgba(245,158,11,0.3); color: var(--n-gold2); }
</style>
