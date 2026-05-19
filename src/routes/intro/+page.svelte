<script lang="ts">
  import { goto } from '$app/navigation';
  import SocialLinks from '$lib/components/ui/SocialLinks.svelte';

  export const params = {};

  const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/JossueTorresDev', icon: 'github', title: 'GitHub' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/jheferson-jossue-torres-humareda-b85662291/', icon: 'linkedin', title: 'LinkedIn' },
    { name: 'Twitter', url: 'https://twitter.com/vallegrande', icon: 'twitter', title: 'Twitter/X' },
    { name: 'Instagram', url: 'https://instagram.com/vallegrande', icon: 'instagram', title: 'Instagram' },
    { name: 'Discord', url: 'https://discord.com/users/vallegrande', icon: 'discord', title: 'Discord' },
    { name: 'Opera GX', url: 'https://www.opera.com/gx', icon: 'opera', title: 'Opera GX Browser' },
  ];
</script>

<div class="intro-container">
  <!-- Header -->
  <header class="intro-header">
    <div class="header-content">
      <div class="logo-section">
        <svg class="logo-icon" width="48" height="48" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="56" stroke="#f59e0b" stroke-width="2.5" fill="rgba(245,158,11,0.06)"/>
          <path d="M60 22 C73 27 86 40 84 56 C82 70 72 80 60 84 C48 80 38 70 36 56 C34 40 47 27 60 22 Z"
            fill="rgba(245,158,11,0.12)" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="60" cy="60" r="5" fill="#f59e0b" opacity="0.7"/>
        </svg>
        <h1 class="logo-text">PALI<span class="accent">WALLET</span></h1>
      </div>
      <p class="tagline">Innovación Blockchain · Siete Pecados Capitales</p>
    </div>
  </header>

  <!-- Main Content -->
  <main class="intro-main">
    <!-- Descripción -->
    <section class="section description-section">
      <div class="section-header">
        <h2>Descripción del Proyecto</h2>
        <div class="header-line"></div>
      </div>
      <div class="section-content">
        <p>
          PaliWallet es una aplicación descentralizada (DApp) innovadora construida sobre la red Syscoin, 
          que integra la temática del anime "Siete Pecados Capitales" con tecnología blockchain de vanguardia. 
          Permite a los usuarios gestionar sus activos digitales de forma segura, realizar transacciones 
          entre cuentas y cambiar entre diferentes redes blockchain (UTXO y EVM).
        </p>
        <p>
          La plataforma combina una interfaz visual épica con funcionalidades Web3 robustas, 
          proporcionando una experiencia única en el ecosistema blockchain.
        </p>
      </div>
    </section>

    <!-- Objetivos -->
    <section class="section objectives-section">
      <div class="section-header">
        <h2>Objetivos</h2>
        <div class="header-line"></div>
      </div>
      <div class="objectives-grid">
        <div class="objective-card">
          <div class="obj-icon">🎯</div>
          <h3>Accesibilidad</h3>
          <p>Facilitar el acceso a tecnología blockchain para usuarios de todos los niveles</p>
        </div>
        <div class="objective-card">
          <div class="obj-icon">🔐</div>
          <h3>Seguridad</h3>
          <p>Garantizar transacciones seguras y protección de activos digitales</p>
        </div>
        <div class="objective-card">
          <div class="obj-icon">🌐</div>
          <h3>Interoperabilidad</h3>
          <p>Permitir operaciones en múltiples redes blockchain (UTXO y EVM)</p>
        </div>
        <div class="objective-card">
          <div class="obj-icon">✨</div>
          <h3>Experiencia</h3>
          <p>Ofrecer una interfaz intuitiva y visualmente atractiva</p>
        </div>
      </div>
    </section>

    <!-- Beneficios -->
    <section class="section benefits-section">
      <div class="section-header">
        <h2>Beneficios</h2>
        <div class="header-line"></div>
      </div>
      <div class="benefits-list">
        <div class="benefit-item">
          <div class="benefit-icon">💰</div>
          <div class="benefit-text">
            <h4>Gestión de Activos</h4>
            <p>Control total sobre tus criptoactivos con visualización en tiempo real</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">⚡</div>
          <div class="benefit-text">
            <h4>Transacciones Rápidas</h4>
            <p>Envía y recibe fondos de forma instantánea con confirmación en blockchain</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">🔄</div>
          <div class="benefit-text">
            <h4>Multi-Red</h4>
            <p>Cambia entre diferentes redes blockchain sin complicaciones</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">🛡️</div>
          <div class="benefit-text">
            <h4>Privacidad Total</h4>
            <p>Tus datos y transacciones están protegidos con estándares de seguridad blockchain</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Características -->
    <section class="section features-section">
      <div class="section-header">
        <h2>Características Principales</h2>
        <div class="header-line"></div>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-number">01</div>
          <h3>Conexión de Wallet</h3>
          <p>Integración con Pali Wallet para acceso seguro a tus fondos</p>
        </div>
        <div class="feature-card">
          <div class="feature-number">02</div>
          <h3>Transacciones P2P</h3>
          <p>Envía criptomonedas directamente a otras direcciones con hash verificable</p>
        </div>
        <div class="feature-card">
          <div class="feature-number">03</div>
          <h3>Cambio de Red</h3>
          <p>Alterna entre redes UTXO y EVM con adición automática de nuevas redes</p>
        </div>
        <div class="feature-card">
          <div class="feature-number">04</div>
          <h3>Dashboard Intuitivo</h3>
          <p>Panel de control con información clara de tu balance y transacciones</p>
        </div>
        <div class="feature-card">
          <div class="feature-number">05</div>
          <h3>Historial de Transacciones</h3>
          <p>Acceso a detalles completos de todas tus operaciones blockchain</p>
        </div>
        <div class="feature-card">
          <div class="feature-number">06</div>
          <h3>Diseño Temático</h3>
          <p>Interfaz inspirada en "Siete Pecados Capitales" con animaciones épicas</p>
        </div>
      </div>
    </section>

    <!-- Desarrollador -->
    <section class="section developer-section">
      <div class="section-header">
        <h2>Desarrollador</h2>
        <div class="header-line"></div>
      </div>
      <div class="developer-card">
        <div class="dev-photo">
          <img src="/developer.jpg" alt="Desarrollador" />
        </div>
        <div class="dev-info">
          <h3>Jossue Valle Grande</h3>
          <p class="dev-role">Full Stack Developer · Blockchain Specialist</p>
          <p class="dev-bio">
            Desarrollador apasionado por la tecnología blockchain y las aplicaciones descentralizadas. 
            Especializado en SvelteKit, Web3 y arquitectura de sistemas distribuidos. 
            Comprometido con crear soluciones innovadoras que combinen tecnología de punta con experiencia de usuario excepcional.
          </p>
          <div class="dev-links">
            <SocialLinks links={socialLinks} />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section">
      <h2>¿Listo para comenzar?</h2>
      <button class="btn-primary" on:click={() => goto('/')}>
        Conectar Wallet
      </button>
    </section>
  </main>

  <!-- Footer -->
  <footer class="intro-footer">
    <p>© 2026 PaliWallet · Innovación Blockchain · VALLE GRANDE</p>
  </footer>
</div>

<style>
  .intro-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--n-black);
    color: var(--n-white);
  }

  /* Header */
  .intro-header {
    padding: 2rem;
    border-bottom: 1px solid rgba(245,158,11,0.15);
    background: rgba(6,4,10,0.8);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .logo-icon {
    filter: drop-shadow(0 0 8px rgba(245,158,11,0.4));
  }

  .logo-text {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

  .logo-text .accent {
    color: var(--n-gold2);
    text-shadow: 0 0 15px rgba(251,191,36,0.6);
  }

  .tagline {
    font-size: 0.85rem;
    color: rgba(245,158,11,0.6);
    letter-spacing: 0.1em;
    margin-left: 4rem;
  }

  /* Main Content */
  .intro-main {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 3rem 2rem;
  }

  /* Sections */
  .section {
    margin-bottom: 4rem;
    animation: fadeInUp 0.6s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .section-header h2 {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    color: var(--n-white);
    white-space: nowrap;
  }

  .header-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, rgba(245,158,11,0.5), transparent);
  }

  /* Description Section */
  .description-section .section-content {
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 8px;
    padding: 2rem;
  }

  .description-section p {
    font-size: 1rem;
    line-height: 1.8;
    color: rgba(240,232,255,0.85);
    margin-bottom: 1rem;
  }

  .description-section p:last-child {
    margin-bottom: 0;
  }

  /* Objectives Grid */
  .objectives-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .objective-card {
    background: rgba(245,158,11,0.05);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
  }

  .objective-card:hover {
    background: rgba(245,158,11,0.1);
    border-color: rgba(245,158,11,0.35);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(245,158,11,0.15);
  }

  .obj-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .objective-card h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--n-gold2);
    margin-bottom: 0.5rem;
  }

  .objective-card p {
    font-size: 0.9rem;
    color: rgba(240,232,255,0.7);
    line-height: 1.6;
  }

  /* Benefits List */
  .benefits-list {
    display: grid;
    gap: 1.5rem;
  }

  .benefit-item {
    display: flex;
    gap: 1.5rem;
    background: rgba(245,158,11,0.03);
    border: 1px solid rgba(245,158,11,0.1);
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .benefit-item:hover {
    background: rgba(245,158,11,0.08);
    border-color: rgba(245,158,11,0.3);
    transform: translateX(5px);
  }

  .benefit-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .benefit-text h4 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--n-gold2);
    margin-bottom: 0.5rem;
  }

  .benefit-text p {
    font-size: 0.95rem;
    color: rgba(240,232,255,0.7);
    line-height: 1.6;
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .feature-card {
    background: linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(107,33,168,0.05) 100%);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 8px;
    padding: 2rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--n-gold), transparent);
  }

  .feature-card:hover {
    background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(107,33,168,0.1) 100%);
    border-color: rgba(245,158,11,0.35);
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(245,158,11,0.2);
  }

  .feature-number {
    font-family: 'Cinzel', serif;
    font-size: 2.5rem;
    font-weight: 900;
    color: rgba(245,158,11,0.3);
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--n-gold2);
    margin-bottom: 0.75rem;
  }

  .feature-card p {
    font-size: 0.95rem;
    color: rgba(240,232,255,0.7);
    line-height: 1.6;
  }

  /* Developer Section */
  .developer-card {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
    background: rgba(245,158,11,0.05);
    border: 1px solid rgba(245,158,11,0.15);
    border-radius: 8px;
    padding: 2rem;
    align-items: center;
  }

  .dev-photo {
    width: 100%;
    max-width: 300px;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid rgba(245,158,11,0.25);
    box-shadow: 0 0 30px rgba(245,158,11,0.2);
  }

  .dev-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .dev-info h3 {
    font-family: 'Cinzel', serif;
    font-size: 1.5rem;
    font-weight: 900;
    color: var(--n-white);
    margin-bottom: 0.5rem;
  }

  .dev-role {
    font-size: 0.95rem;
    color: var(--n-gold2);
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  }

  .dev-bio {
    font-size: 0.95rem;
    color: rgba(240,232,255,0.8);
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }

  .dev-links {
    display: flex;
    gap: 1rem;
  }

  /* CTA Section */
  .cta-section {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(107,33,168,0.08) 100%);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 8px;
  }

  .cta-section h2 {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
  }

  .btn-primary {
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white;
    border: none;
    border-radius: 6px;
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(124,58,237,0.4);
  }

  .btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(124,58,237,0.6);
  }

  /* Footer */
  .intro-footer {
    padding: 2rem;
    text-align: center;
    border-top: 1px solid rgba(245,158,11,0.15);
    background: rgba(6,4,10,0.8);
    color: rgba(240,232,255,0.5);
    font-size: 0.85rem;
    letter-spacing: 0.05em;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .intro-main {
      padding: 2rem 1rem;
    }

    .section-header h2 {
      font-size: 1.4rem;
    }

    .developer-card {
      grid-template-columns: 1fr;
    }

    .dev-photo {
      max-width: 100%;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .objectives-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
