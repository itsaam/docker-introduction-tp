FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html main.js questions_defaut.js style.css vite.config.js ./
COPY public/ ./public/
ARG VITE_BASE=/
RUN npm run build -- --base="$VITE_BASE"

FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80
