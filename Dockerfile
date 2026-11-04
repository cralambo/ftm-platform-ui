# Étape 1 : Build React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build


# Étape 2 : Serveur Nginx
FROM nginx:alpine

# Supprimer la configuration Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier la configuration personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build React
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]