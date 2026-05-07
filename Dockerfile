# Etapa 1: Build con Node
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# 1. Limpiamos TODA la carpeta para borrar el index.html de "Welcome to nginx"
RUN rm -rf /usr/share/nginx/html/*

# 2. Copiamos el contenido de /browser DIRECTAMENTE a la raíz de html
# Fíjate en el punto al final: copia lo de ADENTRO de browser, no la carpeta browser
COPY --from=build /app/dist/interfaz-tfg/browser/ /usr/share/nginx/html/

# 3. Copiamos tu configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
