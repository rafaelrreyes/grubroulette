# syntax=docker/dockerfile:1.7

# Local development (used by compose.yaml). Source is bind-mounted, not copied.
FROM node:26.13.0-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development \
    WEB_HOST=0.0.0.0
COPY docker/dev-entrypoint.sh /usr/local/bin/dev-entrypoint
RUN chmod +x /usr/local/bin/dev-entrypoint
EXPOSE 3337 4337
ENTRYPOINT ["dev-entrypoint"]
CMD ["npm", "run", "dev"]

FROM node:26.13.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci
COPY . .
RUN npm run build

FROM node:26.13.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --omit=dev --workspace @grub/api --include-workspace-root=false

FROM node:26.13.0-alpine AS runtime
ARG APP_VERSION=
ENV NODE_ENV=production \
    PORT=8080 \
    APP_VERSION=${APP_VERSION} \
    WEB_DIST_DIR=/app/apps/web/dist
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1
CMD ["node", "apps/api/dist/index.js"]
