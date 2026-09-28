FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=8080
ENV PGLITE_DIR=/data/db
ENV STORAGE_DIR=/data/files
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/public ./public
RUN mkdir -p /data/db /data/files
EXPOSE 8080
CMD ["npm", "run", "start"]
