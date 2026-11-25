FROM node:22.23.5-alpine3.23@sha256:6868d4695b947ee120bffaa463fecd68cde370d7bfec92955e7c8ac576b4f475 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY index.html main.js questions_defaut.js style.css vite.config.js ./
COPY public/ ./public/
ARG VITE_BASE=/
RUN npm run build -- --base="$VITE_BASE"

FROM nginx:1.31.10-alpine-slim@sha256:c293b28729906d97fa5302fce3bd79bd27a3ea9a5d9604e21c6ff0ebf14549fc

COPY nginx.conf /etc/nginx/quiz.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

USER 101:101
EXPOSE 8080
ENTRYPOINT ["nginx", "-c", "/etc/nginx/quiz.conf", "-g", "daemon off;"]
