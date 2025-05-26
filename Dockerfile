# Etapa 1: build
FROM node:lts-alpine AS build

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Generar cliente de Prisma si lo usas
RUN pnpm prisma generate

# Etapa 2: runtime
FROM node:lts-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY --from=build /app /app

# Variables por defecto
ENV NODE_ENV=production

EXPOSE 3000

# Comando de inicio
CMD ["pnpm", "start"]

