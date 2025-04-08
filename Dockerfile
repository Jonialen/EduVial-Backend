# EduVial-Backend/Dockerfile

# --- Stage 1: Base ---
FROM node:22-alpine AS base
WORKDIR /usr/src/app
# Instalar dependencias necesarias para compilar algunos paquetes npm en Alpine
# python3, make y g++ son comúnmente necesarios para node-gyp (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

# --- Stage 2: Dependencias ---
FROM base AS deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
# Instalar solo dependencias de producción
RUN npm install --production --ignore-scripts
# Limpiar cache de npm y dependencias de build si no se necesitan más
RUN npm cache clean --force && apk del python3 make g++

# --- Stage 3: Builder (Para desarrollo o si necesitas devDependencies en algún paso) ---
FROM base AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN npm install
COPY . .
# Aquí podrías ejecutar comandos de build o tests si fuera necesario
# RUN npm run build

# --- Stage 4: Producción Final ---
FROM base AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app
# Copia las dependencias de producción desde la etapa 'deps'
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Copia el código de la aplicación (puede ser desde 'builder' si hubo un paso de build)
COPY . .
# Eliminar dependencias de build que ya no se necesitan en la imagen final
RUN apk del python3 make g++
# Expone el puerto (asegúrate que coincida con el PORT en .env)
EXPOSE ${PORT:-3000}
# Usuario no-root para seguridad (opcional pero recomendado)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
# Comando para iniciar la aplicación
CMD ["node", "src/app.js"]

# --- Stage 5: Desarrollo ---
FROM base AS development
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
# Instalar todas las dependencias para desarrollo
RUN npm install
COPY . .
# Exponer puerto para desarrollo
EXPOSE ${PORT:-3000}
# Comando para desarrollo usando nodemon (definido en package.json scripts.dev)
CMD ["npm", "run", "dev"]
