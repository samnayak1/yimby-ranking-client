FROM node:22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Vite inlines these at build time, so they have to be present as env during
# `npm run build` rather than injected at container runtime.
ARG VITE_COGNITO_USER_POOL_ID
ARG VITE_COGNITO_CLIENT_ID
ENV VITE_COGNITO_USER_POOL_ID=$VITE_COGNITO_USER_POOL_ID
ENV VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID

ENV NODE_OPTIONS=--max-old-space-size=512
RUN npm run build


FROM caddy:2-alpine

COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

# 443 for automatic HTTPS once SITE_ADDRESS is a real domain.
EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
