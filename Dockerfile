# syntax=docker/dockerfile:1
# Web build of the Expo app. iOS/Android binaries are built with EAS, not Docker.

# ---------- test + build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG EXPO_PUBLIC_API_URL=http://localhost:8080
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL CI=1 EXPO_OFFLINE=1
# The image never ships with red tests
RUN npm test -- --ci
RUN npx expo export --platform web

# ---------- runtime ----------
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
