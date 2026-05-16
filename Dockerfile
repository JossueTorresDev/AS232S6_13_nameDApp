# Usa una imagen de Node.js ligera como base
FROM node:20-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia el resto del código
COPY . .

# Construye la aplicación
RUN npm run build

# Etapa final (producción)
FROM node:20-alpine

WORKDIR /app

# Copia solo lo necesario para correr la app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expone el puerto (por defecto SvelteKit usa el 3000 con adapter-node)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "build/index.js"]
