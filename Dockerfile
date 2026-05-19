# ==========================================
# Etapa 1: Builder (Compilación y Pruning)
# ==========================================
FROM node:20-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package*.json ./

# Instala todas las dependencias (incluyendo devDependencies)
RUN npm ci

# Copia el resto del código fuente del proyecto
COPY . .

# Construye la aplicación compilando para producción
RUN npm run build

# Elimina las dependencias de desarrollo para aligerar la carpeta node_modules
RUN npm prune --production

# ==========================================
# Etapa 2: Runner (Producción Ligera y Segura)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copiar solo los artefactos necesarios compilados y dependencias optimizadas
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expone el puerto por defecto usado por SvelteKit adapter-node
EXPOSE 3000

# Ejecutar el contenedor bajo el usuario node de bajos privilegios para mayor seguridad
USER node

# Comando de inicio del servidor node
CMD ["node", "build/index.js"]
