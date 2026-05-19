# 🏴‍☠️ PaliWallet - DApp Blockchain Pirates
> **"¡No me importa si muero intentándolo, yo seré el Rey de los Piratas!"** - Monkey D. Luffy.
> 
> Una aplicación descentralizada (DApp) premium construida sobre **SvelteKit** que conecta a los piratas del ecosistema Web3 con la red **Syscoin (UTXO/EVM)**, **Ethereum** y **Polygon** a través de la extensión de **Pali Wallet**.

---

## 🌟 Visuales y Diseño Emotivo
PaliWallet no es solo una DApp de transacciones común; está diseñada con una estética visual premium inmersiva inspirada en **One Piece** y **Los Siete Pecados Capitales**:
* **Ocean Parallax Background:** Un fondo tridimensional dinámico que reacciona sutilmente al movimiento del ratón, emulando la navegación en el Grand Line.
* **Haki Bar:** Indicador visual de Haki que fluye constantemente con gradientes animados en tiempo real.
* **Straw Hat Emblem & Ancors:** Detalles vectoriales dinámicos que vibran en sincronía con los estados de conexión Web3.
* **Nakama System:** Integración con direcciones favoritas y alias personalizados.

---

## 🚀 Características Principales
1. **Conexión de Wallet Segura:** Integración nativa con **Pali Wallet** y auto-reconexión silenciosa.
2. **Transferencias de Cuenta a Cuenta (P2P):** Envíos inmediatos con firmas locales y verificación en tiempo real de estados de transacciones (`pending`, `confirmed`, `failed`).
3. **Selector de Redes e Interoperabilidad (EVM/UTXO):** Cambio de red automático. Si la red seleccionada no está en la wallet, la DApp la agrega de forma transparente.
4. **Watch-Only Mode:** Permite consultar los saldos e historial público de cualquier dirección sin necesidad de conectar una llave privada o firma.
5. **Historial desde Exploradores:** Integración con APIs de **Etherscan**, **Polygonscan** y exploradores compatibles en redes de pruebas y principal.
6. **Límites de Transacción:** Panel de seguridad integrado para establecer montos máximos por transacción y Whitelist de direcciones de nakamas confiables.

---

## 🏗️ Arquitectura del Sistema
El proyecto implementa una arquitectura modular moderna y desacoplada de nivel empresarial:

```
src/
├── routes/
│   ├── intro/
│   │   └── +page.svelte          # Página descriptiva del proyecto
│   ├── (app)/
│   │   ├── +layout.svelte        # Layout protegido para piratas conectados
│   │   └── dashboard/
│   │       └── +page.svelte      # Dashboard interactivo principal
│   ├── +page.svelte              # Landing Page - Conectar Wallet
│   └── +layout.svelte            # Layout global e interactividad Parallax
├── lib/
│   ├── components/               # Componentes UI reutilizables
│   │   ├── layout/               # Header, Sidebar interactivos
│   │   └── ui/                   # BalanceCard, NetworkSwitcher, SendTransaction, etc.
│   ├── services/                 # Servicios Web3 puros (ethers, APIs, RPCs)
│   ├── stores/                   # Manejo de estado reactivo global (Svelte stores)
│   ├── types/                    # Tipos estrictos TypeScript para red, txs y wallet
│   └── utils/                    # Funciones de utilidad y formato
```

---

## 🛠️ Tecnologías y Herramientas
* **Core:** [SvelteKit](https://kit.svelte.dev/) con TypeScript
* **Librería Web3:** [ethers.js v6](https://docs.ethers.org/v6/)
* **Contenerización:** [Docker](https://www.docker.com/) con compilación multi-etapa optimizada
* **CI/CD:** [GitHub Actions](https://github.com/features/actions) integrado con Docker Hub
* **Styling:** Vanilla CSS puro con variables y animaciones nativas avanzadas

---

## 🐳 Despliegue con Docker
La DApp está lista para empaquetarse e implementarse en entornos de nube mediante contenedores Docker ligeros basados en Alpine.

### Compilar y Ejecutar Localmente con Docker:
```bash
# Construir la imagen Docker
docker build -t jossuetorres/dapp-onepiece:latest .

# Ejecutar el contenedor expuesto en el puerto 3000
docker run -p 3000:3000 jossuetorres/dapp-onepiece:latest
```

---

## 💻 Desarrollo Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina:

```bash
# 1. Clonar el repositorio e ingresar
git clone https://github.com/JossueTorresDev/AS232S6_13_nameDApp.git
cd AS232S6_13_nameDApp

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Compilar bundle de producción
npm run build
```

---

## 🛡️ Auditoría Técnica
Para conocer a fondo el análisis de arquitectura de software, hidratación de SSR, desacoplamiento de stores y el plan de implementación de pruebas con Vitest, revisa el archivo de auditoría del proyecto:
📄 [AUDIT.md](file:///c:/Users/JOSSUE/Desktop/AS232S6_13_nameDApp/AUDIT.md)

---

## 🌊 Nakamas y Colaboradores
* **Desarrollador:** Jossue Torres
* **Redes:** [GitHub](https://github.com/JossueTorresDev) · [LinkedIn](https://www.linkedin.com/in/jheferson-jossue-torres-humareda-b85662291/)
* **Temática:** Siete Pecados Capitales x One Piece

*¡Zarpemos hacia la innovación de la Web3!* ⛵💎