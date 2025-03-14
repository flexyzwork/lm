#!/bin/bash

set -e  # 오류 발생 시 스크립트 중단

# Git 커밋 메시지 인자로 받기
COMMIT_MESSAGE=${1:-"Auto commit after successful build & push"}

# OCI Registry 정보

# export OCI_USERNAME=
# export OCI_AUTH_TOKEN=
# export NEXT_PUBLIC_STRIPE_PUBLIC_KEY=

OCI_REGISTRY="kix.ocir.io/axunckhvyv1v"
SERVICES=("backend" "auth" "frontend")

# 환경 변수 설정
NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-"/api"}
NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL:-"https://learn.flexyz.work"}
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${NEXT_PUBLIC_STRIPE_PUBLIC_KEY:-"pk_test_example"}

# Docker Build & Push
echo "🔨 Building Docker images..."
for SERVICE in "${SERVICES[@]}"; do
    echo "🚀 Building $SERVICE..."
    
    # 서비스별 컨텍스트 및 Dockerfile 지정
    case $SERVICE in
      "backend")
        CONTEXT_PATH="apps/api"
        DOCKERFILE_PATH="apps/api/Dockerfile"
        ;;
      "auth")
        CONTEXT_PATH="."
        DOCKERFILE_PATH="apps/auth/Dockerfile"
        ;;
      "frontend")
        CONTEXT_PATH="apps/client"
        DOCKERFILE_PATH="apps/client/Dockerfile"
        BUILD_ARGS="--build-arg NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
                    --build-arg NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL \
                    --build-arg NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY"
        ;;
    esac

    # Docker 빌드 실행
    docker buildx build \
      --cache-from=type=gha \
      --cache-to=type=gha,mode=max \
      $BUILD_ARGS \
      -t $OCI_REGISTRY/lm-$SERVICE:latest \
      -f $DOCKERFILE_PATH $CONTEXT_PATH
done

# OCI 로그인
echo "🔑 Logging in to OCI Container Registry..."
echo "${OCI_AUTH_TOKEN}" | docker login -u "${OCI_USERNAME}" --password-stdin $OCI_REGISTRY

# Docker Push
echo "📤 Pushing Docker images..."
for SERVICE in "${SERVICES[@]}"; do
    echo "🚀 Pushing $SERVICE..."
    docker push $OCI_REGISTRY/lm-$SERVICE:latest
done

echo "✅ All Docker images built and pushed successfully!"

# Git 자동 커밋 & 푸시
echo "🔄 Checking for Git changes..."
if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "$COMMIT_MESSAGE"
    git push origin main
    echo "✅ Changes committed and pushed successfully!"
else
    echo "⚡ No changes to commit."
fi