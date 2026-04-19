FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
RUN apk add --no-cache su-exec

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Ensure writable mounted data directory, then drop privileges for app process
RUN mkdir -p /app/data
EXPOSE 3000

CMD ["sh", "-c", "mkdir -p /app/data && chown -R nextjs:nextjs /app/data && su-exec nextjs node server.js"]
