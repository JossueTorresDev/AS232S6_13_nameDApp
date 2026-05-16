# Quick Start - PaliWallet DApp

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Pali Wallet extensión instalada en el navegador
- Fondos de prueba en testnet (opcional)

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/vallegrande/Demo_Svelte_Blockchain.git
cd Demo_Svelte_Blockchain
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## Primeros Pasos

### 1. Instalar Pali Wallet

1. Ve a https://paliwallet.com
2. Descarga la extensión para tu navegador
3. Instala y configura tu wallet
4. Crea o importa una cuenta

### 2. Explorar la Aplicación

#### Landing Page (`/`)
- Página de bienvenida con temática anime
- Botón para conectar wallet

#### Página de Introducción (`/intro`)
- Descripción del proyecto
- Objetivos y beneficios
- Características principales
- Información del desarrollador

#### Dashboard (`/dashboard`)
- Visualización de balance
- Selector de red
- Formulario para enviar transacciones
- Historial de transacciones

### 3. Conectar Wallet

1. Haz clic en "CONECTAR WALLET"
2. Aprueba la conexión en Pali Wallet
3. Serás redirigido al dashboard

### 4. Cambiar de Red

1. En el dashboard, haz clic en "Red Actual"
2. Selecciona una red de la lista
3. Aprueba el cambio en Pali Wallet
4. La red se agregará automáticamente si no existe

### 5. Enviar una Transacción

1. Rellena el formulario "Enviar Transacción"
2. Dirección del destinatario (dirección Ethereum válida)
3. Cantidad a enviar
4. Haz clic en "Enviar Transacción"
5. Aprueba en Pali Wallet
6. El hash aparecerá en la pantalla
7. Copia el hash si lo necesitas

## Redes Disponibles

### UTXO Networks
- **Syscoin Mainnet** (chainId: 57)
- **Syscoin Testnet** (chainId: 5700)

### EVM Networks
- **Ethereum Mainnet** (chainId: 1)
- **Ethereum Sepolia** (chainId: 11155111)
- **Polygon Mainnet** (chainId: 137)
- **Polygon Mumbai** (chainId: 80001)

## Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linting (si está configurado)
npm run lint

# Formateo (si está configurado)
npm run format
```

## Estructura de Carpetas

```
src/
├── routes/              # Páginas y rutas
├── lib/
│   ├── components/      # Componentes reutilizables
│   ├── services/        # Lógica de negocio
│   ├── stores/          # Estado global
│   ├── types/           # Tipos TypeScript
│   ├── constants/       # Constantes
│   └── utils/           # Funciones auxiliares
├── app.css              # Estilos globales
└── app.html             # HTML base
```

## Solución de Problemas

### "Pali Wallet no detectada"
- Asegúrate de tener Pali Wallet instalada
- Recarga la página
- Verifica que la extensión esté habilitada

### "Error al conectar la wallet"
- Verifica que Pali Wallet esté desbloqueada
- Intenta desconectar y conectar nuevamente
- Recarga la página

### "Saldo insuficiente"
- Necesitas fondos en la red actual
- Para testnet, usa un faucet
- Espera a que se confirmen las transacciones

### "Error al cambiar de red"
- La red se agregará automáticamente
- Aprueba la adición en Pali Wallet
- Intenta nuevamente

### "Transacción fallida"
- Verifica la dirección del destinatario
- Asegúrate de tener saldo suficiente
- Revisa el gas limit
- Intenta con una cantidad menor

## Recursos Útiles

- [SvelteKit Docs](https://kit.svelte.dev)
- [ethers.js Docs](https://docs.ethers.org)
- [Pali Wallet](https://paliwallet.com)
- [Syscoin Network](https://syscoin.org)

## Desarrollo

### Agregar una Nueva Red

1. Abre `src/lib/constants/network.ts`
2. Agrega una nueva constante:

```typescript
export const NUEVA_RED: NetworkInfo = {
  name: 'Nueva Red',
  label: 'Mainnet',
  chainId: 123,
  rpcUrl: 'https://rpc.nuevared.com',
  type: 'EVM',
  currency: 'TOKEN',
  blockExplorer: 'https://explorer.nuevared.com'
};
```

3. Agrégala a `AVAILABLE_NETWORKS`

### Agregar un Nuevo Componente

1. Crea el archivo en `src/lib/components/`
2. Importa en la página donde lo necesites
3. Usa el componente

### Crear una Nueva Página

1. Crea una carpeta en `src/routes/`
2. Agrega `+page.svelte`
3. La ruta se genera automáticamente

## Despliegue

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "build"]
```

## Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

## Licencia

Este proyecto es privado de VALLE GRANDE.

## Soporte

Para preguntas o problemas:
- Abre un issue en GitHub
- Contacta al desarrollador
- Revisa la documentación

## Próximos Pasos

Después de explorar la aplicación:

1. Lee `DEVELOPMENT.md` para entender la arquitectura
2. Revisa `YOUTUBE_VIDEO_GUIDE.md` para el video
3. Consulta `GITHUB_SETUP.md` para configuración
4. Explora el código en `src/`

---

¡Disfruta usando PaliWallet! 🚀
