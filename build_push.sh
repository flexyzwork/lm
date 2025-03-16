#!/bin/bash

set -e  # 오류 발생 시 스크립트 중단

# ==============================
# 🔧 사용법 (Usage)
# ==============================
# 이 스크립트는 Docker 이미지를 빌드하고 OCI 컨테이너 레지스트리에 푸시한 후,
# 변경된 코드가 있을 경우 Git에 자동 커밋 및 푸시를 수행합니다.
#
# 사용 전:
# 환경변수 등록
#   export OCI_USERNAME=
#   export OCI_AUTH_TOKEN=
#   export OCI_NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
#
# 사용 예시:
#   ./build_push.sh "빌드 및 푸시 완료"
#
# - Git 커밋 메시지를 첫 번째 인자로 받을 수 있음 (기본값: "Auto commit after successful build & push")
# - OCI 컨테이너 레지스트리에 로그인하여 이미지를 푸시함
# - 변경된 파일이 있으면 Git 커밋 및 푸시 수행
#
# ==============================

# Git 커밋 메시지 인자로 받기
COMMIT_MESSAGE=${1:-"Auto commit after successful build & push"}

# OCI Registry 정보
OCI_REGISTRY="kix.ocir.io/axunckhvyv1v"
SERVICES=("backend" "auth" "frontend")

# 빌드 태그 (타임스탬프 기반)
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# 환경 변수 설정 (기본값 지정)
NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-"/api"}
NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL:-"https://learn.flexyz.work"}
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${NEXT_PUBLIC_STRIPE_PUBLIC_KEY:-"pk_test_example"}

# ==============================
# 🔨 Docker Build & Push 실행
# ==============================

echo "🔨 Building Docker images..."
for SERVICE in "${SERVICES[@]}"; do
    echo "🚀 Building & Pushing $SERVICE..."

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

    TAG_LATEST="$OCI_REGISTRY/lm-$SERVICE:latest"
    TAG_VERSIONED="$OCI_REGISTRY/lm-$SERVICE:$TIMESTAMP"

    # Docker 빌드 & 푸시
    docker manifest rm $OCI_REGISTRY/lm-$SERVICE:latest || true  # 기존 latest 삭제
    docker buildx build \
      $BUILD_ARGS \
      -t $TAG_VERSIONED -t $TAG_LATEST \
      -f $DOCKERFILE_PATH $CONTEXT_PATH --push

    echo "✅ $SERVICE image pushed: $TAG_VERSIONED"
done

# ==============================
# 🔄 Git 자동 커밋 & 푸시
# ==============================

echo "🔄 Checking for Git changes..."
if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "$COMMIT_MESSAGE"

    echo "🔄 Pulling latest changes before push..."
    git pull --rebase origin main || { echo "❌ Git pull failed! Resolve conflicts manually."; exit 1; }

    git push origin main
    echo "✅ Changes committed and pushed successfully!"
else
    echo "⚡ No changes to commit."
fi

echo "🎉 Deployment completed successfully!"