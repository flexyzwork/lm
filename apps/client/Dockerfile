# 1. Next.js 빌드
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10.4.1

# 환경 변수 전달
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_LOCAL_URL
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_LOCAL_URL=$NEXT_PUBLIC_LOCAL_URL
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install 

COPY . .
RUN pnpm build || (echo "Build failed" && exit 1)

# 2. 실행 환경
FROM node:20-alpine AS runtime
RUN apk update && apk add curl

WORKDIR /app

# Next.js standalone 실행 파일만 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 불필요한 캐시 제거
RUN rm -rf .next/cache

EXPOSE 3000
CMD ["node", "server.js"]