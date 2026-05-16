# PaliWallet - Guía de Desarrollo

## Descripción General

PaliWallet es una aplicación descentralizada (DApp) construida con SvelteKit que permite a los usuarios:
- Conectar su wallet (Pali Wallet)
- Ver su balance en tiempo real
- Enviar transacciones entre cuentas
- Cambiar entre diferentes redes blockchain (UTXO y EVM)
- Visualizar el historial de transacciones

## Características Implementadas

### 1. Página de Introducción ✅
- **Ruta**: `/intro`
- **Contenido**:
  - Descripción del proyecto
  - Objetivos principales
  - Beneficios para usuarios
  - Características principales
  - Información del desarrollador
  - Call-to-action para conectar wallet

### 2. Transacciones de Cuenta a Cuenta ✅
- **Componente**: `SendTransaction.svelte`
- **Funcionalidades**:
  - Formulario para enviar transacciones
  - Validación de dirección y cantidad
  - Captura y visualización del hash de transacción
  - Historial de transacciones recientes
  - Estados: pending, confirmed, failed
  - Copia de hash al portapapeles

### 3. Cambio de Red ✅
- **Componente**: `NetworkSwitcher.svelte`
- **Funcionalidades**:
  - Selector de redes disponibles
  - Filtro por tipo (UTXO/EVM)
  - Adición automática de redes no existentes
  - Visualización de red actual
  - Soporte para múltiples redes:
    - Syscoin Mainnet/Testnet (UTXO)
    - Ethereum Mainnet/Sepolia (EVM)
    - Polygon Mainnet/Mumbai (EVM)

## Estructura del Proyecto

```
src/
├── routes/
│   ├── intro/
│   │   └── +page.svelte          # Página de introducción
│   ├── (app)/
│   │   ├── +layout.svelte        # Layout protegido
│   │   └── dashboard/
│   │       └── +page.svelte      # Dashboard principal
│   ├── +page.svelte              # Landing page
│   └── +layout.svelte            # Layout global
├── lib/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.svelte
│   │   └── ui/
│   │       ├── BalanceCard.svelte
│   │       ├── SendTransaction.svelte    # NUEVO
│   │       ├── NetworkSwitcher.svelte    # NUEVO
│   │       ├── ConnectButton.svelte
│   │       └── ErrorBox.svelte
│   ├── services/
│   │   ├── wallet.service.ts
│   │   └── transaction.service.ts        # NUEVO
│   ├── stores/
│   │   ├── wallet.store.ts
│   │   └── transaction.store.ts          # NUEVO
│   ├── types/
│   │   └── wallet.ts                     # ACTUALIZADO
│   ├── constants/
│   │   └── network.ts                    # ACTUALIZADO
│   └── utils/
│       └── format.ts
```

## Tipos de Datos

### WalletState
```typescript
interface WalletState {
  address: string;
  balance: string;
  connected: boolean;
  loading: boolean;
  error: string;
  currentNetwork?: NetworkInfo;
}
```

### NetworkInfo
```typescript
interface NetworkInfo {
  name: string;
  label: string;
  chainId: number;
  rpcUrl: string;
  type: 'UTXO' | 'EVM';
  currency: string;
  blockExplorer?: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  networkId: number;
}
```

## Servicios Principales

### wallet.service.ts
- `connectWallet()`: Conecta la wallet del usuario
- `disconnectWallet()`: Desconecta la wallet

### transaction.service.ts
- `sendTransaction(to, amount, network)`: Envía una transacción
- `switchNetwork(network)`: Cambia a una red diferente
- `getTransactionDetails(hash, network)`: Obtiene detalles de una transacción

## Stores

### walletStore
Gestiona el estado de la wallet:
- Dirección conectada
- Balance actual
- Red actual
- Estado de conexión
- Errores

### transactionStore
Gestiona el historial de transacciones:
- Lista de transacciones
- Estado de carga
- Mensajes de error

## Redes Soportadas

### UTXO Networks
- Syscoin Mainnet (chainId: 57)
- Syscoin Testnet (chainId: 5700)

### EVM Networks
- Ethereum Mainnet (chainId: 1)
- Ethereum Sepolia (chainId: 11155111)
- Polygon Mainnet (chainId: 137)
- Polygon Mumbai (chainId: 80001)

## Flujo de Uso

1. **Landing Page** (`/`)
   - Usuario ve la página de bienvenida
   - Opción para conectar wallet

2. **Introducción** (`/intro`)
   - Información sobre el proyecto
   - Características y beneficios

3. **Dashboard** (`/dashboard`)
   - Visualización de balance
   - Selector de red
   - Formulario para enviar transacciones
   - Historial de transacciones

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## Variables de Entorno

No se requieren variables de entorno especiales. La aplicación usa RPC públicos para las redes soportadas.

## Notas Importantes

1. **Pali Wallet**: La aplicación requiere la extensión Pali Wallet instalada en el navegador
2. **Redes**: Las redes se agregan automáticamente si no existen en la wallet
3. **Transacciones**: El estado de las transacciones se actualiza en tiempo real
4. **Seguridad**: Todas las transacciones se firman localmente en la wallet del usuario

## Próximas Mejoras

- [ ] Historial persistente de transacciones
- [ ] Soporte para Smart Contracts
- [ ] Múltiples wallets
- [ ] Temas personalizables
- [ ] Notificaciones en tiempo real
- [ ] Exportar historial de transacciones

## Contacto

Desarrollador: Jossue Valle Grande
GitHub: https://github.com/vallegrande
