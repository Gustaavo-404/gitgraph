# =========================
# Dependencies
# =========================
FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Baixa o Chrome compatível com a versão do Puppeteer
RUN npx puppeteer browsers install chrome

# =========================
# Builder
# =========================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN npm run build

# =========================
# Runner
# =========================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Dependências necessárias para executar o Chrome
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Standalone do Next
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Puppeteer (o standalone não copia corretamente)
COPY --from=deps /app/node_modules/puppeteer ./node_modules/puppeteer
COPY --from=deps /app/node_modules/puppeteer-core ./node_modules/puppeteer-core
COPY --from=deps /app/node_modules/@puppeteer ./node_modules/@puppeteer

# Chrome baixado pelo Puppeteer
COPY --from=deps /root/.cache/puppeteer /root/.cache/puppeteer

EXPOSE 3000

CMD ["node", "server.js"]