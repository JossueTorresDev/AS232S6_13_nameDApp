<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { elasticOut }  from 'svelte/easing';

  export let message = 'Cargando...';
</script>

<div class="loading-screen" in:fade={{ duration: 200 }} out:fade={{ duration: 400 }}>

  <!-- Fondo con partículas -->
  <div class="bg-particles" aria-hidden="true">
    {#each Array(12) as _, i}
      <div class="particle" style="
        left: {8 + i * 8}%;
        animation-delay: {i * 0.3}s;
        animation-duration: {2.5 + (i % 4) * 0.5}s;
      "></div>
    {/each}
  </div>

  <!-- Contenido central -->
  <div class="loading-content" in:scale={{ duration: 500, delay: 100, easing: elasticOut, start: 0.85 }}>

    <!-- Luffy SVG -->
    <div class="luffy-wrap" aria-hidden="true">
      <div class="luffy-glow"></div>
      <img src="/luffy.svg" alt="Luffy" class="luffy-img" />
    </div>

    <!-- Título -->
    <div class="brand">
      <span class="brand-name">PaliWallet</span>
      <span class="brand-sub">GRAND LINE · BLOCKCHAIN</span>
    </div>

    <!-- Barra de carga -->
    <div class="progress-wrap" role="progressbar" aria-label="Cargando">
      <div class="progress-track">
        <div class="progress-fill"></div>
        <div class="progress-shine"></div>
      </div>
      <div class="progress-dots">
        {#each Array(3) as _, i}
          <span class="dot" style="animation-delay: {i * 0.25}s"></span>
        {/each}
      </div>
    </div>

    <!-- Mensaje -->
    <p class="loading-msg">{message}</p>

  </div>

  <!-- Línea decorativa inferior -->
  <div class="bottom-line" aria-hidden="true">
    <div class="bl-seg"></div>
    <div class="bl-diamond"></div>
    <div class="bl-seg"></div>
  </div>

</div>

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse 80% 60% at 30% 40%, rgba(30,58,95,0.35) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 70% 60%, rgba(220,38,38,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 60%),
      linear-gradient(160deg, #06040e 0%, #0a0e1a 40%, #0f1520 100%);
    overflow: hidden;
  }

  /* ── Partículas flotantes ── */
  .bg-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    bottom: -10px;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(245,158,11,0.4);
    box-shadow: 0 0 6px rgba(245,158,11,0.3);
    animation: floatUp linear infinite;
  }

  .particle:nth-child(odd)  { background: rgba(220,38,38,0.35); box-shadow: 0 0 6px rgba(220,38,38,0.3); }
  .particle:nth-child(3n)   { width: 2px; height: 2px; }
  .particle:nth-child(4n)   { width: 4px; height: 4px; }

  @keyframes floatUp {
    0%   { transform: translateY(0) translateX(0); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
  }

  /* ── Contenido ── */
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    position: relative;
    z-index: 1;
  }

  /* ── Luffy ── */
  .luffy-wrap {
    position: relative;
    width: 250px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .luffy-glow {
    position: absolute;
    inset: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(220,38,38,0.2) 0%, rgba(245,158,11,0.1) 40%, transparent 70%);
    animation: glowPulse 2s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { transform: scale(1);   opacity: 0.7; }
    50%       { transform: scale(1.15); opacity: 1;   }
  }

  .luffy-img {
    width: 250px;
    height: 250px;
    object-fit: contain;
    position: relative;
    z-index: 1;
    animation: luffyBob 2.2s ease-in-out infinite;
    filter: drop-shadow(0 0 18px rgba(220,38,38,0.4)) drop-shadow(0 0 40px rgba(245,158,11,0.15));
  }

  @keyframes luffyBob {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-10px) rotate(1deg); }
  }

  /* ── Brand ── */
  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .brand-name {
    font-family: 'Pirata One', cursive;
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--p-white);
    letter-spacing: 0.08em;
    text-shadow:
      0 0 20px rgba(245,158,11,0.5),
      0 0 40px rgba(220,38,38,0.3);
    animation: brandShimmer 3s ease-in-out infinite;
  }

  @keyframes brandShimmer {
    0%, 100% { text-shadow: 0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(220,38,38,0.3); }
    50%       { text-shadow: 0 0 30px rgba(245,158,11,0.8), 0 0 60px rgba(220,38,38,0.5); }
  }

  .brand-sub {
    font-family: 'Pirata One', cursive;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    color: rgba(220,38,38,0.6);
    text-transform: uppercase;
  }

  /* ── Barra de progreso ── */
  .progress-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    width: 260px;
  }

  .progress-track {
    width: 100%;
    height: 4px;
    background: rgba(245,158,11,0.1);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(245,158,11,0.15);
  }

  .progress-fill {
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
    animation: progressSlide 1.6s ease-in-out infinite;
    border-radius: 2px;
  }

  .progress-shine {
    position: absolute;
    top: 0; left: -200%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: progressSlide 1.6s ease-in-out infinite 0.3s;
  }

  @keyframes progressSlide {
    0%   { left: -100%; }
    100% { left: 100%;  }
  }

  .progress-dots {
    display: flex;
    gap: 0.5rem;
  }

  .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(245,158,11,0.4);
    animation: dotBounce 0.9s ease-in-out infinite;
  }

  @keyframes dotBounce {
    0%, 100% { transform: translateY(0);   background: rgba(245,158,11,0.4); }
    50%       { transform: translateY(-5px); background: rgba(220,38,38,0.8); }
  }

  /* ── Mensaje ── */
  .loading-msg {
    font-family: 'Pirata One', cursive;
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    color: rgba(245,158,11,0.5);
    text-transform: uppercase;
    animation: msgFade 2s ease-in-out infinite;
  }

  @keyframes msgFade {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1;   }
  }

  /* ── Línea inferior ── */
  .bottom-line {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 300px;
  }

  .bl-seg {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(220,38,38,0.4), transparent);
  }

  .bl-diamond {
    width: 8px; height: 8px;
    background: rgba(220,38,38,0.5);
    transform: rotate(45deg);
    box-shadow: 0 0 8px rgba(220,38,38,0.4);
    animation: diamondPulse 2s ease-in-out infinite;
  }

  @keyframes diamondPulse {
    0%, 100% { box-shadow: 0 0 8px rgba(220,38,38,0.4); }
    50%       { box-shadow: 0 0 16px rgba(220,38,38,0.8), 0 0 30px rgba(245,158,11,0.3); }
  }
</style>
