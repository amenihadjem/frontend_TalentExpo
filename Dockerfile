# ========================
# Stage 1: Build & Test
# ========================
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json pour installer deps
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Lancer les tests
RUN npm test

# Build du frontend
RUN npm run build

# ========================
# Stage 2: Docker final
# ========================
FROM nginx:alpine

# Copier les fichiers build depuis le builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

# Commande pour démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
