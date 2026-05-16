<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';

  let mouseX = 0, mouseY = 0;
  let tiltX  = 0, tiltY  = 0;
  let raf: number;

  function onMouseMove(e: MouseEvent) {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    mouseX = (e.clientX - cx) / cx;
    mouseY = (e.clientY - cy) / cy;
  }

  function loop() {
    tiltX += (mouseX - tiltX) * 0.05;
    tiltY += (mouseY - tiltY) * 0.05;
    raf = requestAnimationFrame(loop);
  }

  onMount(() => {
    window.addEventListener('mousemove', onMouseMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  });

  $: bgX  = tiltX * -20;
  $: bgY  = tiltY * -20;
  $: midX = tiltX * -8;
  $: midY = tiltY * -8;
  $: fgX  = tiltX *  5;
  $: fgY  = tiltY *  5;
</script>

<!-- Capa 1: fondo oceánico oscuro, azul profundo a negro -->
<div
  class="layer layer-bg"
  style="transform: translate({bgX}px, {bgY}px) scale(1.08)"
  aria-hidden="true"
></div>

<!-- Capa 2: niebla marina azul oscura + viñeta -->
<div
  class="layer layer-overlay"
  style="transform: translate({midX}px, {midY}px)"
  aria-hidden="true"
>
  <!-- Ancla SVG sutil pulsante en el centro -->
  <div class="anchor-bg">
    <svg width="220" height="220" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="18" r="10" stroke="rgba(30,58,95,0.18)" stroke-width="2" fill="none"/>
      <line x1="50" y1="28" x2="50" y2="78" stroke="rgba(30,58,95,0.18)" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="30" y1="38" x2="70" y2="38" stroke="rgba(30,58,95,0.18)" stroke-width="2" stroke-linecap="round"/>
      <path d="M50 78 Q28 78 28 60" stroke="rgba(30,58,95,0.18)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M50 78 Q72 78 72 60" stroke="rgba(30,58,95,0.18)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M28 60 L22 65 L28 68" stroke="rgba(30,58,95,0.18)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M72 60 L78 65 L72 68" stroke="rgba(30,58,95,0.18)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</div>

<!-- Capa 3: burbujas y destellos dorados/azules flotando hacia arriba -->
<div
  class="layer layer-particles"
  style="transform: translate({fgX}px, {fgY}px)"
  aria-hidden="true"
>
  {#each Array(22) as _, i}
    <span class="bubble" style="
      --x:{2 + i * 4.4}%;
      --dur:{6 + (i % 5) * 2.5}s;
      --delay:{(i % 7) * 0.9}s;
      --size:{2 + (i % 4) * 1.5}px;
      --col:{i % 5 === 0 ? 'rgba(245,158,11,0.65)' : i % 5 === 1 ? 'rgba(251,191,36,0.45)' : i % 5 === 2 ? 'rgba(59,130,246,0.4)' : i % 5 === 3 ? 'rgba(96,165,250,0.35)' : 'rgba(30,58,95,0.5)'};
    "></span>
  {/each}
</div>

<slot />

<style>
  .layer {
    position: fixed; inset: -30px;
    pointer-events: none; z-index: 0;
    will-change: transform;
    transition: transform 0.05s linear;
  }

  /* ── Fondo: océano profundo ── */
  .layer-bg {
    background:
      radial-gradient(ellipse 65% 80% at 15% 40%, rgba(30,58,95,0.28) 0%, rgba(15,39,68,0.1) 40%, transparent 65%),
      radial-gradient(ellipse 55% 70% at 85% 60%, rgba(10,14,26,0.3) 0%, transparent 55%),
      radial-gradient(ellipse 40% 50% at 50% 80%, rgba(220,38,38,0.06) 0%, transparent 50%),
      linear-gradient(180deg,
        #0a0e1a 0%,
        #0f1520 20%,
        #0f2744 50%,
        #0f1520 80%,
        #0a0e1a 100%);
    filter: brightness(1) contrast(1.05);
  }

  /* ── Overlay: niebla marina y viñeta ── */
  .layer-overlay {
    background:
      radial-gradient(ellipse 100% 100% at 50% 50%,
        transparent 40%,
        rgba(10,14,26,0.35) 70%,
        rgba(10,14,26,0.75) 100%),
      linear-gradient(180deg,
        rgba(10,14,26,0.3) 0%,
        transparent 20%,
        transparent 80%,
        rgba(10,14,26,0.5) 100%);
  }

  /* Ancla de fondo — muy sutil, pulsante */
  .anchor-bg {
    position: absolute;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    width: 220px; height: 220px;
    display: flex; align-items: center; justify-content: center;
    animation: anchorPulse 7s ease-in-out infinite;
  }

  .anchor-bg::before {
    content: '';
    position: absolute; inset: -20px;
    border-radius: 50%;
    border: 1px solid rgba(30,58,95,0.1);
    animation: anchorPulse 7s ease-in-out infinite reverse;
  }

  .anchor-bg::after {
    content: '';
    position: absolute; inset: -50px;
    border-radius: 50%;
    border: 1px solid rgba(30,58,95,0.06);
  }

  @keyframes anchorPulse {
    0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
    50%       { opacity: 0.9; transform: translate(-50%, -50%) scale(1.04); }
  }

  /* ── Partículas — burbujas y destellos dorados/azules ── */
  .layer-particles { overflow: hidden; }

  .bubble {
    position: absolute;
    bottom: -10px; left: var(--x);
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: var(--col);
    box-shadow: 0 0 calc(var(--size) * 2.5) var(--col);
    animation: floatUp var(--dur) var(--delay) ease-in-out infinite;
  }

  @keyframes floatUp {
    0%   { transform: translateY(0) translateX(0) scale(1);   opacity: 0; }
    8%   { opacity: 0.9; }
    40%  { transform: translateY(-40vh) translateX(8px) scale(0.85); opacity: 0.5; }
    70%  { transform: translateY(-70vh) translateX(-6px) scale(0.6); opacity: 0.25; }
    100% { transform: translateY(-105vh) translateX(4px) scale(0.2); opacity: 0; }
  }
</style>
