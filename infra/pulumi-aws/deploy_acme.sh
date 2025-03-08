#!/bin/bash

# ssh-keygen -R 13.124.130.113 && sleep 10 && rsync -avz -e 'ssh -o StrictHostKeyChecking=no -i ~/.ssh/flexyz_id_ed25519' ./.acme.sh/ ubuntu@13.124.130.113:/home/ubuntu/.acme.sh/  --rsync-path='sudo rsync'

# 변수 설정
SERVER_IP="13.124.130.113"
SSH_KEY="~/.ssh/flexyz_id_ed25519"
REMOTE_USER="ubuntu"
LOCAL_ACME_PATH="./.acme.sh/"
REMOTE_ACME_PATH="/home/ubuntu/.acme.sh/"

# SSH 호스트 키 제거 (기존 키 충돌 방지)
ssh-keygen -R "$SERVER_IP"

# 서버가 정상적으로 응답할 때까지 대기
echo "⌛ 서버 응답 대기 중..."
sleep 10

# 원격 서버의 acme.sh 폴더에 대한 소유권 변경 (권한 문제 방지)
ssh -i "$SSH_KEY" "$REMOTE_USER@$SERVER_IP" "sudo mkdir -p $REMOTE_ACME_PATH && sudo chown -R $REMOTE_USER:$REMOTE_USER $REMOTE_ACME_PATH"

# rsync로 파일 동기화 (sudo 사용)
echo "🚀 rsync로 acme.sh 동기화 중..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i $SSH_KEY" "$LOCAL_ACME_PATH" "$REMOTE_USER@$SERVER_IP:$REMOTE_ACME_PATH" --rsync-path="sudo rsync"

echo "✅ acme.sh 동기화 완료!"