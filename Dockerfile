FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_CANVAS_URL
ARG NEXT_PUBLIC_AGENT_HANDLE
ARG NEXT_PUBLIC_LIGHTNING_ADDRESS
ARG NEXT_PUBLIC_BITCOIN_ADDRESS
ENV NEXT_PUBLIC_CANVAS_URL=$NEXT_PUBLIC_CANVAS_URL
ENV NEXT_PUBLIC_AGENT_HANDLE=$NEXT_PUBLIC_AGENT_HANDLE
ENV NEXT_PUBLIC_LIGHTNING_ADDRESS=$NEXT_PUBLIC_LIGHTNING_ADDRESS
ENV NEXT_PUBLIC_BITCOIN_ADDRESS=$NEXT_PUBLIC_BITCOIN_ADDRESS
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001

CMD ["node", "server.js"]
