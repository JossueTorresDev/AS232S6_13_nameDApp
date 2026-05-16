<script lang="ts">
  /** Cuántas filas de skeleton mostrar */
  export let rows: number = 3;
  /** Mostrar un bloque grande arriba (para BalanceCard) */
  export let hero: boolean = false;
</script>

<div class="skeleton-card">
  {#if hero}
    <div class="sk-row sk-hero"></div>
    <div class="sk-row sk-sub"></div>
  {/if}
  {#each Array(rows) as _, i}
    <div class="sk-row" style="width: {85 - i * 10}%; animation-delay: {i * 0.1}s"></div>
  {/each}
</div>

<style>
  .skeleton-card {
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.1);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .sk-row {
    height: 14px;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      rgba(245,158,11,0.06) 0%,
      rgba(245,158,11,0.14) 50%,
      rgba(245,158,11,0.06) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
  }

  .sk-hero {
    height: 48px;
    width: 60% !important;
    border-radius: 6px;
  }

  .sk-sub {
    height: 12px;
    width: 40% !important;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
