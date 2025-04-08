# Dockerfile

# 1. Usa la imagen oficial de Node.js LTS (v22)
FROM node:22-alpine AS base

# 2. Establece el directorio de trabajo
WORKDIR /usr/src/app

# 3. Copia package.json y package-lock.json
COPY package*.json ./

# 4. Instala dependencias de producción
# (Tus dependencias ya están listadas como 'dependencies', no 'devDependencies' importantes para runtime)
# Si tuvieras dependencias solo para producción, usa --omit=dev
RUN npm install

# 5. Copia el resto del código fuente
COPY . .

# 6. Expón el puerto de la aplicación (definido en .env y usado en app.js)
EXPOSE 3000

# 7. (Opcional pero recomendado) Crea y usa un usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# 8. Comando para ejecutar la aplicación (usa tu script 'start' de package.json)
# Nota: tu script start ejecuta "node src/app.js" que es correcto.
CMD [ "npm", "start" ]
