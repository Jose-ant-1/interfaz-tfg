# Etapa 1: Build con Node
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Eliminamos la página por defecto de Nginx para que no estorbe
RUN rm -rf /usr/share/nginx/html/*

# Copiamos el contenido de la carpeta dist (prueba con y sin /browser al final)
COPY --from=build /app/dist/interfaz-tfg/browser /usr/share/nginx/html

# Copiamos tu configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
